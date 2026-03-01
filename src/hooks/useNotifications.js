import { useState, useEffect, useCallback } from 'react';
import { messaging } from '../firebase/config';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

/**
 * useNotifications — admin web FCM hook
 *
 * Usage in any admin page:
 *   const { enabled, permission, enableNotifications } = useNotifications();
 *
 * Returns:
 *   enabled       — true if admin is subscribed to push
 *   permission    — 'default' | 'granted' | 'denied'
 *   enableNotifications — call to request & subscribe
 *   latestMessage — last foreground notification received
 */
export function useNotifications() {
    const [permission, setPermission] = useState(Notification.permission);
    const [enabled, setEnabled] = useState(false);
    const [latestMessage, setLatestMessage] = useState(null);

    const enableNotifications = useCallback(async () => {
        if (!('Notification' in window) || !messaging) return;

        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') return;

        try {
            // Register service worker
            const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: reg,
            });

            if (token) {
                // Subscribe to admin topic via backend
                try {
                    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/subscribe-admin`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token }),
                    });
                } catch (e) {
                    // Ignore if endpoint not available; token is still saved
                    console.warn('Could not subscribe to admin topic:', e.message);
                }

                localStorage.setItem('adminFcmToken', token);
                setEnabled(true);
                console.log('🔔 Admin FCM enabled');
            }
        } catch (e) {
            console.error('FCM setup error:', e);
        }
    }, []);

    // Foreground message listener
    useEffect(() => {
        if (!messaging) return;
        const unsub = onMessage(messaging, (payload) => {
            setLatestMessage(payload);
            // Show a browser notification even in foreground
            const { title, body } = payload.notification ?? {};
            if (title && Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/logo192.png' });
            }
        });
        return unsub;
    }, []);

    // Auto-enable if already granted
    useEffect(() => {
        if (Notification.permission === 'granted' && localStorage.getItem('adminFcmToken')) {
            setEnabled(true);
        }
    }, []);

    return { enabled, permission, enableNotifications, latestMessage };
}
