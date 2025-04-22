package com.rtc;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class signalingHandler extends TextWebSocketHandler{

	private final List<WebSocketSession> sessions=new ArrayList<WebSocketSession>();
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session)
	{
		sessions.add(session);
	}
	
	@Override
	public void handleTextMessage(WebSocketSession session,TextMessage message) throws IOException
	{
		for(WebSocketSession s:sessions)
		{
			if(s.getId().equals(session.getId()))
			{
				s.sendMessage(message);
			}
		}
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session,CloseStatus status)
	{
		sessions.remove(session);
	}
}
