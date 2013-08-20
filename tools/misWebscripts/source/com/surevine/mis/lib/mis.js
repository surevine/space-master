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
function removeCommentsFromList(listOfNodes)
{
	var out = new Array(listOfNodes.length);
    var outIdx=0;
	for (i=0; i < listOfNodes.length; i++)
	{
		try {
			node = listOfNodes[i];
			out[outIdx]=new Object();
			if (! (node.type=='{http://www.alfresco.org/model/forum/1.0}post' 
				&& node.parent.name=='Comments' 
				&& (node.parent.parent.parent.type=='{http://www.alfresco.org/model/content/1.0}content' || node.parent.parent.parent.type=='{http://www.alfresco.org/model/content/1.0}folder')) 
				)
			{
				out[outIdx].node=node;
				out[outIdx].modTime=node.properties['{http://www.alfresco.org/model/content/1.0}modified'];
				out[outIdx].id=++outIdx;
			}
			else
			{ // If we drop in here the node is a comment
		      logger.log("Skipping node "+node+" as it looks like a comment");
			}
			//We're not actually going to use either of the next three variables, but we do want to throw 
			//and catch an exception if there's an error retrieving them
			var modifierFirstName = node.properties["cm:modifier"].properties["cm:firstName"];
			var modifierSurname = node.properties["cm:modifier"].properties["cm:lastName"];
			var modifier = node.properties['cm:modifier'];
		}
		catch (error)
		{
			logger.log("Skipping node: "+listOfNodes[i]+" due to access issues");
			continue;
		}
	}
	return trimToSize(out, outIdx);
}

//Initially implemented without this function and using push() at lines 13 and 21.  But the usage of push()
//seems not to preserve ordering, so having to use this slightly inelegant approach
function trimToSize(listOfNodes, size)
{
	var out = new Array(size);
	for (var i=0; i < size; i++)
	{
	  out[i]=listOfNodes[i];
	}
	return out;
}

function findDocumentsWithoutComments(luceneQuery)
{
	var nodes = search.luceneSearch(query+"-TYPE:\"fm:topic\" -TYPE:\"cm:folder\" -TYPE:\"cm:thumbnail\" -TYPE:\"act:compositeaction\" -TYPE:\"act:action\"", "@cm:modified", false);
	return removeCommentsFromList(nodes);
}
