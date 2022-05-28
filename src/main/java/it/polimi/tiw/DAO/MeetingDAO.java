package it.polimi.tiw.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import it.polimi.tiw.beans.Meeting;
import it.polimi.tiw.beans.User;

public class MeetingDAO{
	
	private Connection connection;
	
	public MeetingDAO(Connection connection) {
		this.connection = connection;
		
	}
	
	public ArrayList<Meeting> getMeetingsByOwner(User user) throws SQLException {

		PreparedStatement preparedStatement;
		String query = "SELECT * FROM meetings WHERE id_organizer = ?";
		int id = user.getID();
		ResultSet resultSet;
		ArrayList<Meeting> meetings = new ArrayList<>();
		preparedStatement = connection.prepareStatement(query);
		preparedStatement.setInt(1, id);
		resultSet = preparedStatement.executeQuery();
		while (resultSet.next()) {

			long date_in_mills = resultSet.getLong("meeting_date"); // get date in milliseconds from the DB
			long duration_in_mills = resultSet.getLong("minutes"); // get duration in milliseconds from the DB
			Date currentDate = new Date();
			long current_time_in_mills = currentDate.getTime();
			// if the meeting end time is greater than the current time, show the meeting
			if (date_in_mills + duration_in_mills >= current_time_in_mills) {
	
				Meeting tmp = new Meeting();

				tmp.setTitle(resultSet.getString("title"));
				tmp.setDate(new Date(date_in_mills)); // Create a new Date from the milliseconds
				tmp.setDuration((int) (duration_in_mills / (1000 * 60))); // create a new int from the milliseconds
				tmp.setID(resultSet.getInt("id"));
				meetings.add(tmp);
			}
		}

		return meetings;

	}
	
	
	public ArrayList<Meeting> GetUserInvitations(User user) throws SQLException {

		PreparedStatement preparedStatement;
		ResultSet resultSet;
		ArrayList<Meeting> meetings = new ArrayList<>();

		String query = "Select meetings.id, meetings.title, meetings.meeting_date, meetings.minutes,meetings.id_organizer, user.username FROM meetings JOIN invitations ON meetings.id = invitations.id_meeting JOIN user ON meetings.id_organizer = user.id WHERE invitations.id_user = ?";
		int id = user.getID();
		preparedStatement = connection.prepareStatement(query);
		preparedStatement.setInt(1, id);
		resultSet = preparedStatement.executeQuery();


		while (resultSet.next()) {

			long date_in_mills = resultSet.getLong("meeting_date"); // get date in milliseconds from the DB
		
			long duration_in_mills = resultSet.getLong("minutes"); // get duration in milliseconds from the DB
			Date currentDate = new Date();
			long current_time_in_mills = currentDate.getTime();

			// if the meeting end time is greater than the current time, show the meeting
			if (date_in_mills + duration_in_mills >= current_time_in_mills) {

				Meeting tmp = new Meeting();

				tmp.setTitle(resultSet.getString("title"));	
				tmp.setDate(new Date(date_in_mills)); // Create a new Date from the milliseconds
				tmp.setDuration((int) (duration_in_mills / (1000 * 60))); // create a new int from the milliseconds
				tmp.setID(resultSet.getInt("id"));
				tmp.setOrganizerName(resultSet.getString("username"));
				tmp.setOrganizerId(resultSet.getInt("id_organizer"));

				meetings.add(tmp);
			}
		}
		
		return meetings;

	}
	
	public void createMeeting(List<Integer> guests, Meeting meeting) throws SQLException {
		PreparedStatement meetingPreparedStatement;
		PreparedStatement invitationPreparedStatement;
		PreparedStatement meetingIdPreparedStatement;
		
		ResultSet meetingIdResultSet;
		String addMeetingQuery = "INSERT INTO meetings (id_organizer,title,meeting_date,minutes) VALUES (?, ?, ?, ?)";
		String addInvitationQuery = "INSERT INTO invitations (id_user, id_meeting) VALUES (?, ?)";
		String getMeetingIdQuery = "SELECT max(id) FROM meetings";
		int meetingID;
		int id_organizer = meeting.getOrganizerId();
		String title = meeting.getTitle();
		Date date = meeting.getDate();
		int duration = meeting.getDuration();
		
		connection.setAutoCommit(false);
		try {
			meetingPreparedStatement = connection.prepareStatement(addMeetingQuery);
			meetingPreparedStatement.setInt(1, id_organizer);
			meetingPreparedStatement.setString(2, title);
			meetingPreparedStatement.setLong(3, date.getTime()); //date in ms
			meetingPreparedStatement.setLong(4, duration*60000); //duration in milliseconds
			meetingPreparedStatement.executeUpdate();
			
			meetingIdPreparedStatement = connection.prepareStatement(getMeetingIdQuery);
			meetingIdResultSet = meetingIdPreparedStatement.executeQuery();
			
			if(!meetingIdResultSet.isBeforeFirst())
				throw new SQLException();
			
			else {
				meetingIdResultSet.next();
				meetingID = meetingIdResultSet.getInt("max(id)");
			}
			
			invitationPreparedStatement = connection.prepareStatement(addInvitationQuery);
			
			for (Integer userID : guests) {
				invitationPreparedStatement.setInt(1,userID);
				invitationPreparedStatement.setInt(2,meetingID);
				invitationPreparedStatement.addBatch();
			}	
			
			invitationPreparedStatement.executeBatch();
			
		} catch (SQLException e) {
			connection.rollback(); // if update 1 OR 2 fails, roll back all work
			throw e;
			
		} finally {
			connection.setAutoCommit(true);
		}

	}
		
			
}
	
	