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
