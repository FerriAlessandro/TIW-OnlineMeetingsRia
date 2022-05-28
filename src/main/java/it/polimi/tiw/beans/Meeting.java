package it.polimi.tiw.beans;

import java.util.Date;

public class Meeting{
	
	public static final int MAX_PARTECIPANTS = 5;
	private int id;
	private String title;
	private int id_organizer;
	private String organizerName;
	private Date meetingDate; 
	private int meetingDuration; //in minutes
	
	
	public Meeting(int id, String title, Date date, int duration) {
		this.id = id;
		this.title = title;
		this.meetingDate = date;
		this.meetingDuration = duration;
	}
	
	public Meeting() {
	
	}
	
	
	public int getID() {
		return id;
	}
	
	public String getOrganizerName() {
		return organizerName;
	}
	
	public String getTitle() {
		return title;
	}
	
	public Date getDate() {
		return meetingDate;
	}
	
	
	public int getDuration() {
		return meetingDuration;
	}
	
	public void setID(int id) {
		this.id = id;
	}
	
	public void setOrganizerName(String username) {
		this.organizerName = username;
	}
	
	public int getOrganizerId() {
		return this.id_organizer;
	}
	
	public void setOrganizerId(int id_organizer) {
		this.id_organizer = id_organizer;
	}

	
	public void setTitle(String title) {
		this.title = title;
	}
	
	public void setDate(Date date) {
		this.meetingDate = date;
	}

	public void setDuration(int minutes) {
		this.meetingDuration = minutes;
	}
}