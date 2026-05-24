import { useState, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(() => {
    try {
      return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    } catch {
      return 'denied';
    }
  });

  const requestPermission = useCallback(async () => {
    try {
      if (typeof Notification === 'undefined') return false;
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, []);

  const sendLocalNotification = useCallback((title, body) => {
    try {
      if (typeof Notification === 'undefined' || permission !== 'granted') return;
      new Notification(title, { body, icon: '/icon-192.png' });
    } catch {}
  }, [permission]);

  return { permission, subscribed: false, requestPermission, sendLocalNotification };
}
