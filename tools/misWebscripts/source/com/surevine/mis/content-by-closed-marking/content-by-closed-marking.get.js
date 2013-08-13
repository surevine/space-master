<import resource="classpath:/alfresco/webscripts/com/surevine/mis/lib/mis.js">


var siteName=url.templateArgs.site;
var sitePart="/st:sites";
if (siteName!=null)
{
  sitePart +="/cm:"+siteName; 
}

logger.log("Starting content-by-organisation-script");
var query = "+PATH:\"/app:company_home"+sitePart+"//*\" +@es\\:closedMarkings: \""+url.templateArgs.marking+"\"";


model.results=findDocumentsWithoutComments(query);