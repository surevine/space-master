#!/bin/bash

. ./common.sh

. ./env.sh

if [ $# -ne 2 ]; then
    echo
    echo "    Usage: ./list-nodes.sh [group] [type]"
    echo
    exit 1
fi

containsElement "$2" "${TYPES[@]}"
if [[ $? -ne 0 ]]; then
    echo "Unknown type $2"
    exit 1
fi

createSession ${ALF_HOST} ${CAS_HOST} ${ADMIN_USER} ${ADMIN_PASS}

SKIP_NODES=$(cat skipNodeRefs.txt)

curl -s -k -b $COOKIE_JAR --data "group=${1}&type=${2}&skipNodes=${SKIP_NODES}" "http://10.66.2.169/alfresco/command/script/execute?scriptPath=/Company%20Home/Data%20Dictionary/Scripts/list-nodes-by-group.js" > nodeRefs.txt
