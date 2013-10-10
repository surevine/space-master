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
#!/bin/sh

# This file is intended to be used with a correctly adapted install.properties file specific to the 
# environment the arfifact is to be installed into

# Exit codes (and recovery hints):
#
# 1 - Failed pre-install checks - no changes to the previously installed Alfresco have been made - fix and re-run
# 2 - Failed to shut Alfresco down - if Alfresco was running before, it may need restarting
# 3 - Unused
# 4 - Could not back up - Alfresco may need restarting, but has not yet been modified
# 5 - Failed to install the updated application - restore from backup and restart
# 6 - Failed to update HTML Sanitisation config - update manually or restore from backup then restart
# 7 - Could not restart Alfresco - restart manually or, if that fails, restore from backup and restart

OUT_DEST=/dev/null

# To debug problems with this script, you may find it helpful to uncomment the below line
# OUT_DEST=&1

EXPECTED_ARGS=2

if [ $# -ne $EXPECTED_ARGS ]
then
    echo "Usage: `basename $0` <name of properties file> <share|alfresco|alfresco_master|both>"
    exit 1
fi

# Abort on error
set -e

# Set constant file names - currently these are repeated in modify-properties.sh
SHARE_WAR=share.war
ALFRESCO_WAR=alfresco.war
SHELL_PROPERTIES=shell.properties

echo "Performing initial configuration checks"

echo "    Checking 'jar' is on the path"
set +e
which jar >$OUT_DEST 2>$OUT_DEST
if [ $? -ne 0 ]
then
    echo "The 'jar' command must be on the PATH"
    exit 1
fi
set -e

echo "    Checking active user is root"
if [ $UID -ne 0 ]
then
    echo "This script must be run as root"
    exit 1
fi

echo "    Checking share .war file exists"
if [ ! -f $SHARE_WAR ]
then
    echo "Usage: The $SHARE_WAR file is expected in the current directory"
    exit 1
fi

echo "    Checking alfresco .war file exists"
if [ ! -f $ALFRESCO_WAR ]
then
    echo "Usage: The $ALFRESCO_WAR file is expected in the current directory"
    exit 1
fi

echo "    Checking shell properties file exists"
if [ ! -f $SHELL_PROPERTIES ]
then
    echo "Usage: The $SHELL_PROPERTIES file is expected in the current directory"
    exit 1
fi

echo "    Checking the configuration properties file exists"
# Set the properties file
PROPS_FILE=$1
if [ ! -f $PROPS_FILE ]
then
    echo "The specified properties file $PROPS_FILE does not exist in the current directory"
    exit 1
fi

echo "    Checking the versioning properties file exists"
VERSION_PROP_FILE=./version.properties
if [ ! -f $VERSION_PROP_FILE ]
then
    echo "The version.properties file could not be found"
    exit 1
fi

VERSION_HTML_FILE=./version.html
if [ ! -f $VERSION_HTML_FILE ]
then
    echo "The version.html file could not be found"
    exit 1
fi

echo "    Making sure line breaks in the properties files are correct"
dos2unix $PROPS_FILE 2>$OUT_DEST
dos2unix $SHELL_PROPERTIES 2>$OUT_DEST

echo "    Checking the deployment type is specified correctly"
DEPLOYMENT_TYPE=$2
if [ ! "$DEPLOYMENT_TYPE" == "share" -a ! "$DEPLOYMENT_TYPE" == "alfresco_master" -a ! "$DEPLOYMENT_TYPE" == "alfresco" -a ! "$DEPLOYMENT_TYPE" == "both" ] 
then
    echo "The specified deployment type: [$DEPLOYMENT_TYPE] must be 'share', 'alfresco', 'alfresco_master' or 'both'"
    exit 1
fi

echo "    Backing up the original properties file"
cp -f $PROPS_FILE $PROPS_FILE.backup

if [ "$DEPLOYMENT_TYPE" == "alfresco_master" -o "$DEPLOYMENT_TYPE" == "both"  ]
then
    echo "    Installing a MASTER Alfresco node"
    echo "s/@@DELETE_JOB_REPEAT_COUNT@@//g" >> $PROPS_FILE
    echo "s/@@GROUP_SYNC_JOB_REPEAT_COUNT@@//g" >> $PROPS_FILE
    echo "s/@@PURGE_DELETED_ITEMS_JOB_CRON@@/0 0 0 * * ?/g" >> $PROPS_FILE
fi

if [ "$DEPLOYMENT_TYPE" == "alfresco" ]
then
    echo "    Installing a NON-MASTER Alfresco node"
    echo "s/@@DELETE_JOB_REPEAT_COUNT@@/<property name='repeatCount'><value>0<\/value><\/property>/g" >> $PROPS_FILE
    echo "s/@@GROUP_SYNC_JOB_REPEAT_COUNT@@/<property name='repeatCount'><value>0<\/value><\/property>/g" >> $PROPS_FILE
    
    # Set the deleted items purge cron to essentially never fire. Years after 2099 may apparently cause issues, so we'll just use 2099.
    echo "s/@@PURGE_DELETED_ITEMS_JOB_CRON@@/59 59 23 31 12 ? 2099/g" >> $PROPS_FILE
fi


#Customise the shell.properties file
mv ${SHELL_PROPERTIES} ${SHELL_PROPERTIES}.orig
sed -f ${PROPS_FILE} ${SHELL_PROPERTIES}.orig > ${SHELL_PROPERTIES}
rm ${SHELL_PROPERTIES}.orig

#Import the shell properties
. ./${SHELL_PROPERTIES}

echo "    Checking the service name is correct"
if [ ! -x /etc/init.d/$SERVICE_NAME ]
then
    echo "The service $SERVICE_NAME was not recognised"
    exit 1
fi

echo "    Checking that alfresco is installed in the correct place"
if [ "$DEPLOYMENT_TYPE" == "share" -o "$DEPLOYMENT_TYPE" == "both" ]
then
    if [ ! -d $ALFRESCO_HOME/tomcat/webapps/share ]
    then
        echo "$ALFRESCO_HOME/tomcat/webapps/share does not exist or is not a directory"
        exit 1
    fi
    if [ ! -f $ALFRESCO_HOME/tomcat/webapps/share.war ]
    then
        echo "$ALFRESCO_HOME/tomcat/webapps/share.war does not exist or is not a file"
        exit 1
    fi
fi

if [ "$DEPLOYMENT_TYPE" == "alfresco" -o "$DEPLOYMENT_TYPE" == "alfresco_master" -o "$DEPLOYMENT_TYPE" == "both" ]
then
    if [ ! -d $ALFRESCO_HOME/tomcat/webapps/alfresco ]
    then
        echo "$ALFRESCO_HOME/tomcat/webapps/alfresco does not exist or is not a directory"
        exit 1
    fi
    if [ ! -f $ALFRESCO_HOME/tomcat/webapps/alfresco.war ]
    then
        echo "$ALFRESCO_HOME/tomcat/webapps/alfresco.war does not exist or is not a file"
        exit 1
    fi
fi

echo "    Checking that the backup location is valid"
if [ ! -d $BACKUP_LOCATION ]
then
    echo "The backup location $BACKUP_LOCATION does not exist or is not a directory"
    exit 1
fi

echo "    Checking that the alfresco user has been specified correctly"
finger $ALFRESCO_OWNER >$OUT_DEST 2>$OUT_DEST
if [ `finger $ALFRESCO_OWNER 2>&1 | grep no.such.user | wc -l` -ne 0 ]
then
    echo "The declared alfresco owner $ALFRESCO_OWNER does not seem to be a user on the system"
    exit 1
fi

echo "    Checking that the HTML Sanitiser Configuration has been specified correctly"
if [ ! "$HTML_SANITISER_CONFIG" == "default" ]
then
    if [ ! -f $HTML_SANITISER_CONFIG ]
    then
        echo "The HTML Sanitiser Configuration at $HTML_SANITISER_CONFIG does not exist or is not a file"
        exit 1
    fi
fi

# Check that all the shell.properties lines not checked elsewhere are defined correctly (natural numbers, no whitespace)
echo "    Sanity-checking shell.properties"
case $ALFRESCO_SHUTDOWN_POLL_FREQUENCY_SECONDS in
    ''|*[!0-9]*) 
        echo "The ALFRESCO_SHUTDOWN_POLL_FREQUNECY_SECONDS property was set to [$ALFRESCO_SHUTDOWN_POLL_FREQUENCY_SECONDS].  A natural number was expected"
        exit 1 ;;
    *)  ;;
esac

case $ALFRESCO_SHUTDOWN_POLL_ATTEMPTS in
    ''|*[!0-9]*) 
        echo "The ALFRESCO_SHUTDOWN_POLL_ATTEMPTS property was set to [$ALFRESCO_SHUTDOWN_POLL_ATTEMPTS].  A natural number was expected"
        exit 1 ;;
    *)  ;;
esac

case $ALFRESCO_STARTUP_POLL_FREQUENCY_SECONDS in
    ''|*[!0-9]*) 
        echo "The ALFRESCO_STARTUP_POLL_FREQUENCY_SECONDS property was set to [$ALFRESCO_STARTUP_POLL_FREQUENCY_SECONDS].  A natural number was expected"
        exit 1 ;;
    *)  ;;
esac

case $ALFRESCO_STARTUP_POLL_ATTEMPTS in
    ''|*[!0-9]*) 
        echo "The ALFRESCO_STARTUP_POLL_ATTEMPTS property was set to [$ALFRESCO_STARTUP_POLL_ATTEMPTS].  A natural number was expected"
        exit 1 ;;
    *)  ;;
esac

case $AJP_PORT in
    ''|*[!0-9]*) 
        echo "The AJP_PORT property was set to [$AJP_PORT].  A natural number was expected"
        exit 1 ;;
    *)  ;;
esac

chmod +x modify-properties.sh
./modify-properties.sh $PROPS_FILE
RETVAL=$?
if [[ $RETVAL -ne 0 ]]
   then
   echo "Fail in modify-properties.sh"
   exit $?
fi
echo "Shutting down Alfresco"

#Check that Alfresco is running - if it isn't, prompt to continue, if it is, continue, if there's more than one, panic

#Confirm that we can find a running alfresco process
NUMBER_OF_ALFRESCO_PROCESSES=`ps -ef | grep java.*alfresco.*org.apache.catalina.startup.Bootstrap.start | grep -v grep | wc -l` 
if [ $NUMBER_OF_ALFRESCO_PROCESSES -gt 1 ]
then
    echo "When looking for Alfresco processes to monitor, found $NUMBER_OF_ALFRESCO_PROCESSES and expected at most one"
    exit 1
fi

if [ $NUMBER_OF_ALFRESCO_PROCESSES -eq 0 ]
then
    echo -e "\033[33m    Warning: It seems as though Alfresco is already shut down, which is unexpected.\033[0m"
fi

#If it's started, shutting down
if [ $NUMBER_OF_ALFRESCO_PROCESSES -gt 0 ]
then
    echo "    Requesting alfresco shutdown.  Polling for alfresco status..."
    service $SERVICE_NAME stop >$OUT_DEST 2>$OUT_DEST
    SHUTDOWN_COUNTER=0
    while [ $SHUTDOWN_COUNTER -lt $ALFRESCO_SHUTDOWN_POLL_ATTEMPTS ]
    do
        echo "        Alfresco is still running... attempt $SHUTDOWN_COUNTER of $ALFRESCO_SHUTDOWN_POLL_ATTEMPTS"
        SHUTDOWN_COUNTER=$((SHUTDOWN_COUNTER+1));
        NUMBER_OF_ALFRESCO_PROCESSES=`ps -ef | grep java.*alfresco.*org.apache.catalina.startup.Bootstrap.start | grep -v grep | wc -l`
        if [ $NUMBER_OF_ALFRESCO_PROCESSES -eq 0 ]
        then
            break;
        fi
        sleep $ALFRESCO_SHUTDOWN_POLL_FREQUENCY_SECONDS
    done
    #We've finished the while loop, but this could be because we've exceeded our timeout or because Alfresco has stopped - find out which and panic if needed
    if [ $SHUTDOWN_COUNTER -eq $ALFRESCO_SHUTDOWN_POLL_ATTEMPTS ]
    then
        echo "    Could not shut Alfresco down.  Please shut down Alfresco manually and re-run this script, selecting to Proceed with the installation at the prompt"
        exit 2;
    fi
fi

echo "    Checking the AJP Port ($AJP_PORT)"
# We use the AJP port later to detect when alfresco has started.  We want to check that, now we've shut down alfresco, nothing is using it
if [ `lsof -i :$AJP_PORT | grep LISTEN | wc -l` -ne 0 ]
then
    echo "Alfresco has been shut down, but a process is still using port $AJP_PORT, which is unexpected.  Aborting"
    exit 2;
fi
echo "Alfresco is shut down"

#At this point we know that Alfresco has been shut down.  We should now back it up
echo "Backing up..."
BACKUP_ID=`date +%s`
FULL_BACKUP_LOCATION=$BACKUP_LOCATION/space_backup_$BACKUP_ID
mkdir $FULL_BACKUP_LOCATION
if [ ! $? -eq 0 ]
then
    echo "Could not create a backup directory at $FULL_BACKUP_LOCATION. Aborting"
    exit 4
fi
echo "    Backup ID is $BACKUP_ID"
echo "    Backup Location is $BACKUP_LOCATION"

if [ "$DEPLOYMENT_TYPE" == "alfresco" -o "$DEPLOYMENT_TYPE" == "both" -o "$DEPLOYMENT_TYPE" == "alfresco_master" ]
then
    echo "    Backing up alfresco"
    cp -r $ALFRESCO_HOME/tomcat/webapps/alfresco* $FULL_BACKUP_LOCATION
    if [ ! $? -eq 0 ]
    then
        echo "    Could not backup alfresco.  Aborting"
        exit 4
    fi
fi

if [ "$DEPLOYMENT_TYPE" == "share" -o "$DEPLOYMENT_TYPE" == "both" ]
then
    echo "    Backing up share"
    cp -r $ALFRESCO_HOME/tomcat/webapps/share* $FULL_BACKUP_LOCATION
    if [ ! $? -eq 0 ]
    then
        echo "Could not backup share.  Aborting"
        exit 4
    fi
fi

#Check that the disk doesn't look full
if [ `df -k $FULL_BACKUP_LOCATION | grep 100% | wc -l` -ne 0 ]
then
    echo "The backup drive is 100% used.  The backup may not have completed correctly.  Aborting."
    exit 4
fi
echo "Backup complete"

# At this point we can be pretty certain that we have backed up the webapps.  There's probably some more checking we could do, as we're not checking anything about the 
# backup destination after the backup is made, but we're verging on the paranoid here anyway and in any event there are (more difficult to restore) many other backups
# of the same files scattered around the infrastructure.

# We can now begin to copy over the web applications

echo "Installing updated application..."
if [ "$DEPLOYMENT_TYPE" == "alfresco" -o "$DEPLOYMENT_TYPE" == "both" -o "$DEPLOYMENT_TYPE" == "alfresco_master" ]
then
    echo "    Installing Alfresco"
    cp -r $ALFRESCO_WAR $ALFRESCO_HOME/tomcat/webapps
    if [ ! $? -eq 0 ]
    then
        echo "    Could not copy $ALFRESCO_WAR to $ALFRESCO_HOME/tomcat/webapps.  Aborting"
        exit 5
    fi
    chown $ALFRESCO_OWNER.$ALFRESCO_OWNER $ALFRESCO_HOME/tomcat/webapps/alfresco.war
    if [ ! $? -eq 0 ]
    then
        echo "    Could not set permissions on $ALFRESCO_HOME/tomcat/webapps/alfresco.war.  Aborting"
        exit 5
    fi
    echo "    Deleting exploded alfresco webapp"
    rm -rf $ALFRESCO_HOME/tomcat/webapps/alfresco
    if [ ! $? -eq 0 ]
    then
        echo "    Could not delete exploded alfresco webapp.  Aborting"
        exit 5
    fi
fi
if [ "$DEPLOYMENT_TYPE" == "share" -o "$DEPLOYMENT_TYPE" == "both" ]
then
    echo "    Installing Share"
    cp -r $SHARE_WAR $ALFRESCO_HOME/tomcat/webapps
    if [ ! $? -eq 0 ]
    then
        echo "    Could not copy $SHARE_WAR to $ALFRESCO_HOME/tomcat/webapps.  Aborting"
        exit 5
    fi
        chown $ALFRESCO_OWNER.$ALFRESCO_OWNER $ALFRESCO_HOME/tomcat/webapps/share.war
    if [ ! $? -eq 0 ]
    then
        echo "    Could not set permissions on $ALFRESCO_HOME/tomcat/webapps/share.war.  Aborting"
        exit 5
    fi
    echo "    Deleting exploded share webapp"
    rm -rf $ALFRESCO_HOME/tomcat/webapps/share
    if [ ! $? -eq 0 ]
    then
        echo "    Could not delete exploded share webapp.  Aborting"
        exit 5
    fi
fi
echo "Application Installed"

# We've copied over the web applications.  We now need to override a security configuration file with one found on the local filesystem

if [ "$DEPLOYMENT_TYPE" == "alfresco" -o "$DEPLOYMENT_TYPE" == "both" -o "$DEPLOYMENT_TYPE" == "alfresco_master" ]
then
    # Updated xmppIntegration to use a host-specific resource value for openfire
    echo "Updating host-specific XMPP configuration"
    sed -i "s/depends-on=\"com.surevine.alfresco.presence.xmpp.XMPPConfiguration\">/depends-on=\"com.surevine.alfresco.presence.xmpp.XMPPConfiguration\"><property name=\"resource\"><value>Smack-Space-$(hostname)<\/value><\/property>/" $(find /opt/alfresco/tomcat/webapps/ -name xmppIntegration.xml)

    if [ "$HTML_SANITISER_CONFIG" == "default" ]
    then
        echo "Using default HTML Sanitisation Configuration"
    else
        echo "Using HTML Santisation Configuration at $HTML_SANITISER_CONFIG..."
        echo "    Backing up original configuration"
        set +e
        jar -xf $ALFRESCO_HOME/tomcat/webapps/alfresco.war WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/HTMLSanitisationAction.xml >$OUT_DEST 2>$OUT_DEST
        if [ $? -ne 0 ]
        then
            echo "Could not backup original HTML Sanitisation Configuration.  Aborting"
            exit 6
        fi
        mv WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/HTMLSanitisationAction.xml $FULL_BACKUP_LOCATION
         if [ $? -ne 0 ]
        then
            echo "Could not move original HTML Sanitisation Configuration into backup location [$FULL_BACKUP_LOCATION].  Aborting"
            exit 6
        fi
        set -e
        
        echo "    Installing new configuration"
        mkdir -p $ALFRESCO_HOME/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/
        if [ -e $ALFRESCO_HOME/tomcat/webapps/WEB-INF ]
        then
            echo "$ALFRESCO_HOME/tomcat/webapps/WEB-INF already exists, which in unexpected.  Aborting"
            exit 6
        fi
        mkdir -p $ALFRESCO_HOME/tomcat/webapps/WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/
        cp $HTML_SANITISER_CONFIG $ALFRESCO_HOME/tomcat/webapps/WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/HTMLSanitisationAction.xml
        cd $ALFRESCO_HOME/tomcat/webapps
        jar -uf alfresco.war WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/HTMLSanitisationAction.xml >$OUT_DEST 2>$OUT_DEST
        if [ $? -ne 0 ]
        then
            echo "Could not install the HTML Sanitisation Configuration.  Aborting"
            cd -
            exit 6
        fi
        cd -
        echo "    Tidying up working files"
        rm -rf $ALFRESCO_HOME/tomcat/webapps/WEB-INF
        if [ $? -ne 0 ]
        then
            echo "Failed to tidy up working files.  Aborting"
            exit 6
        fi
        echo "HTML Sanitisation Configuration updated"
    fi
fi

# We are now ready to start-up the application
echo "Starting Alfresco"
echo "    Requesting Alfresco start"
service $SERVICE_NAME start >$OUT_DEST 2>$OUT_DEST

STARTUP_COUNTER=0
while [ $STARTUP_COUNTER -lt $ALFRESCO_STARTUP_POLL_ATTEMPTS ]
do
    echo "        Alfresco has not finished starting up... attempt $STARTUP_COUNTER of $ALFRESCO_STARTUP_POLL_ATTEMPTS"
    STARTUP_COUNTER=$((STARTUP_COUNTER+1));
    if [ `lsof -i :$AJP_PORT | grep LISTEN | wc -l` -ne 0 ]
    then
        break;
    fi
    
    sleep $ALFRESCO_STARTUP_POLL_FREQUENCY_SECONDS
done

#We've finished the while loop, but this could be because we've exceeded our timeout or because Alfresco has stopped - find out which and panic if needed
if [ $STARTUP_COUNTER -eq $ALFRESCO_STARTUP_POLL_ATTEMPTS ]
then
    echo "    Alfresco did not appear to start within the specified time limit.  Manual investigation of any issue is required"
    exit 7;
fi

echo "Alfresco has been started.  Have a nice day."
