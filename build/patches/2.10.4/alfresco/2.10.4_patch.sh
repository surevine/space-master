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
USER_PROFILE_HTML=./user-profile.get.html.ftl
USER_PROFILE_HTML_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/templates/webscripts/org/alfresco/repository/user-profile/user-profile.get.html.ftl

echo "        Perfoming pre-patch checks"
if [ ! -f $USER_PROFILE_HTML ]
then
  echo "Usage: The $USER_PROFILE_HTML file was expected in the current directory but was not found"
  exit 5
fi

if [ ! -f $USER_PROFILE_HTML_DEST ]
then
  echo "Usage: The USER_PROFILE_HTML_DEST file was expected but was not found"
  exit 5
fi


\cp -f $USER_PROFILE_HTML $USER_PROFILE_HTML_DEST
if [ ! $? -eq 0 ]
then
  echo "An error occured copying $USER_PROFILE_HTML to $USER_PROFILE_HTML_DEST.  Aborting"
  exit 5
fi
