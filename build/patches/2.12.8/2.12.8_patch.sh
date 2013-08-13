REPO_ESL_JAR_FILE=./repo.esl.module.jar
REPO_ESL_JAR_FILE_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib

SPRING_CONFIG=./module-context.xml
SPRING_CONFIG_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/module/repo.esl.module/module-context.xml

echo "        Perfoming pre-patch checks"
if [ ! -f $REPO_ESL_JAR_FILE ]
then
  echo "Usage: The $REPO_ESL_JAR_FILE file was expected but was not found"
  exit 5
fi

if [ ! -f $SPRING_CONFIG ]
then
  echo "Usage: The $SPRING_CONFIG file was expected but was not found"
  exit 5
fi

echo "        Perfoming patch"

\cp -f $REPO_ESL_JAR_FILE $REPO_ESL_JAR_FILE_DEST
\cp -f $SPRING_CONFIG $SPRING_CONFIG_DEST
