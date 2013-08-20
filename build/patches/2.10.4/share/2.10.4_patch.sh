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
IE7_CSS=./ie7.css
IE7_CSS_DEST=/opt/alfresco/tomcat/webapps/share/css/ie7.css

echo "        Perfoming pre-patch checks"
if [ ! -f $IE7_CSS ]
then
  echo "Usage: The $IE7_CSS file was expected in the current directory but was not found"
  exit 5
fi

if [ ! -f $IE7_CSS_DEST ]
then
  echo "Usage: The IE7_CSS_DEST file was expected but was not found"
  exit 5
fi


\cp -f $IE7_CSS $IE7_CSS_DEST
if [ ! $? -eq 0 ]
then
  echo "An error occured copying $IE7_CSS to $IE7_CSS_DEST.  Aborting"
  exit 5
fi
