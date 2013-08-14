MY_GROUPS_FILE=./my-groups.get.html.ftl
MY_GROUPS_FILE_DEST=/opt/alfresco/tomcat/webapps/share/WEB-INF/classes/alfresco/webscripts/com/surevine/alfresco/webscripts/sv-theme/dashlets/my-groups/my-groups.get.html.ftl

echo "        Perfoming pre-patch checks"
if [ ! -f $MY_GROUPS_FILE ]
then
  echo "Usage: The $MY_GROUPS_FILE file was expected but was not found"
  exit 5
fi

echo "        Perfoming patch"

\cp -f $MY_GROUPS_FILE $MY_GROUPS_FILE_DEST
