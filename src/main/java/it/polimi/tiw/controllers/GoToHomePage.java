package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import it.polimi.tiw.DAO.MeetingDAO;
import it.polimi.tiw.beans.Meeting;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/HomePage")

public class GoToHomePage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private TemplateEngine templateEngine;
	private Connection connection = null;
	
	
	public void init()throws ServletException{
		ServletContext servletContext = getServletContext();
		ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(servletContext);
		templateResolver.setTemplateMode(TemplateMode.HTML);
		this.templateEngine = new TemplateEngine();
		this.templateEngine.setTemplateResolver(templateResolver);
		templateResolver.setSuffix(".html");
		this.connection = ConnectionHandler.getConnection(servletContext);
	}
	
	public void doGet(HttpServletRequest request, HttpServletResponse response)throws ServletException, IOException{
		
		User currentUser = (User)request.getSession().getAttribute("user");
		MeetingDAO meetingDAO = new MeetingDAO(connection);
		try {
			List<Meeting> userMeetings = meetingDAO.getMeetingsByOwner(currentUser);
			List<Meeting> userInvitations = meetingDAO.GetUserInvitations(currentUser);
		
			String path = "/WEB-INF/home.html";
			ServletContext servletContext = getServletContext();
			final WebContext ctx = new WebContext(request, response, servletContext, request.getLocale());
			ctx.setVariable("userMeetings", userMeetings);
			ctx.setVariable("userInvitations", userInvitations);
			templateEngine.process(path, ctx, response.getWriter());
		}catch(SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal DataBase Error");
			return;
		}
		
	}
	
	public void DoPost(HttpServletRequest request, HttpServletResponse response)throws ServletException, IOException{
		doGet(request, response);
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
}