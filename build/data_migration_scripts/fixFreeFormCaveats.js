existingFreeForm = document.properties["es:freeFormCaveats"]; 
badFreeForm = document.properties["es:freeformcaveats"]; 

if (existingFreeForm==null || existingFreeForm.length==0) { 
	logger.log("Setting the freeform properties of "+document+" to "+badFreeForm); 
	document.properties["es:freeFormCaveats"]=badFreeForm; 
}