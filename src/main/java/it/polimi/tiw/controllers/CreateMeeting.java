package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.DAO.MeetingDAO;
import it.polimi.tiw.beans.Meeting;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/CreateMeeting")
@MultipartConfig
public class CreateMeeting extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public void init() throws ServletException{
		ServletContext servletContext = getServletContext();
		this.connection = ConnectionHandler.getConnection(servletContext);
	}
	
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		
		List<Integer> selectedUsersID = new ArrayList<>(); //ArrayList of Integers that contain the ID's of the already selected participants
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute("user");
		Meeting meeting = new Meeting();
		SimpleDateFormat formatter=new SimpleDateFormat("E MMM d HH:mm:ss Z yyyy");
		
		
		//We check the duration first because we need it for the date's validity check
		if(request.getParameter("duration").length() == 0 || request.getParameter("duration") == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Please input a valid duration");
			return;
		}

		meeting.setTitle(request.getParameter("title"));
		meeting.setOrganizerId(user.getID());
		meeting.setDuration(Integer.parseInt(request.getParameter("duration")));
		meeting.setOrganizerName(user.getUserName());
		try {
			meeting.setDate(formatter.parse(request.getParameter("date")));
		}catch(ParseException e ) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Invalid date format");
			return;
		}
		
		
		//IF THE USER DIDNT SELECT ANY PARTICIPANT
		if(request.getParameterValues("user_id") == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Please select atleast one participant");
			return;
		}
		
		Date currentDate = new Date(); //Get today's date
		//If today's date is greater than the meeting date or if the parameters are not valid
		if(meeting.getDate().getTime() < currentDate.getTime()){ 
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("You can't create a meeting in the past!");
			return;
		}
		
		if(meeting.getTitle().length()==0 || meeting.getTitle() == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Please select a title");
			return;
		}
		
		if(meeting.getDuration() <= 0) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("The duration must be positive!");
			return;
		}
		
		//extract the selected users from the checkbox
		String[] invitedUsers = request.getParameterValues("user_id");
		
		for(String id : invitedUsers) {
			User u = new User();
			u.setID(Integer.parseInt(id));
			selectedUsersID.add(u.getID());
		}
		
		
		//if the number of selected users is valid
		if(selectedUsersID.size() <= Meeting.MAX_PARTECIPANTS) {
			MeetingDAO meetingDAO = new MeetingDAO(connection);
			try {
				meetingDAO.createMeeting(selectedUsersID, meeting);
			} catch (SQLException e) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Internal database error");			
				return;
			}
			
			response.setStatus(HttpServletResponse.SC_OK);
			return;
		
		}
		
		//if the number of selected users is not valid
		else {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Too many participants selected. Please remove " 
					+ (selectedUsersID.size() - Meeting.MAX_PARTECIPANTS));
			return;
		}
			

	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}