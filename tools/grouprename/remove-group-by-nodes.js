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

function removeGroup(collection, group) {
    if (!collection) collection = [];

    logger.log("RemoveGroup:        Removing Group "+group+" from collection "+collection+" with "+collection.length+" elements");
    
    if (collection.length > 0) {
    	logger.log("RemoveGroup:        Collection has pre-existing groups")

    	var rV=[];
    	var hasChanges=false;
    	for (var i=0; i < collection.length; i++) {
    		if (collection[i] == group) {
    		    logger.log("RemoveGroup:        Removing group "+collection[i]);
    		    hasChanges=true;
    		    count++;
    		}
    		else {
    			rV.push(collection[i]);
    		    logger.log("RemoveGroup:        Maintaining group "+collection[i]);
    		}
    	}
    	return {"hasChanges": hasChanges, "content": rV};
    } else {
        return {"hasChanges": true, "content": collection};

    }
}

function old_removeGroup(collection, group) {
    if (collection.indexOf(",") > -1) {
        var items = collection.split(",");

        for (var i = 0; i<items.length; i++) {
            items.splice(i, 1);
            count++;
            return {"hasChanges": true, "content": items};
        }
        
        return {"hasChanges": false};
    } else {
        if (collection == group) {
            count++;
            return {"hasChanges": true, "content": []};
        } else {
            return {"hasChanges": false};
        }
    }
}

function main() {
    var result = "";

    logger.log("Running remove group by nodeRefs");

    var targetGroup = args["group"];
    var targetNodes = args["nodeRefs"];
    var targetType = args["type"].toLowerCase();

    var nodeRefs = targetNodes.split("\n");
    for (var i = 0; i<nodeRefs.length; i++) {
        var nodeRef = nodeRefs[i].substring(0, nodeRefs[i].indexOf('|'));
        var path = nodeRefs[i].substring(nodeRefs[i].indexOf('|')+1);

        var node;
        try {
            node = search.findNode(nodeRef);
        } catch (e) {
            logger.warn("Failed to findNode(" +nodeRef +"). Perhaps it doesn't exist. The expected path was:\n" +path);
            continue;
        }

        if (targetType === "organisation") {
            var organisations = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}organisations"];
            if (organisations) {
                var removed = removeGroup(organisations, targetGroup);
                if (removed.hasChanges) {
                    node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}organisations"] = removed.content;
                }
            }
        } else if (targetType === "closed") {
            var groups = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"];
            if (groups) {
                var removed = removeGroup(groups, targetGroup);
                if (removed.hasChanges) {
                    node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"] = removed.content;
                }
            }
        } else if (targetType === "open") {
            var groups = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}openMarkings"];
            if (groups) {
                var removed = removeGroup(groups, targetGroup);
                if (removed.hasChanges) {
                    node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}openMarkings"] = removed.content;
                }
            }
        }

        if (count > 0) {
            try {
                node.save();
                logger.log("Successfully updated " +nodeRef +" with path:\n" +path);
            } catch (e) {
                logger.log("Failed to update " +nodeRef +" with path:\n:" +path +" due to: " +e);
                count--;
            }
        } else {
            logger.log("Group " +targetGroup +" not found on " +nodeRef +" with path:\n" +path);
        }
    }

    if (count > 0) {
        logger.log("Removed " +targetGroup +" from " +count +" nodes.");
    } else {
        logger.log("No changes made.");
    }

    return result;
}

main();
