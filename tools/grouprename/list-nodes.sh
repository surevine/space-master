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

curl -s -k -b $COOKIE_JAR --data "group=${1}&type=${2}&skipNodes=${SKIP_NODES}" "http://${ALF_HOST}/alfresco/command/script/execute?scriptPath=/Company%20Home/Data%20Dictionary/Scripts/list-nodes-by-group.js" > nodeRefs.txt
