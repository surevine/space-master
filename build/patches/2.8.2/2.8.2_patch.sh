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
SEARCH_LIB_JS=./search.lib.js
SEARCH_LIB_JS_DEST=$ALFRESCO_HOME/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/templates/webscripts/org/alfresco/slingshot/search/search.lib.js

echo "        Performing pre-patch checks"
if [ ! -f $SEARCH_LIB_JS ]
then
    echo "Usage: The $SEARCH_LIB_JS file is expected in the current directory"
    exit 5
fi

if [ ! -f $SEARCH_LIB_JS_DEST ]
then
    echo "Usage: The $SEARCH_LIB_JS_DEST file is expected but was not found"
    exit 5
fi

echo "        Updating search.lib.js"
cp -f $SEARCH_LIB_JS $SEARCH_LIB_JS_DEST
