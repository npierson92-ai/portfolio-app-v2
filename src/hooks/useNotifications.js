import { useState, useEffect, useCallback } from 'react';

const PROXY = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

export function useNotifications() {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [subscribed, setSubscribed] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      await subscribeToPush();
    }
    return result === 'granted';
  }, []);

  const subscribeToPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setSubscribed(false); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await fetch(`${PROXY}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      setSubscribed(true);
    } catch (e) {
      console.error('Push subscription failed:', e);
      setSubscribed(false);
    }
  };

  // Send local notification (works without push subscription)
  const sendLocalNotification = useCallback((title, body, data = {}) => {
    if (permission !== 'granted') return;
    const reg = navigator.serviceWorker.controller;
    if (reg) {
      navigator.serviceWorker.ready.then(r => {
        r.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data,
          tag: data.ticker || 'portfolio',
          requireInteraction: true,
        });
      });
    } else {
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  }, [permission]);

  return { permission, subscribed, requestPermission, sendLocalNotification };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
