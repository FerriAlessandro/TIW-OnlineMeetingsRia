(function(){ //Instant invocation not necessary?
	
	document.getElementById("loginButton").addEventListener('click', (e) =>{
		var loginForm = e.target.closest("form");
		if(loginForm.checkValidity()){
			sendData("POST", 'Login', loginForm, function(xhr){
				
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