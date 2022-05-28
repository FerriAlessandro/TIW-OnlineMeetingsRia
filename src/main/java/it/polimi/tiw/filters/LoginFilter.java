package it.polimi.tiw.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebFilter(urlPatterns = {"/CreateMeeting", "/HomePage", "/SendMeetingData"})


public class LoginFilter implements Filter{

	
	public LoginFilter() {
		
	}
	
	public void destroy() {
		//nothing to cleanup
	}
	
	public void init(FilterConfig config) throws ServletException{
		//Called exactly once from the Servlet Container 
	}
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		
		System.out.println("Checking");
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;
		String path = req.getServletContext().getContextPath() + "/index.html";
		HttpSession s = req.getSession();
		if(s.isNew()|| s.getAttribute("user") == null) {
			res.sendRedirect(path); //redirect to the login page
			return;
		}
		
		chain.doFilter(req, res); //chain is empty in this case
		
	}
	
	
}