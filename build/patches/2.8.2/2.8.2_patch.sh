
SEARCH_LIB_JS=./search.lib.js
SEARCH_LIB_JS_DEST=$ALFRESCO_HOME/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/templates/webscripts/org/alfresco/slingshot/search/search.lib.js

echo "        Performing pre-patch checks"
if [ ! -f $SEARCH_LIB_JS ]
then
    echo "Usage: The $SEARCH_LIB_JS file is expected in the current directory"
    exit 5
fi

if [ ! -f $SEARCH_LIB_JS_DEST ]
then
    echo "Usage: The $SEARCH_LIB_JS_DEST file is expected but was not found"
    exit 5
fi

echo "        Updating search.lib.js"
cp -f $SEARCH_LIB_JS $SEARCH_LIB_JS_DEST