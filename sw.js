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
            tag: 'jingyu-' + Date.now()
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

// 接收主页面消息
self.addEventListener('message', e => {
    // 通知请求
    if (e.data && e.data.type === 'SHOW_NOTIF') {
        self.registration.showNotification(e.data.title, {
            body: e.data.body,
            vibrate: [200, 100, 200],
            tag: 'jingyu-' + Date.now()
        });
    }
    // 保活心跳：收到就回一个，让主页面知道 SW 还活着
    if (e.data === 'keepalive') {
        e.source && e.source.postMessage({ type: 'alive' });
    }
});

// 定时唤醒所有客户端（防止页面被冻结）
self.addEventListener('periodicsync', e => {
    if (e.tag === 'jingyu-keepalive') {
        e.waitUntil(
            clients.matchAll({ type: 'window' }).then(cs => {
                cs.forEach(c => c.postMessage({ type: 'sw-ping' }));
            })
        );
    }
});
