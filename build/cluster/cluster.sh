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
###############################################################################
#              ALFRESCO CLUSTERING SCRIPT FOR CLIENT SITE                     # 
#-----------------------------------------------------------------------------#
# This script should be run inside a patch, not on it's own.  The default     # 
# properties, and the commands run, are designed to work on client site.      #
# If you want to create an instance on our development environment, you need  #
# to first run this script and then execute ec2_cluster.sh.  This sets up     #
# additional things like filesystem and database access that are already      #
# present on site, and deletes some components that won't be present on site  #
# anyway, but are included in our default BTB execution                       #
###############################################################################


# All hopefully self-explanatory, should not need modification on-site but please check anyway
ALFRESCO_HOME=/opt/alfresco
ALFRESCO_USER=alfresco
TMP_DIR=/tmp/alf_cluster
CLUSTER_NAME=spacecluster

if [ ! $SECURE_ZONE_IP ]
then
    echo "Please enter the IP address or hostname that this server is known by to other members of the cluster"
    read SECURE_ZONE_IP
fi

echo     1. Create or reset temporary directory
rm -rf $TMP_DIR/*
mkdir -p $TMP_DIR
if [ ! $? -eq 0 ]
then
    echo "Could not create a temporary directory at $TMP_DIR. Aborting"
    exit 5
fi


echo     2.  Rename ehcache-custom.xml.sample.cluster to ehcache-custom.xml in tomcat/shared
if [ -f $ALFRESCO_HOME/tomcat/shared/classes/alfresco/extension/ehcache-custom.xml ]
then
    echo "WARNING The file at $ALFRESCO_HOMEtomcat/shared/classes/alfresco/extension/ehcache-custom.xml already exists, which is unexpected.  Backing the old version up to $TMP_DIR"
    cp $ALFRESCO_HOME/tomcat/shared/classes/alfresco/extension/ehcache-custom.xml $TMP_DIR
fi
if [ ! -f ehcache-custom.xml ]
then
    echo "The file ehcache-custom.xml was expected in the current directory, but was not found.  Aborting"
    exit 5
fi
cp -f ehcache-custom.xml $ALFRESCO_HOME/tomcat/shared/classes/alfresco/extension/ehcache-custom.xml
if [ ! $? -eq 0 ]
then
    echo "Could not rename the ehcache-custom.xml.  Aborting"
    exit 5
fi


echo     3.  In alfresco-global.properties, set alfresco.cluster.name=$CLUSTER_NAME

if [ ! -f $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties ]
then
    echo "Could not find the existing properties file at $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties.  Aborting"
    exit 5
fi
cat < $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties | grep -v alfresco.cluster.name= > $TMP_DIR/alfresco.global.properties.new
if [ ! $? -eq 0 ]
then
    echo "Could not copy the existing properties.  Aborting"
    exit 5
fi

echo alfresco.cluster.name=$CLUSTER_NAME >> $TMP_DIR/alfresco.global.properties.new
if [ ! $? -eq 0 ]
then
    echo "Could not add the new alfresco.cluser.name property.  Aborting"
    exit 5
fi

mv -f $TMP_DIR/alfresco.global.properties.new $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
if [ ! $? -eq 0 ]
then
    echo "Could not replace the old alfresco-global.properties.  Aborting"
    exit 5
fi

echo     4. Add clustering properties to alfresco-global.properties
if [ ! -f custom-repository.properties ]
then
    echo "custom-repository.properties was expected in the current directory, but was not found.  Aborting"
    exit 5
fi
 
cat < custom-repository.properties >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
if [ ! $? -eq 0 ]
then
    echo "Couldn't append custom-repository.properties to alfresco-global.properties.  Aborting"
    exit 5
fi
echo alfresco.ehcache.rmi.hostname=$SECURE_ZONE_IP >> $ALFRESCO_HOME/tomcat/shared/classes/alfresco-global.properties
if [ ! $? -eq 0 ]
then
    echo "Couldn't append ehcache hostname property to alfresco-global.properties.  Aborting"
    exit 5
fi

echo     5. Ensure correct file ownership of $ALFRESCO_HOME
chown -R $ALFRESCO_USER:$ALFRESCO_USER $ALFRESCO_HOME
if [ ! $? -eq 0 ]
then
    echo "Could not ensure that $ALFRESCO_USER owned all of $ALFRESCO_HOME.  Aborting"
    exit 5
fi
