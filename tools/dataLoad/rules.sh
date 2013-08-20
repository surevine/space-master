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
function validateMarkings {
	CLOSED_GROUPS=$1
	ORGANISATIONS=$2
	NOD=$3
	PM=$4
	ATOMAL=$5
	NATN_CAVS=$6

	if [[ $ATOMAL == "ATOMAL1" && -z $ORGANISATIONS ]]; then
    	log "ATOMAL1 used without selected organisations." $ERROR
		return 1;
	elif [[ $ATOMAL == "ATOMAL2" && -z $CLOSED_GROUPS ]]; then
        log "ATOMAL2 used without selected closed groups." $ERROR
		return 1;
	fi

	return 0;
}
