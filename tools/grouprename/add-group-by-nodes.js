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
var count = 0;

function addGroup(collection, group) {
    if (!collection) collection = [];

    logger.log("AddGroup:        Adding Group "+group+" to collection "+collection+" with "+collection.length+" elements");
    
    if (collection.length > 0) {
    	logger.log("AddGroup:        Collection has pre-existing groups")

        if (collection.join(" ").indexOf(group) > -1) {
            return {"hasChanges": false, "content": collection};
        }
    	collection.push(group);
        count++;
        return {"hasChanges": true, "content": collection};
    } else {
    	logger.log("AddGroup:        Collection has no pre-existing groups")
        count++;
    	collection=[];
    	collection.push(group);
        return {"hasChanges": true, "content": collection};
    }
}

// Need to break this out as is Java array under the covers and so doesn't .toString nicely
function renderGroups(groups) {
	try {
		var rV="[";
		for (var i=0; i < groups.length; i++) {
			rV=rV+groups[i]+" ";
		}
		return rV+"]";
	}
	catch (e) {
		return "Could not render groups list: "+e;
	}
}

function main() {
    var result = "";

    logger.log("AddGroup:  Running add group by nodeRefs");

    var targetGroup = args["group"];
    var targetNodes = args["nodeRefs"];
    var targetType = args["type"].toLowerCase();

    var nodeRefs = targetNodes.split("\n");
    
    logger.log("AddGroup:  Parameters supplied - targetGroup = "+targetGroup+" & targetType = "+targetType+" & nodeRefs = ("+targetNodes.length+" nodes)");

    for (var i = 0; i<nodeRefs.length; i++) {
    	logger.log("AddGroup:  Processing node with index "+i);
    	
    	var saveChanges=false;
        var nodeRef = nodeRefs[i].substring(0, nodeRefs[i].indexOf('|'));
        logger.log("AddGroup:    NodeRef = "+nodeRef);
        var path = nodeRefs[i].substring(nodeRefs[i].indexOf('|')+1);
        logger.log("AddGroup:    Path = "+path);
        var node;
        try {
            node = search.findNode(nodeRef);
            logger.log("AddGroup:    Succesfully found the node "+nodeRef+" = "+node);
        } catch (e) {
            logger.warn("AddGroup:    Failed to findNode(" +nodeRef +"). Perhaps it doesn't exist. The expected path was:" +path);
            continue;
        }

        if (targetType === "organisation") {
            var organisations = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}organisations"];
            var groups = addGroup(organisations, targetGroup);
            if (groups.hasChanges) {
            	saveChanges=true;
                logger.log("Setting organisations to " +groups.content);
                node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}organisations"] = groups.content;
            }
        } else if (targetType === "closed") {
            var closedMarkings = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"];
            logger.log("AddGroup:    Existing closed markings = "+renderGroups(closedMarkings));
            var groups = addGroup(closedMarkings, targetGroup);
            logger.log("AddGroup:    New closed markings = "+renderGroups(groups.content));
            if (groups.hasChanges) {
            	saveChanges=true;
                logger.log("AddGroup:    Groups have changed so setting closedMarkings to " +groups.content);
                node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"] = groups.content;
                logger.log("AddGroup:    Markings set but not saved");
            }
            else {
                logger.log("AddGroup:    Groups have not changed so no changes required");
            }
        } else if (targetType === "open") {
            var closedMarkings = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}openMarkings"];
            var groups = addGroup(openMarkings, targetGroup);
            if (groups.hasChanges) {
            	saveChanges=true;
                logger.log("Setting openMarkings to " +groups.content);
                node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}openMarkings"] = groups.content;
            }
        }

        if (saveChanges) {
            try {
                node.save();
                logger.log("AddGroup:    Successfully updated " +nodeRef +" with path:\n" +path);
            } catch (e) {
                logger.log("AddGroup:    Failed to update " +nodeRef +" with path:\n" +path +" due to: " +e);
                count--;
            }
        } else {
            logger.log("AddGroup:    Group " +targetGroup +" already on " +nodeRef +" with path:\n" +path);
        }
    }

    if (count > 0) {
        logger.log("AddGroup:  Added " +targetGroup +" to " +count +" nodes.");
    } else {
        logger.log("AddGroup:  No changes made.");
    }

    return result;
}

main();
