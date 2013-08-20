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

#
# Paths will need updating depending on install locations
#

AUDIT_TXT="/tmp/audit.txt"

yum list installed > $AUDIT_TXT

echo "-- Apache" >> $AUDIT_TXT
httpd -version >> $AUDIT_TXT
echo "-- ImageMagick" >> $AUDIT_TXT
convert -version >> $AUDIT_TXT
# slapd -V >> $AUDIT_TXT
echo "-- SWF Tools" >> $AUDIT_TXT
/opt/swftools/bin/pdf2swf --version >> $AUDIT_TXT
echo "-- OpenOffice" >> $AUDIT_TXT
cat /opt/openoffice.org3/program/versionrc >> $AUDIT_TXT
echo "-- Java" >> $AUDIT_TXT
java -version >> $AUDIT_TXT
echo "-- Tomcat" >> $AUDIT_TXT
/opt/alfresco/tomcat/bin/version.sh >> $AUDIT_TXT
echo "-- Oracle" >> $AUDIT_TXT
#su - oracle
echo "select * from v\$version where banner like 'Oracle%';" | sqlplus / as sysdba >> $AUDIT_TXT
uname -a >> $AUDIT_TXT

# mod_ssl
# mod_auth_cas
# mod_jk
# ISA
# browsers
# CAS
# UMT
