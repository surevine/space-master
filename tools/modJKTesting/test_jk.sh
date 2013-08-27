#-------------------------------------------------------------------------------
# Copyright (C) 2008-2010 Surevine Limited.
#   
# Although intended for deployment and use alongside Alfresco this module should
# be considered 'Not a Contribution' as defined in Alfresco'sstandard contribution agreement, see
# http://www.alfresco.org/resource/AlfrescoContributionAgreementv2.pdf
# 
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#-------------------------------------------------------------------------------
#!/bin/bash

# Logging level definitions
DEBUG=1
INFO=2
WARN=3
ERROR=4

# Other properties
LOAD_LOG_LEVEL=$INFO
TMP_DEST=/tmp/test_jk  
SESSION_LIFESPAN_MINUTES=30

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
    rm -f $HEADER_DUMP_DEST
    
    log "Session created for $USERNAME at $COOKIE_JAR" $DEBUG
}

################
#
#  Similar to createSession except, while createSession always creates a new session,
#  this method will look to see if an existing session already exists for the specified
#  user, and only create a new session if either no session exists, or the specified
#  session is more than (by default) 30 minutes old.  This saves us from having to work
#  around CAS ticket expiry issues as they arise by ensuring our sessions are well under
#  the various CAS timeouts
#  Parameters:
#       1 - Alfresco Share host
#       2 - CAS host
#       3 - Username to pass to CAS
#       4 - Password for the above user.  Certs not yet supported, but could be if reqd
function getSession {

    COOKIE_JAR=$TMP_DEST/.cookieJar.$3
    log "Attempting to reuse session from $COOKIE_JAR" $DEBUG
    if [ ! -f $COOKIE_JAR ]
    then
        log "$COOKIE_JAR does not exist.  Creating new session" $DEBUG
        createSession $1 $2 $3 $4
        return
    fi
    
    # Work out how old the cookie jar is
    NOW=`date +%s`
    COOKIE_JAR_CREATED=`stat -c %Z $COOKIE_JAR`
    AGE_SECONDS=`expr $NOW - $COOKIE_JAR_CREATED`
    AGE_MINUTES=`expr $AGE_SECONDS / 60`
    
    log "Session at $COOKIE_JAR is $AGE_MINUTES minutes old" $DEBUG
    
    if [ $AGE_MINUTES -gt $SESSION_LIFESPAN_MINUTES ]
    then
        log "$COOKIE_JAR has expired.  Creating new session" $DEBUG
        rm -f $COOKIE_JAR
        createSession $1 $2 $3 $4
        return
    fi
    
    # At this point, we know that a cookie jar for the given user exists and that it
    # has not expired, so we can simply exit the function
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
        if [ $LEVEL -eq $ERROR ]; then
            echo -e "\033[31m`date` : $1\033[0m"
            ERROR_COUNT=$((ERROR_COUNT +1))
        elif [ $LEVEL -eq $WARN ]; then
            echo -e "\033[33m`date` : $1\033[0m"
            WARN_COUNT=$((WARN_COUNT +1))
        else
            echo `date`" : "$1
        fi
    fi
}

function waitAndRespond {
	HOST=$1
	USERNAME=$2
	ID=$3
	OUTFILE=$4
	
	log "Creating session $ID" $INFO
	COOKIE_JAR=$TMP_DEST/.cookieJar.$USERNAME
	TARGET=http://$HOST/share/proxy/alfresco/cluster/WaitAndRespond
	curl -k -b $COOKIE_JAR $TARGET >> $OUTFILE 2> /dev/null
	echo >> $OUTFILE
	log "Ending session $ID" $INFO
	
}

cat < /dev/null > ./jk.test.out

getSession 10.66.2.191 10.66.2.102 admin Password12345

for f in `seq 1 5000`
do
	( waitAndRespond 10.66.2.191 admin $f jk.test.out) &
done
