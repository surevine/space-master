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

# Performs property file modifications
#
#

# Abort on error
set -e

OUT_DEST=/dev/null
# To debug problems with this script, you may find it helpful to uncomment the below line
# OUT_DEST=&1

# set constant file names
SHARE_WAR=share.war
ALFRESCO_WAR=alfresco.war
SHELL_PROPERTIES=shell.properties
VERSION_PROP_FILE=./version.properties

PROPS_FILE=$1
if [ ! -f $PROPS_FILE ]
then
    echo "The specified properties file $PROPS_FILE does not exist in the current directory"
    exit 1
fi
if [ ! -f "${PROPS_FILE}.backup" ]
then
  echo 'PROPS_FILE not backed up, not running install replace var'
  echo "s/@@DELETE_JOB_REPEAT_COUNT@@//g" >> $PROPS_FILE
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

tokenised_share_files=(
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/discussions/createtopic.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/discussions/topic.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/discussions/topiclist.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/upload/flash-upload.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/upload/html-upload.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/wiki/createform.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/wiki/page.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/modules/discussions/replies/reply-form.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/enhanced-security/enhanced-security.get.js'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/discussions/createtopic.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/discussions/topic.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/discussions/topiclist.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/upload/flash-upload.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/upload/html-upload.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/wiki/createform.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/wiki/page.get_en.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/modules/discussions/replies/reply-form.get_en.properties'
    'WEB-INF/classes/alfresco/messages/slingshot.properties'
    'WEB-INF/classes/alfresco/messages/slingshot_en.properties'
    'WEB-INF/classes/alfresco/share-config.xml'
    'WEB-INF/web.xml'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/enhanced-security/selector/enhanced-security-selector.get.js'
    'components/enhanced-security/selector/enhanced-security-static-data-min.js'
    'components/enhanced-security/selector/enhanced-security-static-data.js'
    'components/enhanced-security/selector/enhanced-security-selector-min.js'
    'components/enhanced-security/selector/enhanced-security-selector.js'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/enhanced-security/lib/enhanced-security.lib.js'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/enhanced-security/selector/enhanced-security-selector.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/enhanced-security/selector/enhanced-security-selector.get_en.properties'
    'components/enhanced-security/selector/visibility-utils-min.js'
    'components/enhanced-security/selector/visibility-utils.js'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/title/user-dashboard-title.get.properties'
    'WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/title/user-dashboard-title.get_en.properties'
    'modules/simple-editor-min.js'
    'modules/simple-editor.js'
    'js/presence-indicator.js'
    'js/presence-indicator-min.js'
    'js/xmpp-presence.js'
    'js/xmpp-presence-min.js'
    'WEB-INF/classes/alfresco/templates/org/alfresco/include/xmpp-presence.ftl'
    'WEB-INF/classes/alfresco/webscripts/com/surevine/alfresco/webscripts/sv-theme/dashlets/perishable/perishable.get.properties'
    )

tokenised_alfresco_files=(
    'WEB-INF/classes/alfresco/subsystems/OOoDirect/default/openoffice-transform-context.xml'
    'WEB-INF/classes/alfresco/subsystems/thirdparty/default/imagemagick-transform-context.xml'
    'WEB-INF/classes/alfresco/subsystems/thirdparty/default/swf-transform-context.xml'
    'WEB-INF/classes/alfresco/public-services-context.xml'
    'WEB-INF/classes/alfresco/repository.properties'
    'WEB-INF/classes/alfresco/templates/webscripts/org/alfresco/repository/user-profile/user-profile.get.js'
    'WEB-INF/classes/alfresco/templates/webscripts/org/alfresco/slingshot/enhanced-security/lib/enhanced-security.lib.js'
    'WEB-INF/classes/alfresco/web-scripts-application-context.xml'
    'WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/ldap/ldapgroupsync.properties'
    'WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/module-context.xml'
    'WEB-INF/classes/alfresco/scheduled-jobs-context.xml'
    'WEB-INF/classes/alfresco/module/com_surevine_alfresco_SvThemeRepoModule/com/surevine/alfresco/repo/xmpp/xmppIntegration.xml'
    'WEB-INF/classes/alfresco/webscripts/com/surevine/alfresco/webscript/perishable/perishable.get.properties'
  )

# Extra css file to be extracted form the share.war file
CSS_FILE="components/enhanced-security/enhanced-security.css"

echo "Creating version page..."
echo "    Customising version html..."
cp ${VERSION_HTML_FILE} ${VERSION_HTML_FILE}.orig
sed -f ${VERSION_PROP_FILE} ${VERSION_HTML_FILE}.orig > ${VERSION_HTML_FILE}

echo "    Adding to share.war..."
jar -uvf ${SHARE_WAR} ${VERSION_HTML_FILE} >$OUT_DEST
echo "    Adding to alfresco.war..."
jar -uvf ${ALFRESCO_WAR} ${VERSION_HTML_FILE} >$OUT_DEST

echo "Customising provided application..."
echo "    Customising Share"
jar -xvf ${SHARE_WAR} ${tokenised_share_files[@]} ${CSS_FILE} >$OUT_DEST
for FILE in ${tokenised_share_files[@]}
do
    mv ${FILE} ${FILE}.orig
    sed -f ${PROPS_FILE} ${FILE}.orig > ${FILE}
    rm ${FILE}.orig
done

# When replacing on the CSS file, we only use the markings and remove spaces from the values 
mv ${CSS_FILE} ${CSS_FILE}.orig
cat < ${PROPS_FILE} | grep esc..marking | sed 's/ //g' > ${PROPS_FILE}.css
sed -f ${PROPS_FILE}.css ${CSS_FILE}.orig > ${CSS_FILE}
jar -uvf ${SHARE_WAR} ${tokenised_share_files[@]} ${CSS_FILE} >$OUT_DEST

# Now tidy up
rm -R components/
rm -R WEB-INF/

echo "    Customising Alfresco"
# Extra JAR file to be extracted from the alfresco.war file
JAR_FILE='WEB-INF/lib/com_surevine_alfresco_SvThemeRepoModule.jar'

GUESSED_IP=`ifconfig eth0 | grep "inet addr" | awk -F: '{print $2}' | awk '{print $1}'`

jar -xvf ${ALFRESCO_WAR} ${tokenised_alfresco_files[@]} ${JAR_FILE} >$OUT_DEST
for FILE in ${tokenised_alfresco_files[@]}
do
    mv ${FILE} ${FILE}.orig
    sed -f ${PROPS_FILE} ${FILE}.orig > ${FILE}
    sed -i s/@@CAS_HOSTNAME@@/${GUESSED_IP}/g ${FILE}
    sed -i s/@@SHARE_HOSTNAME@@/${GUESSED_IP}/g ${FILE}
    sed -i s/@@HOST_ID@@/${GUESSED_IP/*./}/g ${FILE}
    rm ${FILE}.orig
done

# special case, update a file in a jar within the Alfresco war
FILE='com/surevine/alfresco/repo/profile/ldap.properties'
jar -xvf ${JAR_FILE} ${FILE} >$OUT_DEST
mv ${FILE} ${FILE}.orig
sed -f ${PROPS_FILE} ${FILE}.orig > ${FILE}
rm ${FILE}.orig
jar -uvf ${JAR_FILE} ${FILE} >$OUT_DEST

jar -uvf ${ALFRESCO_WAR} ${tokenised_alfresco_files[@]} ${JAR_FILE} >$OUT_DEST

# Now tidy up
rm -R WEB-INF/
rm -R com/

echo "Application customised"
exit 0
