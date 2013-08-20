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
REPO_ESL_JAR_FILE=./repo.esl.module.jar
REPO_ESL_JAR_FILE_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib

SPRING_CONFIG=./module-context.xml
SPRING_CONFIG_DEST=/opt/alfresco/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/module/repo.esl.module/module-context.xml

echo "        Perfoming pre-patch checks"
if [ ! -f $REPO_ESL_JAR_FILE ]
then
  echo "Usage: The $REPO_ESL_JAR_FILE file was expected but was not found"
  exit 5
fi

if [ ! -f $SPRING_CONFIG ]
then
  echo "Usage: The $SPRING_CONFIG file was expected but was not found"
  exit 5
fi

echo "        Perfoming patch"

\cp -f $REPO_ESL_JAR_FILE $REPO_ESL_JAR_FILE_DEST
\cp -f $SPRING_CONFIG $SPRING_CONFIG_DEST
