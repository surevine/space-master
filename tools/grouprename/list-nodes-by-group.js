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
function main() {
	var skipNodes = args["skipNodes"];
	var targetGroup = args["group"];
	var targetType = args["type"].toLowerCase();

	logger.log("targetGroup " + targetGroup);
	logger.log("targetType " + targetType);

	var results;

	if (targetType === "closed") {
		logger.log("Searching for closed group: \@\\{http\\://www.alfresco.org/model/enhancedSecurity/0.3\\}closedMarkings:\""+targetGroup+"\""});
		results = search.query({"query": "\@\\{http\\://www.alfresco.org/model/enhancedSecurity/0.3\\}closedMarkings:\""+targetGroup+"\""});
	} else if (targetType === organisations{
		logger.log("Searching for closed group: \@\\{http\\://www.alfresco.org/model/enhancedSecurity/0.3\\}organisations:\""+targetGroup+"\""};
		results = search.query({"query": "\@\\{http\\://www.alfresco.org/model/enhancedSecurity/0.3\\}organisations:\""+targetGroup+"\""});
	} else {
		logger.log("Please specify a valid target type");
		results = [];
	}

	logger.log("Found " + results.length + " items with a security label.");

	var result = "";
	var count = 0;

	for (var i = 0; i < results.length; i++) {
		if (skipNodes.indexOf(results[i].nodeRef) > -1 {
			logger.warn("Skipping nodeRef: " + results[i].nodeRef);
			continue;
		}

		try {
			results[i].displayPath;
		} catch (e) {
			logger.warn("Node " + results[i].nodeRef + " failed with: " + e);
			continue;
		}

		result += results[i].nodeRef + "|" + results[i].displayPath + "/" + results[i].name + "\n";
		count++;
	}

	logger.log(count + " items have the group " + targetGroup + ".");

	return result;
}

main();