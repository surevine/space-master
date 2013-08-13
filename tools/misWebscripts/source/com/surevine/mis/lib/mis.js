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