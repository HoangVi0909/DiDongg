import React, { createContext, useContext, useState } from 'react';

export interface AdminNotification {
  id?: string;
  title: string;
  message: string;
  type: 'promotion' | 'update' | 'alert' | 'news';
  targetUsers: 'all' | 'specific'; // all hoặc nhóm specific users
  targetUserIds?: string[];
  imageUrl?: string;
  actionUrl?: string;
  sentAt?: string;
  isActive: boolean;
}

interface AdminNotificationManagerType {
  notifications: AdminNotification[];
  loading: boolean;
  sendNotification: (notification: AdminNotification) => Promise<boolean>;
  updateNotification: (notification: AdminNotification) => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  fetchNotifications: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationManagerType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockNotifications: AdminNotification[] = [
        {
          id: '1',
          title: '🎉 Khuyến mãi mới',
          message: 'Giảm 20% cho tất cả sản phẩm bánh ngọt',
          type: 'promotion',
          targetUsers: 'all',
          sentAt: new Date().toISOString(),
          isActive: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notification: AdminNotification): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Call backend API
      const response = await fetch('http://localhost:8080/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          targetUsers: notification.targetUsers,
          targetUserIds: notification.targetUserIds || [],
          imageUrl: notification.imageUrl,
          actionUrl: notification.actionUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      const newNotification = {
        ...notification,
        id: result.notification?.id || Date.now().toString(),
        sentAt: new Date().toISOString(),
      };
      
      setNotifications([...notifications, newNotification]);
      console.log('✅ Notification sent:', newNotification);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateNotification = async (notification: AdminNotification): Promise<boolean> => {
    try {
      setLoading(true);
      setNotifications(notifications.map(n => n.id === notification.id ? notification : n));
      console.log('✅ Notification updated:', notification);
      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      console.log('✅ Notification deleted:', notificationId);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <AdminNotificationContext.Provider
      value={{ notifications, loading, sendNotification, updateNotification, deleteNotification, fetchNotifications }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotification must be used within AdminNotificationProvider');
  }
  return context;
}
