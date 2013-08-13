#!/bin/bash

# Logging level definitions
DEBUG=1
INFO=2
WARN=3
ERROR=4

#Global parameters
LOAD_LOG_LEVEL=$DEBUG
TMP_DEST=/tmp/alf_add_siteManager

################
#
#  Logs into Alfresco using CAS and stores the relevant cookies under
#  /tmp/alfloader/{userName} for other functions to reuse
#
#  Parameters:
#       1 - Alfresco Share host
#       2 - CAS host
#       3 - Username to pass to CAS
#       4 - Password for the above user.  Certs not yet supported, but could be if reqd
################
function createSession {
    DEST=http://$1/share/page/people-finder # This is a nice quick page to return
    CAS_HOSTNAME=$2
    USERNAME=$3
    PASSWORD=$4
    
    log "Creating a new session for $USERNAME" $INFO
    log "    Using password $PASSWORD" $DEBUG
        
    #Create temp directory if it doesn't already exist
    mkdir -p $TMP_DEST
    
    # URL-encode the destination (encoding method isn't perfect, may require upgrading in future)
    ENCODED_DEST=`echo $DEST | perl -p -e 's/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg' | sed 's/%2E/./g' | sed 's/%0A//g'`

    # Set up some temporary files to be used by cURL
    COOKIE_JAR=$TMP_DEST/.cookieJar.$3   # Name the cookie jar after the user to support multiple sessions
    HEADER_DUMP_DEST=$TMP_DEST/.headers.$$  # Name headers file after the process to allow multiple runs at once
    
    # Visit CAS and get a login form. This includes a unique ID for the form, which we will 
    # store in CAS_ID and attach to our form submission. jsessionid cookie will be set here 
    CAS_ID=`curl -Ss -k -c $COOKIE_JAR https://$CAS_HOSTNAME/cas/login?service=$ENCODED_DEST | grep name=.lt | sed 's/.*value..//' | sed 's/\".*//'`

    # Submit the login form, using the cookies saved in the cookie jar and the form submission 
    # ID just extracted. We keep the headers from this request as the return value should 
    # be a 302 including a "ticket" param which we'll need in the next request
    curl -sS -k --data "username=$USERNAME&password=$PASSWORD&lt=$CAS_ID&_eventId=submit&submit=Sign%20In" -i -b $COOKIE_JAR -c $COOKIE_JAR "https://$CAS_HOSTNAME/cas/login?service=$ENCODED_DEST" > $HEADER_DUMP_DEST 2> /dev/null

    # Linux may not need this line but my response from the previous call retrieves
    # windows-style linebreaks in OSX
    dos2unix $HEADER_DUMP_DEST > /dev/null 2>&1
    
    # Visit the URL with the ticket param to finally set the casprivacy and, more importantly, 
    # MOD_AUTH_CAS cookie. Now we've got a MOD_AUTH_CAS cookie, anything we do in this 
    # session will pass straight through CAS
    CURL_DEST=`cat < $HEADER_DUMP_DEST | grep Location | sed 's/Location: //'` 
    curl -k -b $COOKIE_JAR -c $COOKIE_JAR $CURL_DEST > /dev/null 2>&1
    
    # We now need to do a GET into alfresco before we can start doing any other requests,
    curl -k -b $COOKIE_JAR "$DEST" >/dev/null 2>/dev/null
    
    #We don't need the headers file anymore, so clean it up
    #rm -f $HEADER_DUMP_DEST
    
    log "Session created for $USERNAME at $COOKIE_JAR" $DEBUG
}

################
#
# Logs a message.  Log level is set with LOAD_LOG_LEVEL
#
# Parameters
#   1 - Message to log
#   2 - Level. See definitions at the start of this file
################
function log {
    MSG=$1
    LEVEL=$2
    
    if [ $LEVEL -ge $LOAD_LOG_LEVEL ]
    then
        echo $1
    fi
}

function makeUserSiteManager {
    USER=$1
    SITE=$2
    HOST=$3

    log "Using cookie jar at $COOKIE_JAR" $DEBUG    
    curl -b $COOKIE_JAR -F foo=bar $HOST/share/proxy/alfresco/api/groups/site_"$SITE"_SiteManager/children/$USER
}

createSession 10.66.2.203 10.66.2.203 user0017-org01 '9crZ3k6NTyWX93tL'
makeUserSiteManager user0004-org01 sandbox 10.66.2.203