'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Mail, ShoppingCart, Star, X } from 'lucide-react';
import { playNotificationSound, unlockNotificationAudio } from '@/lib/notificationSound';

export type AdminNotificationSection = 'orders' | 'subscribers' | 'reviews';

interface AdminNotification {
  id: string;
  type: 'order' | 'subscriber' | 'review';
  title: string;
  message: string;
  section: AdminNotificationSection;
  createdAt: string;
}

interface AdminNotificationsProps {
  adminToken: string;
  onNavigate: (section: AdminNotificationSection) => void;
  variant?: 'dark' | 'light';
}

const SEEN_STORAGE_KEY = 'peaknuts_admin_seen_notifications';
const POLL_INTERVAL_MS = 20000;
const MAX_SEEN = 300;
const MAX_ITEMS = 30;

function readSeen(): { ids: Set<string>; hasHistory: boolean } {
  if (typeof window === 'undefined') return { ids: new Set<string>(), hasHistory: false };
  try {
    const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return { ids: new Set<string>(), hasHistory: false };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const ids = new Set<string>(parsed.filter((value) => typeof value === 'string'));
      return { ids, hasHistory: ids.size > 0 };
    }
  } catch {}
  return { ids: new Set<string>(), hasHistory: false };
}

function persistSeen(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-MAX_SEEN)));
  } catch {}
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function iconFor(type: AdminNotification['type']) {
  if (type === 'order') return ShoppingCart;
  if (type === 'subscriber') return Mail;
  return Star;
}

function iconStyles(type: AdminNotification['type']) {
  if (type === 'order') return 'bg-amber-100 text-amber-700';
  if (type === 'subscriber') return 'bg-blue-100 text-blue-700';
  return 'bg-emerald-100 text-emerald-700';
}

function requestBrowserPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (window.Notification.permission === 'default') {
    window.Notification.requestPermission().catch(() => {});
  }
}

export default function AdminNotifications({ adminToken, onNavigate, variant = 'dark' }: AdminNotificationsProps) {
  const isLight = variant === 'light';
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<AdminNotification[]>([]);

  const seenRef = useRef<Set<string>>(new Set());
  const hasHistoryRef = useRef(false);
  const firstPollRef = useRef(true);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    const { ids, hasHistory } = readSeen();
    seenRef.current = ids;
    hasHistoryRef.current = hasHistory;
  }, []);

  useEffect(() => {
    const unlock = () => {
      unlockNotificationAudio();
      requestBrowserPermission();
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const showBrowserNotification = useCallback(
    (fresh: AdminNotification[]) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (window.Notification.permission !== 'granted') return;
      fresh.slice(0, 3).forEach((item) => {
        try {
          const native = new window.Notification(item.title, {
            body: item.message,
            tag: item.id,
            icon: '/favicon.ico',
          });
          native.onclick = () => {
            window.focus();
            onNavigateRef.current(item.section);
            native.close();
          };
        } catch {}
      });
    },
    []
  );

  const poll = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${adminToken}` },
        cache: 'no-store',
      });
      if (!res.ok) return;

      const data = await res.json();
      const incoming: AdminNotification[] = Array.isArray(data.notifications)
        ? data.notifications
        : [];
      if (incoming.length === 0) return;

      const seen = seenRef.current;
      const fresh = incoming.filter((item) => !seen.has(item.id));
      incoming.forEach((item) => seen.add(item.id));
      persistSeen(seen);

      const isFirstPoll = firstPollRef.current;
      firstPollRef.current = false;

      if (!hasHistoryRef.current) {
        hasHistoryRef.current = true;
        setItems(incoming.slice(0, MAX_ITEMS));
        return;
      }

      if (fresh.length === 0) return;

      setItems((prev) => {
        const merged = new Map<string, AdminNotification>();
        fresh.concat(prev).forEach((item) => merged.set(item.id, item));
        return Array.from(merged.values())
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, MAX_ITEMS);
      });
      setUnread((count) => count + fresh.length);

      if (!isFirstPoll) {
        playNotificationSound();
        showBrowserNotification(fresh);
        setToasts((prev) => fresh.concat(prev).slice(0, 3));
      }
    } catch {}
  }, [adminToken, showBrowserNotification]);

  useEffect(() => {
    if (!adminToken) return;
    let cancelled = false;
    const run = () => {
      if (!cancelled) void poll();
    };

    run();
    const timer = window.setInterval(run, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [adminToken, poll]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.slice(0, -1));
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const handleToggle = () => {
    unlockNotificationAudio();
    requestBrowserPermission();
    if (!open) setUnread(0);
    setOpen((value) => !value);
  };

  const handleOpenItem = (item: AdminNotification) => {
    onNavigate(item.section);
    setOpen(false);
    setUnread((count) => Math.max(0, count - 1));
    setToasts((prev) => prev.filter((toast) => toast.id !== item.id));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        title="Notifications"
        className={`relative flex items-center gap-2 transition-colors ${
          isLight
            ? 'px-3 py-2 rounded-xl bg-white border border-gray-200 text-brand-charcoal hover:bg-gray-50 shadow-sm'
            : 'p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300'
        }`}
      >
        {unread > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {isLight && <span className="hidden sm:inline text-xs font-semibold">Notifications</span>}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-left">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-charcoal" />
              <h3 className="text-xs font-bold text-brand-charcoal">Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnread(0)}
                className="text-[10px] font-semibold text-brand-darkgreen hover:underline"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => {
                  setItems([]);
                  setUnread(0);
                }}
                className="text-[10px] font-semibold text-gray-400 hover:text-red-500"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-6 h-6 mx-auto text-gray-300" />
                <p className="text-[11px] text-gray-400 mt-2">No notifications yet</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  New orders, subscribers and reviews will appear here.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const Icon = iconFor(item.type);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenItem(item)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <span
                      className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconStyles(item.type)}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-brand-charcoal">{item.title}</span>
                        <span className="text-[9px] text-gray-400 shrink-0">{timeAgo(item.createdAt)}</span>
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5 break-words">{item.message}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-[70] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const Icon = iconFor(toast.type);
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white border border-gray-200 shadow-2xl rounded-2xl p-3 flex items-start gap-3"
            >
              <span
                className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconStyles(toast.type)}`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => handleOpenItem(toast)}
                className="flex-1 min-w-0 text-left"
              >
                <span className="block text-[11px] font-bold text-brand-charcoal">{toast.title}</span>
                <span className="block text-[10px] text-gray-500 mt-0.5 break-words">{toast.message}</span>
              </button>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                aria-label="Dismiss notification"
                className="p-1 text-gray-400 hover:text-brand-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
