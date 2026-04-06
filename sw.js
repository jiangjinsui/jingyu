const CACHE = 'jingyu-v2';

self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});

// 收到通知消息
self.addEventListener('push', e => {
    const data = e.data ? e.data.json() : { title: '静语', body: '你有新消息' };
    e.waitUntil(
        self.registration.showNotification(data.title || '静语', {
            body: data.body || '你有新消息',
            vibrate: [200, 100, 200],
            tag: 'jingyu-msg',
            renotify: true
        })
    );
});

// 点击通知打开页面
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
            if (cs.length) { cs[0].focus(); return; }
            return clients.openWindow('./');
        })
    );
});

// 接收主页面发来的通知请求
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SHOW_NOTIF') {
        self.registration.showNotification(e.data.title, {
            body: e.data.body,
            vibrate: [200, 100, 200],
            tag: 'jingyu-msg',
            renotify: true
        });
    }
});