import React, { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function FCMManager() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !messaging) return;

        const initFCM = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const token = await getToken(messaging, {
                        vapidKey: '211343353004' // Usually from Firebase console
                    });

                    if (token) { // Changed from currentToken to token to match original variable name
                        console.log('Got FCM token for admin web:', token); // Changed message and variable name
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://65.2.129.246:3001';
                        // Send token to backend to subscribe to 'admin' topic
                        await fetch(`${apiUrl}/api/notifications/subscribe-admin`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: token }) // Changed to token: token
                        });
                    }
                }
            } catch (e) {
                console.error('FCM Init Error:', e);
            }
        };

        initFCM();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('🔔 Foreground message:', payload);
            new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/vite.svg'
            });
        });

        return () => unsubscribe();
    }, [user]);

    return null;
}
