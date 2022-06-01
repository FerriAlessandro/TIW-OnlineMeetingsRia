var pageController;

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
					else
						drawTable(organizedMeetingList);
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
					else
						drawTable(invitedMeetingList);
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
			date.textContent = mission.meetingDate;
			row.appendChild(date);
			
			duration = document.createElement("td");
			duration.textContent = mission.meetingDuration;
			row.appendChild(duration);
			
			if (mission.hasOwnProperty("organizerName")){
				organizer = document.createElement("td");
				organizer.textContent = missione.organizerName;
				row.appendChild(organizer);
			}
			
			self.meetingBody.innerHTML.appendChild(row);//appends a row to the current meetingBody
		});
		
		this.show(); //sets meetingTable content visible
	}
	
	function MeetingForm(_createMeetingForm, _createMeetingMsg){
		this.createMeetingForm = _createMeetingForm;
		this.createMeetingMsg = _createMeetingMsg;
		this.now = new Date();
		
		//TODO provare a sostituire con getELbyId		
		this.querySelector("input[type='datetime-local']").setAttribute('min',now.toISOString().substring(0,16));
		this.querySelector("input[type='number']").setAttribute('min',1);
		
		this.querySelector("input[type='button'].submit").addEventListener('click', (e) => {
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
		});
	}
	
	function ModalWindow(_modalWindow,_modalMsg,_msg){
		this.msg = _msg;
		this.modalWindow = _modalWindow;
		this.modalMsg = _modalMsg;
		this.attempts = 3;
		
		this.populate = function(){
			var self = this;
			
			serverCall("GET","GetUsers",null, (xhr) => {
				if (xhr.readyState == 4){
					var message = xhr.responseText;
					if (xhr.status == 200){
						var registeredUsers = JSON.parse(message);
						if (registeredUsers.length == 0){
							self.msg.textContent = "No users registered yet. Retry later";
							return;
						}
						else{
							self.attempts = 3;
							self.update(registeredUsers);
						}
					}
					else if (xhr.status == 500){
						self.msg = message;
					}
				}
			});
		}
		
		this.update = function(usersList){		
			var fieldset, checkbox, label, self = this;
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
			
			document.getElementById("submitParticipants").addEventListener('click', (e) => {
				
			});
			
			modal.style.display = "block"; //open modal window
		}
	}
}