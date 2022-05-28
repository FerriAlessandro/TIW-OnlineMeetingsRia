package it.polimi.tiw.beans;

public class User{
	
	private int id;
	private String userName;
	
	public User() {
		
	}
	
	
	public User(int id, String userName) {
		this.id = id;
		this.userName = userName;
	}
	
	public int getID() {
		return id;
	}
	
	public String getUserName() {
		return userName;
	}
	
	public void setID(int id) {
		this.id = id;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	
	
}