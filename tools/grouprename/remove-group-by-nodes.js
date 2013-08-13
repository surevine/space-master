var count = 0;

function removeGroup(collection, group) {
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
