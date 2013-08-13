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
