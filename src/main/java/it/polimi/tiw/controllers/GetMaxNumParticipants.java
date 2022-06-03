package it.polimi.tiw.controllers;

import java.io.IOException;

import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.polimi.tiw.beans.Meeting;

@WebServlet("/GetMaxNumParticipants")
@MultipartConfig

public class GetMaxNumParticipants extends HttpServlet{
	private static final long serialVersionUID = 1L;
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String maxNumParticipants = Integer.toString(Meeting.MAX_PARTECIPANTS);
		response.setStatus(HttpServletResponse.SC_OK);
		response.getWriter().write(maxNumParticipants);
	}
}