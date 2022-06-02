{

let pageController = new PageController(); //TODO estrarre max num partecipanti dal server quando carichi la pagina

window.addEventListener("load", () => {
    if (sessionStorage.getItem("username") == null) {
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
						self.msg.textContet = "This is a list of meetings organize by you: ";
						self.drawTable(organizedMeetingList);
					}
				}
				else if (xhr.status == 500)
					self.msg.textContent = message;
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
						self.msg.textContet = "This is a list of meetings you were invited to: ";
						self.drawTable(invitedMeetingList);
					}
				}
				else if (xhr.status == 500)
					self.msg.textContent = message;
			}	
		});
	}
	
	this.drawTable = function(meetingList){
		var row, title, date, duration, organizer, self = this;
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
	
	//TODO forse va resettato dopo il refresh? 
	
	//TODO provare a sostituire con getELbyId		
	this.createMeetingForm.querySelector("input[type='datetime-local']").setAttribute('min',this.now.toISOString().substring(0,16));
	this.createMeetingForm.querySelector("input[type='number']").setAttribute('min',1);
	
	this.createMeetingForm.querySelector("input[type='button'].submit").addEventListener('click', (e) => {
		var fieldset = e.target.closest('fieldset'), valid = true;
		
		for (let i = 0; i<fieldset.elements.length; i++){
			if (!fieldset.element[i].checkValidity()){
				//fieldset.element[i].reportValidity();
				valid = false;
				return;
			}
		}
		
		if (valid)
			pageController.showModalWindow();
		else 
			this.errormsg.textContent = "Invalid field content";
	}, false);
}
	
function ModalWindow(_modalWindow,_modalMsg,_msg){
	this.msg = _msg;
	this.modalMsg = _modalMsg;
	this.attempts = 3;
	this.modal = _modalWindow;
	
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
						this.update(registeredUsers);
						this.modal.style.display ='block';
						
					}
				}
				else if (xhr.status == 500){
					this.msg = message;
				}
			}
		});
	}
	
	this.update = function(usersList){		
		var fieldset, checkbox, label;
		fieldset = document.getElementById("participantsFieldset");
		
		usersList.forEach(function(user){
			checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.name = "user_id";
			checkbox.value = user.id;
			
			label = document.createElement("label");
			label.appendChild(document.createTextNode(user.userName));
			
			fieldset.appendChild(checkbox);
			fieldset.appendChild(label);
		});
		
		document.getElementById("cancel").addEventListener('click', (e) => {
			modal.style.display = "none"; //close modal window
		}, false);
		
		document.getElementById("submitParticipants").addEventListener('click', (e) => {
			var checkedParticipants =  document.querySelectorAll('input[name=user_id]:checked');
			
			if (checkedParticipants.lenght == 0){
				modalMsg.textContent = "Please select at least one participant";
				return;
			}
				
			else if(checkedParticipants.lenght <= pageController.maxNumParticipants){
				
				serverCall("POST","CreateMeeting",checkedParticipants, (xhr) => {
					
					if (xhr.readyState == 4){
						var message = xhr.responseText;
						
						if (xhr.status == 200){
							modal.style.display = "none"; //close modal window
							pageController.refresh();
						}
						
						else if(xhr.status == 500 || xhr.status == 400 || xhr.status == 403){
							modalMsg.textContent = message;
							return;
						}
					}
				}, false);
			}
			else{
				modalMsg.textContent = "You selected too many participants. Please remove at least " 
				+ (checkedParticipants.length - pageController.maxNumParticipants);
				this.attempts--;
				if (this.attempts == 0){
					modal.style.display = "none"; //close modal window
					this.msg.textContent = "Three unsuccessful attempts to create a meeting were made, " +
					 	"the meeting will not be created";
				}
			}
		}, false);
	}
}

function PageController(){
	this.globalMsg = document.getElementById('errorMsg');
	
	this.start = function(){	
		var self=this;
		
		this.personalMsg = new PersonalMsg(
			window.sessionStorage.getItem('username'),
			document.getElementById('id_username')
		);
		
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
			document.getElementsByClassName('modalWindow'),
			document.getElementById('modalMsg'),
			this.globalMsg
		);
		
		document.querySelector("a[href='Logout']").addEventListener('click', () => {
	        window.sessionStorage.removeItem('username');
	    });
	     
	    serverCall("GET","GetMaxNumParticipants",null, (xhr) => {
		
			var message = xhr.responseText;
				if (xhr.status == 200)
					self.maxNumParticipants = JSON.parse(message);
		});
		
		this.refresh = function(){
			this.organizedMeetingsList.hide();
			this.invitedMeetingsList.hide();
			
			this.organizedMeetingsList.populateOrganizedMeetings();
			this.invitedMeetingsList.populateInvitedMeetings();
		}
		
		this.showModalWindow = function(){
			this.modalWindow.populate();
		}
	}
}
};
