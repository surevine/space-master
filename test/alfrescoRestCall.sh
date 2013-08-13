set +x
#Tested on Mac OSX Snow Leopard but should work on any bash instance with a reasonably recent curl
# Usage: alfrescoRestCall.sh {url} {username} {password}
# If you have any errors try removing the redirects to get more information


# The service to be called, and a url-encoded version (the url encoding isn't perfect, if you're encoding complex stuff you may wish to replace with a different method)
DEST=$1
ENCODED_DEST=`echo $DEST | perl -p -e 's/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg' | sed 's/%2E/./g' | sed 's/%0A//g'`

#IP Addresses or hostnames are fine here - may have to use hostnames on site to work around proxy server
CAS_HOSTNAME=79.125.19.164

#Authentication details.  This script only supports username/password login, but curl can handle certificate login if required
USERNAME=$2
PASSWORD=$3

#Temporary files used by curl to store cookies and http headers
COOKIE_JAR=.cookieJar
HEADER_DUMP_DEST=.headers
rm $COOKIE_JAR
rm $HEADER_DUMP_DEST


#The script itself is below

#Visit CAS and get a login form.  This includes a unique ID for the form, which we will store in CAS_ID and attach to our form submission.  jsessionid cookie will be set here
CAS_ID=`curl -k -c $COOKIE_JAR https://$CAS_HOSTNAME/cas/login?service=$ENCODED_DEST | grep name=.lt | sed 's/.*value..//' | sed 's/\".*//'`

#Submit the login form, using the cookies javed in the cookie jar and the form submission ID just extracted.  We keep the headers from this request as the return value should be a 302 including a "ticket" param which we'll need in the next request
curl -k --data "username=$USERNAME&password=$PASSWORD&lt=$CAS_ID&_eventId=submit&submit=Sign%20In" -i -b $COOKIE_JAR -c $COOKIE_JAR https://$CAS_HOSTNAME/cas/login?service=$ENCODED_DEST > $HEADER_DUMP_DEST 2> /dev/null

#Linux may not need this line but my response from the previous call was retrieving windows-style linebreaks
dos2unix $HEADER_DUMP_DEST > /dev/null
 
#Visit the URL with the ticket param to finally set the casprivacy and, more importantly, MOD_AUTH_CAS cookie.  Now we've got a MOD_AUTH_CAS cookie, anything we do in this session will pass straight through CAS 
CURL_DEST=`cat < $HEADER_DUMP_DEST | grep Location | sed 's/Location: //'`
curl -k -b $COOKIE_JAR -c $COOKIE_JAR $CURL_DEST > /dev/null 2>&1

#Visit the place we actually wanted to go to
curl -k -b $COOKIE_JAR  "$DEST" 2>/dev/null
