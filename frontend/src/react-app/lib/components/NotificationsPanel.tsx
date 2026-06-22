
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Flame, Target, UserCog, KeyRound, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { apiFetch } from '../api';

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Notification {
  _id: string;
  type: 'reminder' | 'achievement' | 'system';
  title: string;
  body: string;
  status: 'scheduled' | 'sent' | 'failed' | 'dismissed';
  createdAt: string;
}

interface NotificationsPanelProps {
  isDarkMode: boolean;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getNotificationIcon(title: string) {
  if (title.includes('🎯') || title.includes('Completed')) return <Target size={16} className="text-green-400" />;
  if (title.includes('🔥') || title.includes('Streak') || title.includes('⚡') || title.includes('💪')) return <Flame size={16} className="text-orange-400" />;
  if (title.includes('🔑') || title.includes('Password')) return <KeyRound size={16} className="text-amber-400" />;
  if (title.includes('✏️') || title.includes('Profile')) return <UserCog size={16} className="text-blue-400" />;
  if (title.includes('🔄') || title.includes('Sync')) return <RefreshCw size={16} className="text-cyan-400" />;
  if (title.includes('🎉') || title.includes('Welcome')) return <Sparkles size={16} className="text-purple-400" />;
  if (title.includes('🏆') || title.includes('👑')) return <Sparkles size={16} className="text-amber-400" />;
  return <Bell size={16} className="text-gray-400" />;
}

function getNotificationAccent(title: string): string {
  if (title.includes('🎯') || title.includes('Completed')) return 'border-green-500/20 bg-green-500/5';
  if (title.includes('🔥') || title.includes('Streak') || title.includes('⚡')) return 'border-orange-500/20 bg-orange-500/5';
  if (title.includes('🔑') || title.includes('Password')) return 'border-amber-500/20 bg-amber-500/5';
  if (title.includes('✏️') || title.includes('Profile')) return 'border-blue-500/20 bg-blue-500/5';
  if (title.includes('🔄') || title.includes('Sync')) return 'border-cyan-500/20 bg-cyan-500/5';
  if (title.includes('🎉') || title.includes('Welcome')) return 'border-purple-500/20 bg-purple-500/5';
  return 'border-white/5 bg-white/5';
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function NotificationsPanel({ isDarkMode }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Theme tokens ──────────────────────────────────────────────────── */
  const CARD = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
  const TXT = isDarkMode ? 'text-white' : 'text-gray-900';
  const MUTED = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const PANEL_BG = isDarkMode ? 'bg-[#111111]' : 'bg-gray-50';
  const HOVER = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  /* ── Fetch unread count ────────────────────────────────────────────── */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await apiFetch<{ count: number }>('/notifications/unread-count');
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  /* ── Fetch all notifications ───────────────────────────────────────── */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: data } = await apiFetch<{ notifications: Notification[] }>('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => n.status !== 'dismissed').length);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Auto-poll unread count every 30s ──────────────────────────────── */
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  /* ── Load full list when panel opens ───────────────────────────────── */
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  /* ── Close on outside click ────────────────────────────────────────── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /* ── Dismiss single ────────────────────────────────────────────────── */
  const dismiss = async (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'dismissed' as const } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await apiFetch(`/notifications/${id}/dismiss`, { method: 'POST' });
    } catch { /* revert on error if needed */ }
  };

  /* ── Dismiss all ───────────────────────────────────────────────────── */
  const dismissAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'dismissed' as const })));
    setUnreadCount(0);
    try {
      await apiFetch('/notifications/dismiss-all', { method: 'POST' });
    } catch { /* revert on error if needed */ }
  };

  const activeNotifs = notifications.filter(n => n.status !== 'dismissed');
  const dismissedNotifs = notifications.filter(n => n.status === 'dismissed');

  return (
    <div ref={panelRef} className="relative">
      {/* ── Bell trigger ──────────────────────────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
            : isDarkMode
            ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        }`}
      >
        <Bell size={17} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-red-500/30"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Dropdown panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`absolute top-12 left-0 w-[360px] max-h-[520px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden z-[100] ${CARD}`}
            style={{ boxShadow: isDarkMode ? '0 25px 60px rgba(0,0,0,0.6)' : '0 25px 60px rgba(0,0,0,0.12)' }}
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black ${TXT}`}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-green-500/15 text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {activeNotifs.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={dismissAll}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${HOVER} ${MUTED}`}
                    title="Dismiss all"
                  >
                    <CheckCheck size={13} />
                    Clear all
                  </motion.button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${HOVER} ${MUTED} transition-colors`}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────── */}
            <div className={`flex-1 overflow-y-auto ${PANEL_BG}`} style={{ scrollbarWidth: 'thin' }}>
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`animate-pulse rounded-xl border p-4 ${CARD}`}>
                      <div className={`h-3 rounded w-1/2 mb-2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-2 rounded w-3/4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                /* ── Empty state ──────────────────────────────────────── */
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <Bell size={28} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
                  </div>
                  <p className={`text-sm font-bold ${MUTED}`}>All quiet here!</p>
                  <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                    You'll see notifications when you complete habits, hit streaks, or update your profile.
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {/* Active notifications */}
                  {activeNotifs.map((notif, i) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-default ${getNotificationAccent(notif.title)}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                        {getNotificationIcon(notif.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-tight ${TXT}`}>{notif.title}</p>
                        <p className={`text-[11px] mt-0.5 leading-snug ${MUTED}`}>{notif.body}</p>
                        <p className={`text-[10px] mt-1 font-semibold ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => dismiss(notif._id)}
                        className={`opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-opacity ${HOVER} ${MUTED}`}
                        title="Dismiss"
                      >
                        <X size={12} />
                      </motion.button>
                    </motion.div>
                  ))}

                  {/* Dismissed section */}
                  {dismissedNotifs.length > 0 && activeNotifs.length > 0 && (
                    <div className={`border-t my-2 ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`} />
                  )}
                  {dismissedNotifs.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-bold tracking-widest px-3 py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                        EARLIER
                      </p>
                      {dismissedNotifs.slice(0, 10).map((notif, i) => (
                        <motion.div
                          key={notif._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-all opacity-50`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                            {getNotificationIcon(notif.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold leading-tight ${MUTED}`}>{notif.title}</p>
                            <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>{notif.body}</p>
                            <p className={`text-[10px] mt-1 font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-200'}`}>
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            {notifications.length > 0 && (
              <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <p className={`text-[10px] font-bold text-center tracking-wider ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
