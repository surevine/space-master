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
    if (!collection) collection = "";

    if (collection.indexOf(",") > -1) {
        var items = collection.split(",");

        if (items.indexOf(group) > -1) {
            return {"hasChanges": false};
        }

        items.push(group);
        count++;
        return {"hasChanges": true, "content": items};
    } else {
        if (collection == group) {
            return {"hasChanges": false};
        } else {
            count++;
            return {"hasChanges": true, "content": [group]};
        }
    }
}

function main() {
    var result = "";

    logger.log("Running add group by nodeRefs");

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
            var groups = addGroup(organisations, targetGroup);
            if (groups.hasChanges) {
                logger.log("Setting organisations to " +groups.content);
                node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}organisations"] = groups.content;
            }
        } else if (targetType === "closed") {
            var closedMarkings = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"];
            var groups = addGroup(closedMarkings, targetGroup);
            if (groups.hasChanges) {
                logger.log("Setting closedMarkings to " +groups.content);
                node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"] = groups.content;
            }
        } else if (targetType === "open") {
            var closedMarkings = node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}openMarkings"];
            var groups = addGroup(openMarkings, targetGroup);
            if (groups.hasChanges) {
                logger.log("Setting openMarkings to " +groups.content);
                node.properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}openMarkings"] = groups.content;
            }
        }

        if (count > 0) {
            try {
                node.save();
                logger.log("Successfully updated " +nodeRef +" with path:\n" +path);
            } catch (e) {
                logger.log("Failed to update " +nodeRef +" with path:\n" +path +" due to: " +e);
                count--;
            }
        } else {
            logger.log("Group " +targetGroup +" already on " +nodeRef +" with path:\n" +path);
        }
    }

    if (count > 0) {
        logger.log("Added " +targetGroup +" to " +count +" nodes.");
    } else {
        logger.log("No changes made.");
    }

    return result;
}

main();
