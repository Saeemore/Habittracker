import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, CheckCircle, BarChart2, User,
    Trophy, Globe, Flame, Shield, Sun, Lock,
    Pencil, Users, RefreshCw, Settings, Share2, Brain, X, KeyRound
} from 'lucide-react';
import { ApiError, apiFetch } from '../../api';
import { updateProfile, forgotPassword, resetPassword } from '../../auth';
import { type SessionUser, type StoredHabit, loadStoredHabits, saveStoredHabits } from '../../storage';

interface ProfileSectionProps {
    isDarkMode: boolean;
    setActiveSection?: (section: string) => void;
    currentUser: SessionUser | null;
    onUserUpdate?: (updatedUser: SessionUser) => void;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR'];
const HEATMAP: number[][] = [
    [0, 1, 2, 3, 4, 2, 1, 3, 4, 3, 2, 1, 2, 3, 4, 3],
    [1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 3, 2, 1, 2, 3, 4],
    [2, 3, 4, 2, 1, 3, 4, 2, 0, 1, 2, 3, 4, 3, 2, 1],
    [3, 4, 2, 1, 2, 3, 4, 3, 2, 1, 0, 2, 3, 4, 3, 2],
];

const MINI_ACHIEVEMENTS = [
    { id: '1', label: '7-Day\nWarrior', icon: Shield, earned: true, color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/25' },
    { id: '2', label: 'Early\nBird', icon: Sun, earned: true, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25' },
    { id: '3', label: 'Consistency\nKing', icon: Lock, earned: false, color: 'text-gray-600', bg: 'bg-white/5', border: 'border-white/5' },
    { id: '4', label: 'Deep\nFocus', icon: Lock, earned: false, color: 'text-gray-600', bg: 'bg-white/5', border: 'border-white/5' },
];

export default function ProfileSection({ isDarkMode, setActiveSection, currentUser, onUserUpdate }: ProfileSectionProps) {
    const username = currentUser?.username || localStorage.getItem('username') || 'Alex Rivera';
    const userEmail = currentUser?.email || localStorage.getItem('trackify:session-user') ? JSON.parse(localStorage.getItem('trackify:session-user') || '{}').email : '';

    /* ── modals states ─────────────────────────────────────────────────── */
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editUsername, setEditUsername] = useState(username);
    const [editEmail, setEditEmail] = useState(userEmail || '');
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [changeStep, setChangeStep] = useState(1); // 1 = send code, 2 = verify & reset
    const [changeCode, setChangeCode] = useState('');
    const [changePassword, setChangePassword] = useState('');
    const [changeError, setChangeError] = useState('');
    const [changeSuccess, setChangeSuccess] = useState('');
    const [changeLoading, setChangeLoading] = useState(false);

    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [syncMessage, setSyncMessage] = useState('');

    /* ── theme tokens ────────────────────────────────────────────────────── */
    const BG = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
    const CARD = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
    const HCARD = isDarkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-gray-50 border-gray-100';
    const TXT = isDarkMode ? 'text-white' : 'text-gray-900';
    const MUTED = isDarkMode ? 'text-gray-500' : 'text-gray-400';
    const HOV = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';
    const INPUT = isDarkMode
        ? 'bg-[#222] border-white/10 text-white placeholder-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500'
        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500';

    const heatColor = (v: number) => {
        if (v === 0) return isDarkMode ? 'bg-white/5' : 'bg-gray-100';
        if (v === 1) return isDarkMode ? 'bg-green-900/50' : 'bg-green-100';
        if (v === 2) return isDarkMode ? 'bg-green-700/60' : 'bg-green-200';
        if (v === 3) return 'bg-green-500';
        return 'bg-green-400';
    };

    /* ── Handlers ───────────────────────────────────────────────────────── */
    const handleEditProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editUsername || !editEmail) {
            setEditError('Please fill in all fields');
            return;
        }
        setEditLoading(true);
        setEditError('');
        try {
            const result = await updateProfile({ username: editUsername, email: editEmail });
            if (onUserUpdate) {
                onUserUpdate(result.user);
            }
            setIsEditProfileOpen(false);
        } catch (err) {
            if (err instanceof ApiError) setEditError(err.message);
            else setEditError('Failed to update profile. Please try again.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleRequestChangeCode = async () => {
        if (!userEmail) {
            setChangeError('No email associated with this account');
            return;
        }
        setChangeLoading(true);
        setChangeError('');
        setChangeSuccess('');
        try {
            await forgotPassword(userEmail);
            setChangeSuccess('Code sent! Check backend console / password_reset_log.txt');
            setChangeStep(2);
        } catch (err) {
            if (err instanceof ApiError) setChangeError(err.message);
            else setChangeError('Failed to send verification code.');
        } finally {
            setChangeLoading(false);
        }
    };

    const handleChangePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!changeCode || !changePassword) {
            setChangeError('Please fill in all fields');
            return;
        }
        if (changeCode.length !== 6) {
            setChangeError('Code must be 6 digits');
            return;
        }
        setChangeLoading(true);
        setChangeError('');
        setChangeSuccess('');
        try {
            await resetPassword(userEmail, changeCode, changePassword);
            setChangeSuccess('Password changed successfully!');
            setTimeout(() => {
                setIsChangePasswordOpen(false);
                setChangeStep(1);
                setChangeCode('');
                setChangePassword('');
                setChangeSuccess('');
            }, 2000);
        } catch (err) {
            if (err instanceof ApiError) setChangeError(err.message);
            else setChangeError('Failed to change password. Please verify the code.');
        } finally {
            setChangeLoading(false);
        }
    };

    const handleSyncData = async () => {
        setSyncStatus('syncing');
        setSyncMessage('Connecting to cloud database...');
        try {
            // Simulate networking delay for visual polish
            await new Promise(r => setTimeout(r, 1200));
            
            // 1. Fetch remote habits
            setSyncMessage('Downloading database habits...');
            const { habits: remoteHabits } = await apiFetch<{ habits: any[] }>('/habits');
            
            // 2. Load local habits
            setSyncMessage('Syncing local habits offline progress...');
            const localHabits = loadStoredHabits(currentUser);
            const updatedLocalHabits: StoredHabit[] = [...localHabits];
            
            // 3. Post local habits without Mongo ObjectId to the backend
            let uploadCount = 0;
            for (let i = 0; i < updatedLocalHabits.length; i++) {
                const local = updatedLocalHabits[i];
                const isMongoId = /^[0-9a-fA-F]{24}$/.test(local.id);
                if (!isMongoId) {
                    uploadCount++;
                    const { habit: created } = await apiFetch<{ habit: any }>('/habits', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: local.name,
                            endGoal: local.endGoal || 'Daily goal',
                            category: local.category || 'Other',
                            targetTime: local.targetTime || 'Any time'
                        })
                    });
                    updatedLocalHabits[i] = {
                        ...local,
                        id: created._id
                    };
                }
            }

            // 4. Match names / ids of remote habits
            let downloadCount = 0;
            for (const remote of remoteHabits) {
                const existsLocally = updatedLocalHabits.some(l => l.id === remote._id || l.name.toLowerCase() === remote.name.toLowerCase());
                if (!existsLocally) {
                    downloadCount++;
                    updatedLocalHabits.push({
                        id: remote._id,
                        name: remote.name,
                        endGoal: remote.endGoal || '',
                        targetTime: remote.targetTime || '',
                        completed: false,
                        category: remote.category || 'Other',
                        streak: remote.currentStreak || 0
                    });
                } else {
                    const idx = updatedLocalHabits.findIndex(l => l.name.toLowerCase() === remote.name.toLowerCase());
                    if (idx !== -1) {
                        updatedLocalHabits[idx] = {
                            ...updatedLocalHabits[idx],
                            id: remote._id,
                            streak: Math.max(updatedLocalHabits[idx].streak, remote.currentStreak || 0)
                        };
                    }
                }
            }

            // 5. Save updated array to localStorage
            saveStoredHabits(updatedLocalHabits, currentUser);
            
            setSyncStatus('success');
            setSyncMessage(`Sync completed! Uploaded ${uploadCount} habits, downloaded ${downloadCount} habits.`);

            // Fire-and-forget: create a sync notification on the backend
            apiFetch('/notifications/sync-complete', {
                method: 'POST',
                body: JSON.stringify({ uploadCount, downloadCount })
            }).catch(() => { /* ignore */ });
            
            // Auto close success status after 3 seconds
            setTimeout(() => {
                setSyncStatus('idle');
                setSyncMessage('');
            }, 3500);

        } catch (err) {
            setSyncStatus('error');
            if (err instanceof ApiError) setSyncMessage(err.message);
            else setSyncMessage('Sync failed. Please check your network connection.');
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden ${BG} transition-colors duration-300 relative`}>

            {/* ═══ MAIN ═══════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 h-full overflow-y-auto">
                <div className="p-4 md:p-6 pb-24 md:pb-8 w-full">

                    {/* ── Top action row ──────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-6">
                        <button className={`w-10 h-10 rounded-xl border flex items-center justify-center ${CARD} ${HOV} transition-colors`}>
                            <Settings size={17} className={MUTED} />
                        </button>
                        <h1 className={`text-base font-black ${TXT}`}>Profile</h1>
                        <button className={`w-10 h-10 rounded-xl border flex items-center justify-center ${CARD} ${HOV} transition-colors`}>
                            <Share2 size={17} className={MUTED} />
                        </button>
                    </motion.div>

                    {/* ── Avatar + name ───────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="flex flex-col items-center mb-6">
                        {/* Avatar ring */}
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-black ${isDarkMode ? 'bg-[#1c1c1c]' : 'bg-gray-100'} ${TXT}`}>
                                    {username[0]?.toUpperCase()}
                                </div>
                            </div>
                            {/* LVL badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-green-500/30 whitespace-nowrap">
                                LVL 12
                            </div>
                        </div>

                        <h2 className={`text-2xl font-black mt-1 ${TXT}`}>{username}</h2>
                        <p className={`text-sm mt-0.5 ${MUTED}`}>Habit Architect</p>

                        {/* XP bar */}
                        <div className="w-full max-w-xs mt-5">
                            <div className={`relative h-8 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: '75%' }}
                                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                                    className="absolute inset-y-0 left-0 rounded-full bg-green-500" />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white z-10">
                                    450 / 600 XP
                                </span>
                            </div>
                            <p className={`text-center text-[10px] font-black tracking-widest mt-1.5 ${MUTED}`}>
                                NEXT LEVEL: MASTER BUILDER
                            </p>
                        </div>
                    </motion.div>

                    {/* ── Stats grid 2×2 ──────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 gap-3 mb-4">
                        {[
                            { icon: Flame, label: 'Total Streak', value: '15 days', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                            { icon: CheckCircle, label: 'Completed', value: '128', color: 'text-green-400', bg: 'bg-green-500/10' },
                            { icon: Trophy, label: 'Best Streak', value: '42 days', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { icon: Globe, label: 'Global Rank', value: '#1,402', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className={`border rounded-2xl p-4 ${HCARD}`}>
                                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                                    <Icon size={18} className={color} />
                                </div>
                                <p className={`text-xs font-semibold mb-0.5 ${MUTED}`}>{label}</p>
                                <p className={`text-xl font-black ${TXT}`}>{value}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* ── Achievements mini row ────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={`border rounded-2xl p-5 mb-4 ${CARD}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-base font-black ${TXT}`}>Achievements</h3>
                            <button
                                onClick={() => setActiveSection?.('achievements')}
                                className="text-xs font-bold text-green-500 hover:text-green-400 transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {MINI_ACHIEVEMENTS.map((a, i) => {
                                const Icon = a.icon;
                                return (
                                    <motion.div key={a.id}
                                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.08 * i, type: 'spring', stiffness: 280 }}
                                        className="flex flex-col items-center gap-1.5">
                                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center
                                            ${a.earned ? `${a.bg} ${a.border}` : isDarkMode ? 'bg-white/5 border-white/5 opacity-40' : 'bg-gray-100 border-gray-200 opacity-40'}`}>
                                            <Icon size={22} className={a.earned ? a.color : isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                                        </div>
                                        <p className={`text-[9px] font-bold text-center leading-tight whitespace-pre-line ${a.earned ? MUTED : isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                                            {a.label}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* ── Habit Style card ─────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-100'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Brain size={18} className="text-white" />
                            </div>
                            <h3 className={`text-sm font-black ${TXT}`}>Your Habit Style</h3>
                        </div>
                        <p className={`text-base font-black mb-1 ${TXT}`}>Morning Enthusiast</p>
                        <p className={`text-xs leading-relaxed ${MUTED}`}>
                            {username.split(' ')[0]}, you're 84% more likely to complete habits before 10 AM. Your focus peaks early, and you thrive on structure.
                        </p>
                    </motion.div>

                    {/* ── Year of Growth heatmap ───────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`border rounded-2xl p-5 mb-4 ${CARD}`}>
                        <h3 className={`text-base font-black mb-4 ${TXT}`}>Year of Growth</h3>
                        <div className="overflow-x-auto">
                            <div className="min-w-[280px]">
                                {HEATMAP.map((row, ri) => (
                                    <div key={ri} className="flex gap-1.5 mb-1.5">
                                        {row.map((v, ci) => (
                                            <motion.div key={ci}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.008 * (ri * 16 + ci), type: 'spring', stiffness: 300 }}
                                                className={`flex-1 aspect-square rounded-sm ${heatColor(v)}`} />
                                        ))}
                                    </div>
                                ))}
                                {/* Month labels */}
                                <div className="flex mt-2">
                                    {MONTHS.map(m => (
                                        <div key={m} className={`flex-1 text-[9px] font-black tracking-wider ${MUTED}`}>{m}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Action Rows (Edit Profile, Friends, Sync Data) ────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-3">
                        <motion.button 
                            onClick={() => {
                                setEditUsername(username);
                                setEditEmail(userEmail || '');
                                setEditError('');
                                setIsEditProfileOpen(true);
                            }}
                            whileHover={{ scale: 1.01 }} 
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all
                                ${isDarkMode
                                    ? 'bg-[#1c1c1c] border border-white/5 text-white hover:border-white/10'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                            <div className="flex items-center gap-3">
                                <Pencil size={16} className="text-green-400" />
                                Edit Profile
                            </div>
                            <span className={MUTED}>›</span>
                        </motion.button>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl border font-black text-sm transition-all ${HCARD} ${HOV}`}>
                                <Users size={16} className="text-green-400" />
                                <span className={TXT}>Friends</span>
                            </motion.button>
                            
                            <motion.button
                                onClick={handleSyncData}
                                disabled={syncStatus === 'syncing'}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl border font-black text-sm transition-all ${HCARD} ${HOV} disabled:opacity-50`}>
                                <RefreshCw size={16} className={`text-green-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                                <span className={TXT}>
                                    {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Data'}
                                </span>
                            </motion.button>
                        </div>
                        
                        {/* Inline status messages for sync */}
                        {syncMessage && (
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-xs text-center font-semibold mt-1 py-2 px-4 rounded-xl border ${
                                    syncStatus === 'success' 
                                        ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                                        : syncStatus === 'error'
                                        ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                        : 'text-gray-400 bg-white/5 border-white/5'
                                }`}
                            >
                                {syncMessage}
                            </motion.p>
                        )}
                    </motion.div>

                </div>
            </div>

            {/* ═══ EDIT PROFILE MODAL ══════════════════════════════════════════════ */}
            <AnimatePresence>
                {isEditProfileOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditProfileOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl ${CARD} overflow-hidden`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className={`text-lg font-black ${TXT}`}>Edit Profile</h3>
                                <button 
                                    onClick={() => setIsEditProfileOpen(false)}
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${HCARD} ${HOV} transition-colors`}
                                >
                                    <X size={15} className={MUTED} />
                                </button>
                            </div>

                            <form onSubmit={handleEditProfileSubmit} className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-bold mb-2 tracking-wider ${MUTED}`}>USERNAME</label>
                                    <input 
                                        type="text" 
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${INPUT}`}
                                        placeholder="Username"
                                        disabled={editLoading}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold mb-2 tracking-wider ${MUTED}`}>EMAIL ADDRESS</label>
                                    <input 
                                        type="email" 
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${INPUT}`}
                                        placeholder="your@email.com"
                                        disabled={editLoading}
                                    />
                                </div>

                                {editError && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 text-center">
                                        {editError}
                                    </motion.p>
                                )}

                                <div className="pt-2 flex flex-col gap-2">
                                    <motion.button 
                                        type="submit"
                                        disabled={editLoading}
                                        whileHover={{ scale: 1.01 }} 
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-lg shadow-green-500/20 transition-colors disabled:opacity-75"
                                    >
                                        {editLoading ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditProfileOpen(false);
                                            setChangeError('');
                                            setChangeSuccess('');
                                            setChangeStep(1);
                                            setChangeCode('');
                                            setChangePassword('');
                                            setIsChangePasswordOpen(true);
                                        }}
                                        className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-black text-sm transition-all ${HCARD} ${HOV}`}
                                    >
                                        <KeyRound size={16} className="text-green-400" />
                                        <span className={TXT}>Change Password</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══ CHANGE PASSWORD MODAL ══════════════════════════════════════════ */}
            <AnimatePresence>
                {isChangePasswordOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsChangePasswordOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl ${CARD} overflow-hidden`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className={`text-lg font-black ${TXT}`}>Change Password</h3>
                                <button 
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${HCARD} ${HOV} transition-colors`}
                                >
                                    <X size={15} className={MUTED} />
                                </button>
                            </div>

                            <p className={`text-xs leading-relaxed mb-4 ${MUTED}`}>
                                For your security, we will send a 6-digit verification code to <span className={`font-bold ${TXT}`}>{userEmail}</span>.
                            </p>

                            {changeStep === 1 ? (
                                <div className="space-y-4">
                                    {changeError && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 text-center">
                                            {changeError}
                                        </motion.p>
                                    )}
                                    {changeSuccess && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-xs bg-green-500/10 py-2 px-3 rounded-lg border border-green-500/20 text-center">
                                            {changeSuccess}
                                        </motion.p>
                                    )}
                                    <motion.button 
                                        type="button"
                                        onClick={handleRequestChangeCode}
                                        disabled={changeLoading}
                                        whileHover={{ scale: 1.01 }} 
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-lg shadow-green-500/20 transition-colors disabled:opacity-75"
                                    >
                                        {changeLoading ? 'Requesting...' : 'Request Verification Code'}
                                    </motion.button>
                                </div>
                            ) : (
                                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 tracking-wider ${MUTED}`}>6-DIGIT CODE</label>
                                        <input 
                                            type="text" 
                                            value={changeCode}
                                            onChange={(e) => setChangeCode(e.target.value)}
                                            maxLength={6}
                                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${INPUT}`}
                                            placeholder="123456"
                                            disabled={changeLoading}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 tracking-wider ${MUTED}`}>NEW PASSWORD</label>
                                        <input 
                                            type="password" 
                                            value={changePassword}
                                            onChange={(e) => setChangePassword(e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${INPUT}`}
                                            placeholder="Enter new password"
                                            disabled={changeLoading}
                                        />
                                    </div>

                                    {changeError && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 text-center">
                                            {changeError}
                                        </motion.p>
                                    )}
                                    {changeSuccess && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-xs bg-green-500/10 py-2 px-3 rounded-lg border border-green-500/20 text-center">
                                            {changeSuccess}
                                        </motion.p>
                                    )}

                                    <motion.button 
                                        type="submit"
                                        disabled={changeLoading}
                                        whileHover={{ scale: 1.01 }} 
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-lg shadow-green-500/20 transition-colors disabled:opacity-75"
                                    >
                                        {changeLoading ? 'Changing Password...' : 'Change Password'}
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══ MOBILE NAV ═════════════════════════════════════════════════════ */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
                <div className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl border
                    ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-800'}`}>
                    {[
                        { id: 'home', icon: Home },
                        { id: 'habits', icon: CheckCircle },
                        { id: 'stats', icon: BarChart2 },
                        { id: 'profile', icon: User },
                    ].map(({ id, icon: Icon }) => {
                        const active = id === 'profile';
                        return (
                            <button key={id}
                                onClick={() => setActiveSection?.(id)}
                                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
                                    ${active ? 'bg-green-500 shadow-lg shadow-green-500/40' : 'text-gray-500 hover:bg-white/10'}`}>
                                <Icon size={19} className={active ? 'text-white' : ''} />
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
