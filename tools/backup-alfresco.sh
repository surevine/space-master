#!/bin/sh

#
# Script to create filesystem and oracle exports for BTB.
#

function fail {
  echo -ne "\e[00;31m"
  echo "$1. Aborting."
  echo -ne "\e[00m"
  exit 1
}

function backup_oracle {
  echo "Running Oracle backup."
  su - oracle -c "mkdir /tmp/export" >/dev/null 2&>1 || fail "Export location exists"
  su - oracle -c "source ~/oracle_env.sh && sqlplus / as sysdba >/dev/null 2&>1 <<EOF
grant create any directory to alfresco;
grant EXP_FULL_DATABASE to alfresco;
exit
EOF"
  su - oracle -c "source ~/oracle_env.sh && sqlplus alfresco/$SPACE_ORACLE_ALFRESCO_PASSWORD >/dev/null <<EOF
create or replace directory dmp_dir as '/tmp/export';
exit
EOF"
  su - oracle -c "source ~/oracle_env.sh && expdp alfresco/$SPACE_ORACLE_ALFRESCO_PASSWORD schemas=alfresco directory=dmp_dir dumpfile=export.dmp logfile=export.log" 2&>1 >/dev/null
  echo -ne "\e[0;32m"
  echo "Oracle export complete. Available at /tmp/export/export.dmp"
  echo -ne "\e[0;00m"
}

function backup_filesystem {
  echo "Running filesystem backup."
  tar cvzf /tmp/alfresco.tar.gz -C /var/data/alfresco . >/dev/null || fail "Unable to create filesystem tarball"
  echo -ne "\e[0;32m"
  echo "Filesystem backup complete. Available at /tmp/alfresco.tar.gz"
  echo -ne "\e[0;00m"
}

if [ "$UID" -ne 0 ]; then
  fail "You're not root. Get root"
fi

if [ -f /tmp/alfresco.tar.gz ]; then
  fail "Filesystem backup already exists at /tmp/alfresco.tar.gz"
fi

if [ -z "$SPACE_ORACLE_ALFRESCO_PASSWORD" ]; then
  fail "Alfresco Oracle password not exported as SPACE_ORACLE_ALFRESCO_PASSWORD"
fi

backup_oracle
backup_filesystem
