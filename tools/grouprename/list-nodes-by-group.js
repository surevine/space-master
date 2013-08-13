function hasGroup(groups, targetGroup) {
    if (groups) {
        if (groups.indexOf(",") > -1) {
            return groups.split(",").indexOf(targetGroup) > -1;
        } else {
            return groups == targetGroup;
        }
    }

    return false;
}

function main() {
    var result;
    var skipNodes = args["skipNodes"];
    var targetGroup = args["group"];
    var targetType  = args["type"].toLowerCase();

    logger.log("targetGroup " +targetGroup);
    logger.log("targetType " +targetType);

    var results = search.query({"query": "+ASPECT:\"{http://www.alfresco.org/model/enhancedSecurity/0.3}enhancedSecurityLabel\""});

    logger.log("Found " +results.length +" items with a security label.");

    var result = "";
    var count = 0;

    for (var i = 0; i<results.length; i++) {
        if (skipNodes.indexOf(results[i].nodeRef) > -1) {
            logger.warn("Skipping nodeRef: " +results[i].nodeRef);
            continue;
        }

        var organisations = results[i].properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}organisations"];
        var closedMarkings = results[i].properties["{http://www.alfresco.org/model/enhancedSecurity/0.3}closedMarkings"];

        try {
            results[i].displayPath;
        } catch (e) {
            logger.warn("Node " +results[i].nodeRef +" failed with: " +e);
            continue;
        }

        if (targetType === "organisations" && hasGroup(organisations, targetGroup)) {
            result += results[i].nodeRef +"|" +results[i].displayPath +"/" +results[i].name +"\n";
            count++;
        } else if (targetType === "closed" && hasGroup(closedMarkings, targetGroup)) {
            result += results[i].nodeRef +"|" +results[i].displayPath +"/" +results[i].name +"\n";
            count++;
        }
    }

    logger.log(count +" items have the group " +targetGroup +".");

    return result;
}

main();
