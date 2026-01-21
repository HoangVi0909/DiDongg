import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'message'; // Loại thông báo
  isRead: boolean;
  createdAt: string;
  actionUrl?: string; // URL khi click vào notification
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications khi app start
  React.useEffect(() => {
    const loadNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem('userNotifications');
        if (saved) {
          const loaded = JSON.parse(saved);
          setNotifications(loaded);
          updateUnreadCount(loaded);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  const updateUnreadCount = (notiList: Notification[]) => {
    const count = notiList.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  };

  const addNotification = async (notification: Notification) => {
    try {
      const updated = [notification, ...notifications];
      setNotifications(updated);
      updateUnreadCount(updated);
      await AsyncStorage.setItem('userNotifications', JSON.stringify(updated));
      console.log('✅ Notification added:', notification.title);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updated);
      updateUnreadCount(updated);
      await AsyncStorage.setItem('userNotifications', JSON.stringify(updated));
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      updateUnreadCount(updated);
      await AsyncStorage.setItem('userNotifications', JSON.stringify(updated));
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const updated = notifications.filter((n) => n.id !== notificationId);
      setNotifications(updated);
      updateUnreadCount(updated);
      await AsyncStorage.setItem('userNotifications', JSON.stringify(updated));
      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await AsyncStorage.removeItem('userNotifications');
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
