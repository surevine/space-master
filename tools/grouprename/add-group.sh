#!/bin/bash

. ./common.sh

. ./env.sh

if [ $# -ne 2 ]; then
    echo
    echo "    Usage: ./add-group.sh [group] [type]"
    echo
    exit 1
fi

containsElement "$2" "${TYPES[@]}"
if [[ $? -ne 0 ]]; then
    echo "Unknown type $2"
    exit 1
fi

createSession ${ALF_HOST} ${CAS_HOST} ${ADMIN_USER} ${ADMIN_PASS}

NODE_REFS=$(cat nodeRefs.txt)

curl -k -b $COOKIE_JAR --data "group=${1}&type=${2}&nodeRefs=$NODE_REFS" "http://10.66.2.169/alfresco/command/script/execute?scriptPath=/Company%20Home/Data%20Dictionary/Scripts/add-group-by-nodes.js"
