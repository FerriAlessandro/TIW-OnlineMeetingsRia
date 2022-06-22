(function(){ //Instant invocation, otherwise the function becomes a Window's (global object) property
	
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
		else loginForm.reportValidity();
	} )
	
	document.getElementById("registrationButton").addEventListener('click', (e) =>{
		var registrationForm = e.target.closest("form");
		var registrationMsg = document.getElementById("registrationErrMsg");
		var pass = document.getElementById("pass").value;
		var repeatPass = document.getElementById("repeatPass").value;
		
		registrationMsg.textContent = "";
        
        if (!registrationForm.checkValidity()){
        	registrationForm.reportValidity();
        	return;
        }
        
		else if (pass !== repeatPass){
			registrationMsg.textContent = "Fields password and repeat password do not match";
			return;
		}
		else {
			serverCall("POST","Registration",registrationForm, (xhr) => {
				if(xhr.readyState == XMLHttpRequest.DONE){
					var msg = xhr.responseText;
					
					if (xhr.status == 200){
						sessionStorage.setItem('username', msg);
                		window.location.href = "HomePage.html";
					}
					else if (xhr.status == 400 || xhr.status == 500){
						registrationMsg.textContent = msg;
					}
				}
			});
		}
		
	});
})();