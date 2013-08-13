IE7_CSS=./ie7.css
IE7_CSS_DEST=/opt/alfresco/tomcat/webapps/share/css/ie7.css

echo "        Perfoming pre-patch checks"
if [ ! -f $IE7_CSS ]
then
  echo "Usage: The $IE7_CSS file was expected in the current directory but was not found"
  exit 5
fi

if [ ! -f $IE7_CSS_DEST ]
then
  echo "Usage: The IE7_CSS_DEST file was expected but was not found"
  exit 5
fi


\cp -f $IE7_CSS $IE7_CSS_DEST
if [ ! $? -eq 0 ]
then
  echo "An error occured copying $IE7_CSS to $IE7_CSS_DEST.  Aborting"
  exit 5
fi
