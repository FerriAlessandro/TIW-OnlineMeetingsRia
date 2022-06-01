package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import it.polimi.tiw.DAO.UserDAO;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/GetUsers")
@MultipartConfig

public class GetUsers extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	
	public void init()throws ServletException{
		ServletContext servletContext = getServletContext();
		this.connection = ConnectionHandler.getConnection(servletContext);
	}
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String jsonUsers;
		Gson gson = new Gson();
		User currentUser = (User)request.getSession().getAttribute("user");
		UserDAO userDAO = new UserDAO(connection);
		
		try {
			List<User> users = userDAO.GetRegisteredUsers(currentUser);
			jsonUsers = gson.toJson(users);
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(jsonUsers);
			
		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal Database error");
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