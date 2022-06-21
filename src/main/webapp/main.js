{

let pageController = new PageController();

window.addEventListener("load", () => {
    if (window.sessionStorage.getItem("username") == null) {
      window.location.href = "index.html";
    } else {
      pageController.start(); 
      pageController.refresh();
    }
  }, false);
	  
function PersonalMsg(_username, _personalMsg) {
    this.username = _username;
    this.personalMsg = _personalMsg;
    
    this.show = function() {
      this.personalMsg.textContent = this.username;
    }
}

function MeetingList(_msg,_meetingTable,_meetingBody){
	this.msg = _msg;
	this.meetingTable = _meetingTable;
	this.meetingBody = _meetingBody;
	
	this.hide = function(){
		this.meetingTable.style.visibility = "hidden";
	}
	
	this.show = function(){
		this.meetingTable.style.visibility = "visible";
	}
	
	this.populateOrganizedMeetings = function(){
		var self = this;
		
		serverCall("GET","GetOrganizedMeetings",null,
		function(xhr){
			if (xhr.readyState == 4){
				var message = xhr.responseText;
				if (xhr.status == 200){
					var organizedMeetingList = JSON.parse(message);
					if (organizedMeetingList.length == 0){
						self.msg.textContent = "You haven't organized any meeting yet";
					}
					else{
						self.msg.textContent = "This is a list of meetings organized by you: ";
						self.drawTable(organizedMeetingList);
					}
				}
				else if (xhr.status == 500)
					self.msg.textContent = message;
				
				else if(xhr.status == 403){
					window.location.href = xhr.getResponseHeader("Location");
                  	window.sessionStorage.removeItem('username');
				}
			}	
		});
	}
	
	this.populateInvitedMeetings = function(){
		var self = this;
		
		serverCall("GET","GetInvitations",null,
		function(xhr){
			if (xhr.readyState == 4){
				var message = xhr.responseText;
				if (xhr.status == 200){
					var invitedMeetingList = JSON.parse(message);
					if (invitedMeetingList.length == 0){
						self.msg.textContent = "You haven't been invited to any meeting yet";
					}
					else{
						self.msg.textContent = "This is a list of meetings you were invited to: ";
						self.drawTable(invitedMeetingList);
					}
				}
				else if (xhr.status == 500)
					self.msg.textContent = message;
					
				else if(xhr.status==403){
					window.location.href = xhr.getResponseHeader("Location");
                  	window.sessionStorage.removeItem('username');
				}	
					
			}	
		});
	}
	
	this.drawTable = function(meetingList){
		var row, title, date, duration, organizer, span, self = this;
		this.meetingBody.innerHTML = ""; //replace meetingBody content (whatever it is) with an empty string
		
		meetingList.forEach(function(meeting){
			
			row = document.createElement("tr");
			title = document.createElement("td");
			title.textContent = meeting.title;
			row.appendChild(title);
			
			date = document.createElement("td");
			date.textContent = meeting.meetingDate;
			row.appendChild(date);
			
			duration = document.createElement("td");
			duration.textContent = meeting.meetingDuration;
			
			span = document.createElement("span");
			span.textContent = " minutes";
			duration.appendChild(span);
			row.appendChild(duration);
			
			if (meeting.hasOwnProperty("organizerName")){
				organizer = document.createElement("td");
				organizer.textContent = meeting.organizerName;
				row.appendChild(organizer);
			}
			
			self.meetingBody.appendChild(row);//appends a row to the current meetingBody
		});
		
		this.show(); //sets meetingTable content visible
	}
}
	
function MeetingForm(_msg,_createMeetingForm, _createMeetingMsg){
	this.createMeetingForm = _createMeetingForm;
	this.createMeetingMsg = _createMeetingMsg;
	this.errormsg = _msg;
	this.now = new Date();
	this.createMeetingForm.querySelector("input[type='datetime-local']").setAttribute('min',this.now.toISOString().substring(0,16));
	this.createMeetingForm.querySelector("input[type='number']").setAttribute('min',1);
	this.addButtonListener= function(){
		this.createMeetingForm.querySelector("input[type='button'].submit").addEventListener('click', (e) => {
		var fieldset = e.target.closest('fieldset'), valid = true;
		for (let i = 0; i<fieldset.elements.length; i++){
			if (!fieldset.elements[i].checkValidity()){
				fieldset.elements[i].reportValidity();
				valid = false;
				//return; If we return here the "invalid field content" is not shown (the browser warning is shown anyway)
			}
		}
		if (valid){
			this.errormsg.textContent = "";
			this.formCopy = fieldset.cloneNode(true); //copy used with the appenChild method, otherwise we move nodes from the original html
			pageController.showModalWindow(this.formCopy); //We pass through the pageController to keep modalWindow and meetingForm separated
														   //if something needs to be modified we know it will be on the pageController	
		}
		else 
			this.errormsg.textContent = "Invalid field content";
		}, false);
	}
	

	
}
	
function ModalWindow(_modalWindow,_modalMsg,_msg){
	this.msg = _msg;
	this.modalMsg = _modalMsg;
	this.attempts = 3;
	this.modal = _modalWindow;

	
	this.addButtonListener = function(){
		
		document.getElementsByClassName("close").addEventListener('click', (e) => {
			this.modal.style.display = 'none';
			document.getElementById('participantsFieldset').innerHTML = "";
		});
		
		document.getElementById("cancel").addEventListener('click', (e) => {
			this.modal.style.display = "none"; //close modal window
			document.getElementById('participantsFieldset').innerHTML = "";
			
		}, false);
		
		document.getElementById("submitParticipants").addEventListener('click', (e) => {
			var checkedParticipants =  document.querySelectorAll('input[name=user_id]:checked');
			
			
			if (checkedParticipants.length == 0){
				this.modalMsg.textContent = "Please select at least one participant";
				return;
			}
				
			else if(checkedParticipants.length <= pageController.maxNumParticipants){
				var form = document.createElement('form'); //create a fake form
				for(let i=0;pageController.meetingFields.elements.length>0;i++){
					form.appendChild(pageController.meetingFields.elements[0]); //elements are removed from meetingForm... we need to keep the index at 0
				}
				
				checkedParticipants.forEach(function(participant){
					form.appendChild(participant); //Add the checked participants
				});
				
				serverCall("POST","CreateMeeting",form, (xhr) => {  //Arrow function to preserve the 'this'
					
					if (xhr.readyState == 4){
						var message = xhr.responseText;
						
						if (xhr.status == 200){
							this.modal.style.display = "none"; //close modal window
							this.modalMsg.textContent = "";
							pageController.refresh();
							var fieldset = document.getElementById("participantsFieldset");
							fieldset.innerHTML = "";
						}
						
						else if(xhr.status == 500 || xhr.status == 400){
							this.msg.textContent = message;
							this.modal.style.display = "none";
							return;
						}
						else if(xhr.status==403){
							window.location.href = xhr.getResponseHeader("Location");
                  			window.sessionStorage.removeItem('username');
						}
					}
				});
			}
			else{
				this.attempts--;
				this.modalMsg.textContent = "You selected too many participants. Please remove at least " 
				+ (checkedParticipants.length - pageController.maxNumParticipants) + ". You have "+ this.attempts +" attempts left!";
				
				if (this.attempts == 0){
					this.modal.style.display = "none"; //close modal window
					this.msg.textContent = "Three unsuccessful attempts to create a meeting were made, " +
					 	"the meeting will not be created";
					this.modalMsg.textContent = "";
					var fieldset = document.getElementById("participantsFieldset");
					fieldset.innerHTML = "";
				}
			}
			
		}, false);
	}
	
	this.populate = function(){
		
		serverCall("GET","GetUsers",null, (xhr) => {
			if (xhr.readyState == 4){
				var message = xhr.responseText;
				if (xhr.status == 200){
					var registeredUsers = JSON.parse(message);
					if (registeredUsers.length == 0){
						this.msg.textContent = "No users registered yet. Retry later";
						return;
					}
					else{
						this.attempts = 3;
						this.msg.textContent = "";
						this.update(registeredUsers);
						this.modal.style.display ='block';
						
					}
				}
				else if (xhr.status == 500){
					this.msg = message;
				}
				else if(xhr.status==403){
					window.location.href = xhr.getResponseHeader("Location");
                  	window.sessionStorage.removeItem('username');
				}
			}
		});
	}
	
	this.update = function(usersList){		
		var fieldset, checkbox, label, br;
		fieldset = document.getElementById("participantsFieldset");
		fieldset.innerHTML = "";
		this.modalMsg.textContent = "";
		usersList.forEach(function(user){
			checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.name = "user_id";
			checkbox.value = user.id;
			
			label = document.createElement("label");
			label.appendChild(document.createTextNode(user.userName));
			
			fieldset.appendChild(checkbox);
			fieldset.appendChild(label);
			
			br = document.createElement("br");
			fieldset.appendChild(br);
		});
	}
}

function PageController(){
	this.globalMsg = document.getElementById('errorMsg');
	this.maxNumParticipants; 
	this.start = function(){	
		
		this.personalMsg = new PersonalMsg(
			window.sessionStorage.getItem('username'),
			document.getElementById('id_username')
		);
		this.personalMsg.show();
		
		
		this.organizedMeetingsList = new MeetingList(
			document.getElementById('organizedMeetingsMsg'), 
			document.getElementById('organizedMeetings'),
			document.getElementById('organizedMeetingsBody')
		);
		
		this.invitedMeetingsList = new MeetingList(
			document.getElementById('invitedMeetingsMsg'),
			document.getElementById('invitedMeetings'),
			document.getElementById('invitedMeetingsBody')
		);
		
		this.meetingForm = new MeetingForm(
			document.getElementById('formErrorMsg'),
			document.getElementById('createMeetingForm'),
			document.getElementById('createMeetingFormMsg')
		);
		
		this.modalWindow = new ModalWindow(
			document.getElementById('modalWindow'),
			document.getElementById('modalMsg'),
			document.getElementById('formErrorMsg')
		);
		
	
		
		document.querySelector("a[href='Logout']").addEventListener('click', () => {
	        window.sessionStorage.removeItem('username');
	    });
	     
	    serverCall("GET","GetMaxNumParticipants",null, (xhr) => {
			if (xhr.readyState == 4){
						
				var message = xhr.responseText;
					if (xhr.status == 200)
						this.maxNumParticipants = parseInt(message);
				
					else if(xhr.status==403){
						window.location.href = xhr.getResponseHeader("Location");
                  		window.sessionStorage.removeItem('username');
					}
				}
			});
		
		this.refresh = function(){
			this.organizedMeetingsList.hide();
			this.invitedMeetingsList.hide();
			
			this.organizedMeetingsList.populateOrganizedMeetings();
			this.invitedMeetingsList.populateInvitedMeetings();
			this.meetingForm.createMeetingForm.reset();
		}
		
		this.showModalWindow = function(_meetingFields){
			this.meetingFields = _meetingFields;
			this.modalWindow.populate();
		}
		this.meetingForm.addButtonListener();
		this.modalWindow.addButtonListener();

		
		
		
		var self = this;
		
		window.onclick = function(e) {
  			if (e.target == document.getElementById('modalWindow')) {
    			self.modalWindow.modal.style.display = "none";
    			document.getElementById('participantsFieldset').innerHTML = "";
  			}
		}
	
	}
}
};
