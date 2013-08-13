USER_PROFILE_HTML=./user-profile.get.html.ftl
USER_PROFILE_HTML_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/templates/webscripts/org/alfresco/repository/user-profile/user-profile.get.html.ftl

echo "        Perfoming pre-patch checks"
if [ ! -f $USER_PROFILE_HTML ]
then
  echo "Usage: The $USER_PROFILE_HTML file was expected in the current directory but was not found"
  exit 5
fi

if [ ! -f $USER_PROFILE_HTML_DEST ]
then
  echo "Usage: The USER_PROFILE_HTML_DEST file was expected but was not found"
  exit 5
fi


\cp -f $USER_PROFILE_HTML $USER_PROFILE_HTML_DEST
if [ ! $? -eq 0 ]
then
  echo "An error occured copying $USER_PROFILE_HTML to $USER_PROFILE_HTML_DEST.  Aborting"
  exit 5
fi
