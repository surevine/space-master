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
