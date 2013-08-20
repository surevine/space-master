/*
 * Copyright (C) 2008-2010 Surevine Limited.
 *   
 * Although intended for deployment and use alongside Alfresco this module should
 * be considered 'Not a Contribution' as defined in Alfresco'sstandard contribution agreement, see
 * http://www.alfresco.org/resource/AlfrescoContributionAgreementv2.pdf
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
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
