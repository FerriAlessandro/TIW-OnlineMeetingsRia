(function(){ //Instant invocation, otherwise the function becomes a Window's' (global object) property
	
	document.getElementById("loginButton").addEventListener('click', (e) =>{
		var loginForm = e.target.closest("form");
		if(loginForm.checkValidity()){
			serverCall("POST", 'Login', loginForm, function(xhr){
				
				if(xhr.readyState == XMLHttpRequest.DONE){
					var msg = xhr.responseText;
					
					switch(xhr.status){
						case 200:
							sessionStorage.setItem('username', msg);
                			window.location.href = "HomePage.html";
                			break;
                		case 400:
						case 401:
                		case 500:
                			document.getElementById("loginErrMsg").textContent=msg;
                			break;
					}
				}
			} ); //End of sendData 	
		}
		else loginForm.reportValidity(); //TODO: testare se serve
	} )
})();