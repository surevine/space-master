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
