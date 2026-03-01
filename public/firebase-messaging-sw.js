// firebase-messaging-sw.js
// Place this file in dogmart-admin/public/
// It enables background push notifications in the browser.

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCY3N4BzymXctBDuMcsRN_QvJ_0p7MrM1M",
    authDomain: "dog-mart-846bc.firebaseapp.com",
    projectId: "dog-mart-846bc",
    storageBucket: "dog-mart-846bc.firebasestorage.app",
    messagingSenderId: "864577837299",
    appId: "1:864577837299:web:placeholder",
    databaseURL: "https://dog-mart-846bc-default-rtdb.firebaseio.com",
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload?.notification ?? {};
    if (!title) return;

    self.registration.showNotification(title, {
        body: body || '',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: payload.data,
        actions: [{ action: 'open', title: 'Open Dashboard' }],
    });
});

// Notification click → open admin dashboard
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
