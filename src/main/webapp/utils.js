//AJAX


function serverCall(method, url, form, callback){
	
	var reset = false;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		callback(xhr);
	}
	
	xhr.open(method, url);
	
	if(form!=null) //if there's a form
		xhr.send(new FormData(form));
	else 
		xhr.send();
		
	if(form!==null)
		form.reset();
	
}