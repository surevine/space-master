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
#!/bin/bash

USER_PREFIX="batchuser"
LDIF_FILE="${USER_PREFIX}s-create.ldif"
ORG_LOWER="org01"
ORG_UPPER=`echo "${ORG_LOWER}"|tr [a-z] [A-Z]`

cat /dev/null > $LDIF_FILE

for i in {1..1000}
do
  echo "dn: cn=${USER_PREFIX}${i}-${ORG_LOWER},ou=${ORG_LOWER},ou=people,dc=test,dc=org,dc=uk" >> $LDIF_FILE
  echo "uid: ${USER_PREFIX}${i}-${ORG_LOWER}" >> $LDIF_FILE
  echo "cn: ${USER_PREFIX}${i}-${ORG_LOWER}" >> $LDIF_FILE
  echo "sn: ${USER_PREFIX}${i}-${ORG_LOWER}" >> $LDIF_FILE
  echo "givenname: ${USER_PREFIX}${i}-${ORG_LOWER}" >> $LDIF_FILE
  echo "objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
objectClass: shadowAccount
objectClass: x-com-surevine-space-richProfile
objectClass: top
memberOf: cn=alf_cm_ATOMAL1,ou=groups,dc=test,dc=org
memberOf: cn=alf_cm_ATOMAL2,ou=groups,dc=test,dc=org
memberOf: cn=alf_cm_GROUP01,ou=groups,dc=test,dc=org
memberOf: cn=alf_cm_RESTRICTION01,ou=groups,dc=test,dc=org
memberOf: cn=alf_site_Surevine,ou=groups,dc=test,dc=org
memberOf: cn=alf_org_${ORG_UPPER},ou=groups,dc=test,dc=org,dc=uk
userPassword: {MD5}74NcRl/jNFrexj6NvexmZA==
shadowWarning: 10
shadowExpire: 20200101000000

dn: cn=alf_org_${ORG_UPPER},ou=groups,dc=test,dc=org,dc=uk
changetype: modify
add: member
member: cn=${USER_PREFIX}${i}-${ORG_LOWER},ou=${ORG_LOWER},ou=people,dc=test,dc=org,dc=uk
" >> $LDIF_FILE
done
