/**
 * A simple script designed to provide metrics on the fidelity of document preview.
 * 
 * Run with no parameters, this script examines every document (wiki pages, discussions and system files are ignored)
 * and records whether it has a preview and/or thumbnail created, whether it has a failure record for the preview or thumbnail
 * or whether the preview or thumbnail is simply missing.
 * 
 * Results are then summarised by file extension.
 * 
 * An optional parameter named 'filter' can be supplied to restrict the results to those matching a specific lucene search term,
 * usually a date range.  Multiple paramaters could be supplied with AND statements or even brackets, although it should be noted
 * that this has not been fully tested - at present we only intend to use this script with date ranges.
 * 
 * To install the script, simply log into Alfresco Explorer as admin and upload it to the following location:
 * 
 * Company Home -> Data Dictionary -> Scripts
 * 
 * To execute the script, visit the following URL as admin:
 * 
 * http://backend.box/alfresco/command/script/execute?scriptPath=/Company Home/Data Dictionary/Scripts/summarise-previews.js
 * 
 * To execute the script with a date range, use:
 * 
 * http://backend.box/alfresco/command/script/execute?scriptPath=/Company%20Home/Data%20Dictionary/Scripts/summarise-previews.js&filter=@cm\:modified:[2013-5-20T00:00:00%20TO%202013-6-25T00:00:00]
 * 
 * Or, more simply:
 * 
 * http://backend.box/alfresco/command/script/execute?scriptPath=/Company%20Home/Data%20Dictionary/Scripts/summarise-previews.js&filter=@cm\:modified:[2013-5-20T00:00:00%20TO%20NOW]
 * 
 * 
 * Note that this script uses a lucene search under the hood.  This means that there will be a results cut-off at 10,000 results
 * or after 100 seconds have been spent computing security for the search.  This should be sufficent to retrieve statistically 
 * useful results (in fact, on production this will probably retrieve the full result set).
 * 
 * On versions of Space prior to 3.1.1, however, these limits are 1,000 results and 10 seconds, which may be more limiting. This
 * can be changed in repository.properties.  The relevant properties are:
 * 
 * system.acl.maxPermissionCheckTimeMillis
 * system.acl.maxPermissionChecks
 * 
 * One final note - the results here require expert interpretation to be useful as there are many legitimate reasons why a 
 * document might be missing a preview aside from system error.  Raw results should not usually be shared with non-technical 
 * stakeholders, as they will misinterpret them.
 */

var HOSTNAME='INSERT.SPACE.HOSTNAME.HERE.IN.SCRIPT.FILE';


function main() {
    var result;
    var queryString="+ASPECT:\"{http://www.alfresco.org/model/enhancedSecurity/0.3}enhancedSecurityLabel\" +TYPE:\"cm:content\""
    if (args["filter"]) {
    	queryString=queryString+" +("+args["filter"]+")";
    }
    var exclude="";
    if (args["exclude"]) {
    	exclude=args["exclude"];
    }
    logger.log("Query String: "+queryString);
    
    var results = search.query({"query": queryString});
    logger.log("Found " +results.length +" content items matching the filter");

    var result = {};
    result.summary={};
    result.summary.total=0;
    result.summary.filter=args["filter"];

    for (var i = 0; i<results.length; i++) {
    	if (exclude.indexOf(results[i].nodeRef) > -1) {
    		continue;
    	}
    	try {
	        var name = results[i].name;
	        logger.log('Name:  '+name);
	        logger.log('Parent:  '+results[i].parent.name);
	        var type=results[i].type;
	        logger.log('Type:  '+type);
	        if (type=='{http://www.alfresco.org/model/forum/1.0}post' || results[i].parent.name=='wiki') {
	        	continue;
	        }
	        
	        result.summary.total++
	        var extensionPosition = name.lastIndexOf('.');
	        var extension="none";
	        if (extensionPosition > -1) {
		        extension = name.substring(extensionPosition+1);
		    }
	        logger.log('Extension:  |'+extension+'|');
	        if (!result[extension]) {
				var obj={}        
	        	obj.total=0;
	        	obj.hasDoclib=0;
	        	obj.hasDoclibFailed=0;
	        	obj.hasImgPreview=0;
	        	obj.hasImgPreviewFailed=0;
	        	obj.items=[];
	        	result[extension]=obj;
	        }
	        logger.log("Object:  "+result[extension]);
	        result[extension].total++;
	        var item={};
	        item.path=results[i].displayPath+'/'+results[i].name;
	        item.nodeRef=results[i].nodeRef;
	        result[extension].items.push(item);
	        
	        if (results[i].hasAspect("cm:failedThumbnailSource")) {
		        result[extension].thumbnailFailedAspect++;
	        }
	        
	        var children=results[i].children;
	        for (var j=0; j<children.length; j++) {
	        	
	        	var parentAss=children[j].primaryParentAssoc;
	        	if (parentAss!=null && parentAss.parentRef!=null && parentAss.parentRef!=null) {
		        	var childName=parentAss.getQName().localName;
		        	logger.log("Inspecting: "+childName);
		        	if (childName=="doclib") {
		        		if (children[j].type=="{http://www.alfresco.org/model/content/1.0}failedThumbnail") {
		        			result[extension].hasDoclibFailed++;
		        		}
		        		else {
			        		result[extension].hasDoclib++;
			        	}
		        	}
		        	if (childName=="imgpreview") {
		        		if (children[j].type=="{http://www.alfresco.org/model/content/1.0}failedThumbnail") {
		        			result[extension].hasImgPreviewFailed++;
		        		}
		        		else {
			        		result[extension].hasImgPreview++;
			        	}
		        	}
	        	}
	        }
	    }
    	catch (e) 
    	{
    		logger.warn("Node " +results[i].nodeRef +" failed with: " +e);
            continue;
    	}
    }
    return formatResults(result);
}

function formatResults(results) {
	var out="";
	out+="<p>"+results.summary.total+" results returned";
	if (results.summary.filter) {
		out+=" using the filter <pre>"+results.summary.filter+"</pre>"
	}
	out+="</p><p></p>";
	out+='<h1>Summary</h1>';
	out+="<table border='1' style='border-spacing:0px;'>";
	out+="  <tr><th>File Extension</th><th>Number of Documents</th><th>%age of previews generated</th><th>%age of thumbnails generated</th>";
	for (var i in results) {
		if (i=='summary') {
			continue;
		}
		var total=results[i].total;
		var thumbnails=results[i].hasDoclib;
		var thumbnailsFailed=results[i].hasDoclibFailed;
		var previews=results[i].hasImgPreview;
		var previewsFailed=results[i].hasImgPreviewFailed;

		
		out+="  <tr>";
		out+="    <td>"+i+"</td>";
		out+="    <td>"+total+"</td>";
		out+="    <td>"+Math.round(previews/total*100)+"%";
		if (previews<total) {
			out+="(";
			if (previewsFailed>0) {
				out+=previewsFailed+" failed";
			}
			if (previews+previewsFailed<total) {
				if (previewsFailed>0) {
					out+=" & ";
				}
				out+=(total-previews-previewsFailed)+" missing"
			}
			out+=")";
		}
		out+="</td>";
		out+="    <td>"+Math.round(thumbnails/total*100)+"%";
		if (thumbnails<total) {
			out+="(";
			if (thumbnailsFailed>0) {
				out+=thumbnailsFailed+" failed";
			}
			if (thumbnails+thumbnailsFailed<total) {
				if (thumbnailsFailed>0) {
					out+=" & ";
				}
				out+=(total-thumbnails-thumbnailsFailed)+" missing"
			}
			out+=")";
		}
		out+="</td>";
		out+="  </tr>";
	}
	out+="</table>";
	out+='<p/>'
	out+='<h1>Individual Items</h1>';
	for (var i in results) {
		if (i=='summary') {
			continue;
		}
		out+='<em style"display:inline">'+i+' files (<a href="#'+i+'" onclick="document.getElementById(\''+i+'\').style.cssText=\'\';">show</a>)</em><p>';
		out+='<div style="display:none;" id="'+i+'">';
		for (var j in results[i].items) {
			var rawPath=results[i].items[j].path; //Get the primary path
			var pathAfterConstant=rawPath.substring(20); //Remove the 'Company Home/Sites/' bit
			var sitePosition=pathAfterConstant.indexOf('/'); //Index of the / after the site name
			var site=pathAfterConstant.substring(0, sitePosition); //Get the site name
			var path=site+'/'+pathAfterConstant.substring(sitePosition+17); //Get the path within the document library (ie. remove the '/documentLibrary' bit)
			out+='<a href="http://'+HOSTNAME+'/share/page/site/sandbox/document-details?nodeRef='+results[i].items[j].nodeRef+'">'+path+'</a>';
			out+='<br/>';
		}
		out+='</p></div>';
	}
	return out;
}

main();