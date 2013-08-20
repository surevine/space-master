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

#  This script is only meant to be run from EC2 - all the default values are for that environment


ALFRESCO_HOME=/opt/alfresco
ALFRESCO_USER=apps
TMP_DIR=/tmp/ec2-cluster
ALF_DATA=/var/alf_data_cluster
EXISTING_ALF_DIR=/var/data/alfresco
NFS_CLIENT_ADDR=`hostname -i`

if [ ! $LDAP_SERVER ]
then
    echo "Please enter the IP address or hostname of your LDAP server"
    read LDAP_SERVER
fi

if [ ! $DB_SERVER ]
then
    echo "Please enter the IP address or hostname of your database server"
    read DB_SERVER
fi

if [ ! $NFS_SHARE ]
then
    echo "Please enter the details of your NFS share for Alfresco data"
    echo "    eg. 10.66.2.249:/alf_data"
    read NFS_SHARE
fi

if [ ! $TCP_INITIAL_HOSTS ]
then
    echo "Please enter the details of each other repository in your cluster in the form IP[PORT],IP[PORT]"
    echo "    eg. 10.66.2.1[7800],10.66.2.2[7800],10.66.2.3[7800]"
    read TCP_INITIAL_HOSTS
fi

if [ ! $CAS_SERVER ]
then
    echo "Please enter the hostname or IP address of your CAS server"
    read CAS_SERVER
fi

echo Running general-purpose clustering script

echo    Reconfiguring script
cp cluster.sh cluster.sh.backup
echo ALFRESCO_HOME=$ALFRESCO_HOME > cluster.sh 
echo ALFRESCO_USER=$ALFRESCO_USER >> cluster.sh 
cat < cluster.sh.backup | grep -v ALFRESCO_HOME= | grep -v ALFRESCO_USER= >> cluster.sh
echo    Executing script
chmod u+x ./cluster.sh
./cluster.sh
if [ ! $? -eq 0 ]
then
  echo "cluster.sh did not complete.  Aborting"
  exit 5
fi

echo General purpose clustering script complete.  Now running ec2 specific configuration

echo     Creating temp directory
mkdir -p $TMP_DIR
rm -rf $TMP_DIR/*

echo     1. Disable the ldap2alfresco cron job if it is still set
crontab -l | grep -v ldap2alfresco > $TMP_DIR/crontab
crontab $TMP_DIR/crontab 

echo     2. Set the database connection settings
cp $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties $TMP_DIR/alfresco-global.properties
cat < $TMP_DIR/alfresco-global.properties | grep -v db.url= > $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
echo "db.url=jdbc:oracle:thin:@$DB_SERVER:1521:XE" >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties

echo     3. Set the filesystem to the correct directory
cp $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties $TMP_DIR/alfresco-global.properties.stage2
cat < $TMP_DIR/alfresco-global.properties.stage2 | grep -v dir.root= > $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
echo dir.root=/var/alf_data_cluster >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties

echo    4. Configure JGroups
echo "alfresco.jgroups.defaultProtocol=TCP" >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
echo "alfresco.tcp.initial_hosts=${TCP_INITIAL_HOSTS}" >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties

echo    5. Mount NFS share for Alfresco data
yum -y --quiet install nfs-utils
mkdir $ALF_DATA
mount $NFS_SHARE $ALF_DATA
NFS_SHARE_SERVER=`echo $NFS_SHARE | sed 's/:.*//'`
echo "Adding this line to fstab"
echo "$NFS_SHARE $ALF_DATA nfs rw,vers=4,addr=$NFS_SHARE_SERVER,clientaddr=$NFS_CLIENT_ADDR 0 0"
echo "With sudo"
sudo -t echo "$NFS_SHARE $ALF_DATA nfs rw,vers=4,addr=$NFS_SHARE_SERVER,clientaddr=$NFS_CLIENT_ADDR 0 0" >> /etc/fstab
echo "without sudo"
echo "$NFS_SHARE $ALF_DATA nfs rw,vers=4,addr=$NFS_SHARE_SERVER,clientaddr=$NFS_CLIENT_ADDR 0 0" >> /etc/fstab
echo "Checking for nfs in fstab"
grep nfs /etc/fstab 
echo "And the full fstab"
cat /etc/fstab



# Automatically clear alf_data if it's empty
if [ `ls $ALF_DATA | grep -v lost | wc -l` -eq 0 ]
then
    echo "    5a. Couldn't find existing data in $ALF_DATA, so copying from $EXISTING_ALF_DIR"
    su - apps -c "cp -r $EXISTING_ALF_DIR/* $ALF_DATA/"
#    chown -R $ALFRESCO_USER:$ALFRESCO_USER $ALF_DATA
fi

echo 6. Deleting previous local alfresco datastore
rm -rf $EXISTING_ALF_DIR

echo 7. Configuring mod_auth_cas to point at $CAS_SERVER
cp /etc/httpd/conf.d/mod_auth_cas.conf $TMP_DIR
cat < $TMP_DIR/mod_auth_cas.conf | grep -v CASLoginURL | grep -v CASValidateURL > /etc/httpd/conf.d/mod_auth_cas.conf
echo "CASLoginURL https://$CAS_SERVER/cas/login" >> /etc/httpd/conf.d/mod_auth_cas.conf
echo "CASValidateURL https://$CAS_SERVER/cas/serviceValidate" >> /etc/httpd/conf.d/mod_auth_cas.conf

echo 8.  Allowing share to connect over HTTP.
cat >> /etc/httpd/conf/httpd.conf <<EOF
<VirtualHost *:80>
        JkMount /alfresco ajp13
        JkMount /alfresco/* ajp13
</VirtualHost>
EOF

echo 9.  Restarting apache
service httpd restart

echo 10.  Removing local CAS instance
rm -rf /opt/alfresco/tomcat/webapps/cas
rm -f /opt/alfresco/tomcat/webapps/cas.war

echo 11. Wiring in LDAP server at $LDAP_SERVER
cp $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties $TMP_DIR/alfresco-global.properties.ldap
cat < $TMP_DIR/alfresco-global.properties.ldap | grep -v ldap.authentication.java.naming.provider.url= > $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
echo "ldap.authentication.java.naming.provider.url=ldap://$LDAP_SERVER:389" >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
cd $TMP_DIR
jar -xf /opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib/com_surevine_alfresco_SvThemeRepoModule.jar com/surevine/alfresco/repo/profile/ldap.properties
cp $TMP_DIR/com/surevine/alfresco/repo/profile/ldap.properties ldap.properties
cat < $TMP_DIR/ldap.properties | grep -v ldap.hostname > com/surevine/alfresco/repo/profile/ldap.properties
echo ldap.hostname=$LDAP_SERVER >> com/surevine/alfresco/repo/profile/ldap.properties
jar -uf /opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib/com_surevine_alfresco_SvThemeRepoModule.jar com/surevine/alfresco/repo/profile/ldap.properties
chown $ALFRESCO_USER:$ALFRESCO_USER  /opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib/com_surevine_alfresco_SvThemeRepoModule.jar 
cd -

date
