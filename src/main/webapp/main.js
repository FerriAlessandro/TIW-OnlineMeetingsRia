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
}