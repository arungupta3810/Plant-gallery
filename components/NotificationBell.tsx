'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Notification } from '@/lib/api';
import { useCart } from './CartContext';
import Icon from './Icon';

export default function NotificationBell() {
  const { user, authReady } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (!user) return;
    api.notifications().then((d) => { setItems(d.items); setUnread(d.unread); }).catch(() => {});
  }, [user]);

  // initial load + poll every 30s while logged in
  useEffect(() => {
    if (!authReady || !user) { setItems([]); setUnread(0); return; }
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [authReady, user, load]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!authReady || !user) return null;

  const openMenu = () => { setOpen((o) => !o); if (!open) load(); };

  const onItem = async (n: Notification) => {
    if (!n.read) {
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      api.markNotificationRead(n.id).catch(() => {});
    }
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  const markAll = () => {
    setItems((list) => list.map((x) => ({ ...x, read: true })));
    setUnread(0);
    api.markAllNotificationsRead().catch(() => {});
  };

  return (
    <div className="notif" ref={ref}>
      <button className="iconbtn" aria-label="Notifications" onClick={openMenu}>
        <Icon name="bell" size={21} />
        {unread > 0 && <span className="count">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-menu">
          <div className="notif-head">
            <strong>Notifications</strong>
            {unread > 0 && <button className="link-arrow" style={{ fontSize: 13 }} onClick={markAll}>Mark all read</button>}
          </div>

          {items.length === 0 ? (
            <div className="notif-empty">
              <Icon name="bell" size={24} color="var(--fg-3)" />
              <p>You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="notif-list">
              {items.map((n) => (
                <button key={n.id} className={'notif-item' + (n.read ? '' : ' unread')} onClick={() => onItem(n)}>
                  <span className="dot" />
                  <span className="body">
                    <span className="t">{n.title}</span>
                    <span className="b">{n.body}</span>
                    <span className="when">{new Date(n.createdAt).toLocaleString()}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
