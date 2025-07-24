import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;

    // Connect to Socket.IO
    const socket = io('http://localhost:5000', {
      query: { user_id: userId }
    });

    // Listen for new notifications
    socket.on('new_notification', (data) => {
      if (data.user_id.toString() === userId) {
        setNotifications(prev => [{
          id: Date.now(), // temporary ID
          message: data.message,
          timestamp: data.timestamp,
          is_read: false
        }, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    // Load existing notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:5000/notifications/${userId}`);
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    return () => socket.disconnect();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/notifications/mark_read/${notificationId}`, {
        method: 'PUT'
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="notifications-page">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.is_read ? '' : 'unread'}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <p>{notification.message}</p>
              <small>
                {new Date(notification.created_at || notification.timestamp).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;