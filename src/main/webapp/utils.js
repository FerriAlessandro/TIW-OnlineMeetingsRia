//AJAX


function serverCall(method, url, form, callback){
	
	var reset = false;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		
		if(xhr.status === 200 && xhr.readyState == XMLHttpRequest.DONE) //we reset the form fields only if the request was successful
			reset=true;
		
		callback(xhr);
	}
	
	xhr.open(method, url);
	
	if(form!=null) //if there's a form
		xhr.send(new FormData(form));
		
	else 
		xhr.send();
		
	if(reset===true && form!==null)
		form.reset();
	
}