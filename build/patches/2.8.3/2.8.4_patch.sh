
SINGLE_GROUP_SELECTOR=./single-group-selector.js
ENHANCED_SECURITY_SELECTOR=./enhanced-security-selector.js
SINGLE_GROUP_SELECTOR_DEST=$ALFRESCO_HOME/tomcat/webapps/share/components/enhanced-security/advanced-group-selector/single-group-selector-min.js
ENHANCED_SECURITY_SELECTOR_DEST=$ALFRESCO_HOME/tomcat/webapps/share/components/enhanced-security/selector/enhanced-security-selector-min.js

echo "        Performing pre-patch checks"
if [ ! -f $SINGLE_GROUP_SELECTOR ]
then
    echo "Usage: The $SINGLE_GROUP_SELECTOR file is expected in the current directory but was not found"
    exit 5
fi

if [ ! -f $SINGLE_GROUP_SELECTOR_DEST ]
then
    echo "Usage: The $SINGLE_GROUP_SELECTOR_DEST is expected but was not found"
    exit 5
fi

if [ ! -f $ENHANCED_SECURITY_SELECTOR ]
then
    echo "Usage: The $ENHANCED_SECURITY_SELECTOR file is expected in the current directory but was not found"
    exit 5
fi

if [ ! -f $ENHANCED_SECURITY_SELECTOR_DEST ]
then
    echo "Usage: The $ENHANCED_SECURITY_SELECTOR_DEST file is expected but was not found"
    exit 5
fi

\cp -f $SINGLE_GROUP_SELECTOR $SINGLE_GROUP_SELECTOR_DEST
if [ ! $? -eq 0 ]
then
    echo "An error occured copying $SINGLE_GROUP_SELECTOR to $SINGLE_GROUP_SELECTOR_DEST.  Aborting."
    exit 5
fi 

\cp -f $ENHANCED_SECURITY_SELECTOR $ENHANCED_SECURITY_SELECTOR_DEST
if [ ! $? -eq 0 ]
then
    echo "An error occured copying $ENHANCED_SECURITY_SELECTOR to $ENHANCED_SECURITY_SELECTOR_DEST.  Aborting."
    exit 5
fi