import { useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import { getApiUrl } from '../config/network';

/**
 * Component này chạy ở background để poll notifications từ backend
 * Mỗi 5 giây sẽ check một lần xem có thông báo mới nào
 */
export function NotificationPoller() {
  const { addNotification } = useNotification();
  const { userPhone } = useUser();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCheckRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    if (!userPhone) return;

    const pollNotifications = async () => {
      try {
        // Call backend để lấy thông báo mới
        const response = await fetch(
          `${getApiUrl()}/admin/notifications/new?since=${encodeURIComponent(lastCheckRef.current)}&userPhone=${userPhone}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // data là array of notifications
          if (Array.isArray(data) && data.length > 0) {
            console.log(`📬 Received ${data.length} new notifications`);
            
            // Add each notification
            for (const noti of data) {
              await addNotification({
                id: noti.id,
                title: noti.title,
                message: noti.message,
                type: noti.type || 'promotion',
                isRead: false,
                createdAt: noti.sentAt || new Date().toISOString(),
                actionUrl: noti.actionUrl,
              });
            }
            
            // Update last check time
            lastCheckRef.current = new Date().toISOString();
          }
        }
      } catch {
        // Silently fail - don't spam console in production
        // Notification polling check happens in background
      }
    };

    // Poll immediately on first load
    pollNotifications();

    // Set up polling interval - every 5 seconds
    pollingIntervalRef.current = setInterval(pollNotifications, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userPhone, addNotification]);

  return null; // This component doesn't render anything
}
