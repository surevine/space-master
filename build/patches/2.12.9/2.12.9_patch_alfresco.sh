PRESENCE_JAR_FILE=./alfresco_presence-2.12.9.patch.jar
PRESENCE_JAR_FILE_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib/

echo "        Perfoming pre-patch checks"
if [ ! -f $PRESENCE_JAR_FILE ]
then
  echo "Usage: The $PRESENCE_JAR_FILE file was expected but was not found"
  exit 5
fi

PRESENCE_JARS=($(find /opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib/ -maxdepth 1 -name "alfresco_presence*.jar"))
if [ ${#PRESENCE_JARS[@]} != 1 ]; then
  echo "Expected only 1 presence module but found ${#PRESENCE_JARS[@]}. Aborting."
  exit 5
fi

echo "        Perfoming patch"

\cp -f $PRESENCE_JAR_FILE ${PRESENCE_JARS[0]}
