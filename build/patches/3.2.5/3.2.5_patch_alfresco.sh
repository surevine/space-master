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
ALFRESCO_HOME="/opt/alfresco"
REPO_JAR_FILE="${ALFRESCO_HOME}/tomcat/webapps/alfresco/WEB-INF/lib/alfresco-repository-3.4.7.jar"

# Add new class files to jar
jar uvf $REPO_JAR_FILE org/alfresco/repo/search/impl/lucene/SpaceADMLuceneIndexerImpl.class
jar uvf $REPO_JAR_FILE org/alfresco/repo/search/impl/lucene/SpaceADMLuceneIndexerImpl\$1.class
jar uvf $REPO_JAR_FILE org/alfresco/repo/search/impl/lucene/SpaceADMLuceneIndexerImpl\$2.class
jar uvf $REPO_JAR_FILE org/alfresco/repo/search/impl/lucene/SpaceADMLuceneIndexerImpl\$Pair.class
jar uvf $REPO_JAR_FILE org/alfresco/repo/search/impl/lucene/SpaceADMLuceneIndexerAndSearcherFactory.class

# Update spring configuration to use new class file
sed -i 's/org.alfresco.repo.search.impl.lucene.ADMLuceneIndexerAndSearcherFactory/org.alfresco.repo.search.impl.lucene.SpaceADMLuceneIndexerAndSearcherFactory/g' "${ALFRESCO_HOME}/tomcat/webapps/alfresco/WEB-INF/classes/alfresco/core-services-context.xml"

# Increase log level for indexing so we can see skipped orphaned nodes.
grep -q 'log4j.logger.org.alfresco.repo.search.impl.lucene=' ${ALFRESCO_HOME}/tomcat/webapps/alfresco/WEB-INF/classes/log4j.properties || echo -e "\n# Increase log level for indexing.\nlog4j.logger.org.alfresco.repo.search.impl.lucene=warn" >> ${ALFRESCO_HOME}/tomcat/webapps/alfresco/WEB-INF/classes/log4j.properties

