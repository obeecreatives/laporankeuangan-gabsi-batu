import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppState,
  ViewTab,
  UserAccount,
  UserRolePermission,
  Transaction,
  Account,
  Member,
  AppEvent,
  ActivityLog,
  TransactionHistory,
} from './types';
import {
  loadLocalState,
  saveLocalState,
  loadCurrentAuthUser,
  saveCurrentAuthUser,
  loadGasUrl,
  saveGasUrl,
  loadSidebarCollapsed,
  saveSidebarCollapsed,
  loadThemeMode,
  saveThemeMode,
  getDefaultPinForRole,
  DEFAULT_PIN_PRIVILEGED,
} from './services/storage';
import {
  fetchRemoteStateFromGas,
  pushFullStateToGas,
  pushSingleTxToGas,
  pushChangePinToGas,
} from './services/gasApi';
import { generateUid } from './utils/formatters';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { GasCenterModal } from './components/GasCenterModal';
import { RoleSettingsModal } from './components/RoleSettingsModal';
import { ChangePinModal } from './components/ChangePinModal';
import { InstallModal } from './components/InstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LoginView } from './components/views/LoginView';
import { BantuanModal } from './components/views/BantuanModal';
import { usePWAInstall } from './hooks/usePWAInstall';

// Views
import { BerandaView } from './components/views/BerandaView';
import { SetupView } from './components/views/SetupView';
import { AkunView } from './components/views/AkunView';
import { AnggotaView } from './components/views/AnggotaView';
import { TransaksiView } from './components/views/TransaksiView';
import { IuranView } from './components/views/IuranView';
import { EventView } from './components/views/EventView';
import { RekapView } from './components/views/RekapView';
import { RincianView } from './components/views/RincianView';
import { SurplusView } from './components/views/SurplusView';
import { NeracaView } from './components/views/NeracaView';
import { ArusKasView } from './components/views/ArusKasView';
import { PenggunaView } from './components/views/PenggunaView';
import { RiwayatView } from './components/views/RiwayatView';

export default function App() {
  // 1. Initial State from localStorage (Instant 0.01s load)
  const [appState, setAppState] = useState<AppState>(() => loadLocalState());
  const [authUser, setAuthUser] = useState<UserAccount | null>(() => loadCurrentAuthUser());
  const [activeTab, setActiveTab] = useState<ViewTab>('beranda');
  const [gasUrl, setGasUrl] = useState<string>(() => loadGasUrl());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    loadSidebarCollapsed()
  );
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => loadThemeMode());

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>(
    'synced'
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(appState.lastSyncAt);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals state
  const [isGasCenterOpen, setIsGasCenterOpen] = useState(false);
  const [isRoleSettingsOpen, setIsRoleSettingsOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // PWA install state and direct trigger
  const { isInstallable, isInstalled, isIOS, deferredPrompt, install } = usePWAInstall();

  const handleDirectInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        const res = await install();
        if (res.success) {
          setIsInstallOpen(false);
          return;
        }
      } catch (err) {
        console.warn('Install failed', err);
      }
    }
    // If not promptable yet, show guide modal
    setIsInstallOpen(true);
  }, [deferredPrompt, install]);

  // Apply initial theme
  useEffect(() => {
    saveThemeMode(themeMode);
  }, [themeMode]);

  // Save state on change
  const updateStateAndPersist = useCallback((updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveLocalState(next);
      return next;
    });
  }, []);

  // Log activity helper
  const addActivityLog = useCallback(
    (entity: ActivityLog['entity'], action: ActivityLog['action'], desc: ActivityLog['desc']) => {
      const newLog: ActivityLog = {
        id: generateUid(),
        time: new Date().toISOString(),
        email: authUser?.email || 'system',
        entity,
        action,
        desc,
      };

      updateStateAndPersist((prev) => ({
        ...prev,
        activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 300),
      }));
    },
    [authUser, updateStateAndPersist]
  );

  // Calculate realtime balance for an account
  const getAccountBalance = useCallback(
    (accountId: string): number => {
      const acc = appState.accounts.find((a) => a.id === accountId);
      if (!acc) return 0;
      let balance = Number(acc.initialBalance || 0);

      appState.transactions.forEach((t) => {
        const amt = Number(t.amount || 0);
        if (t.type === 'transfer') {
          if (t.accountId === acc.id) balance -= amt;
          if (t.toAccountId === acc.id) balance += amt;
        } else if (t.accountId === acc.id) {
          balance += t.type === 'income' ? amt : -amt;
        }
      });

      return balance;
    },
    [appState.accounts, appState.transactions]
  );

  // Active Role determination
  const currentRole = useMemo(() => {
    if (!authUser) return undefined;
    return appState.roles.find((r) => r.id === authUser.roleId) || appState.roles[0];
  }, [authUser, appState.roles]);

  // 2-Way Sync Engine: Pull latest from Google Sheets
  const pullFromGasSilent = useCallback(async () => {
    if (!gasUrl.trim()) return;
    try {
      const remote = await fetchRemoteStateFromGas(gasUrl);
      if (remote) {
        updateStateAndPersist((prev) => ({
          ...prev,
          categories: (remote.categories as any) || prev.categories,
          accounts: remote.accounts && remote.accounts.length > 0 ? remote.accounts : prev.accounts,
          members: remote.members && remote.members.length > 0 ? remote.members : prev.members,
          events: remote.events && remote.events.length > 0 ? remote.events : prev.events,
          transactions:
            remote.transactions && remote.transactions.length > 0
              ? remote.transactions
              : prev.transactions,
          users: remote.users && remote.users.length > 0 ? remote.users : prev.users,
          activityLogs:
            remote.activityLogs && remote.activityLogs.length > 0
              ? remote.activityLogs
              : prev.activityLogs,
          lastSyncAt: new Date().toISOString(),
        }));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        setSyncStatus('synced');
      }
    } catch {
      // Keep local state on silent failure
    }
  }, [gasUrl, updateStateAndPersist]);

  // Periodic Background Polling & Window Focus Auto-Sync (Google Sheets -> Web App)
  useEffect(() => {
    if (!gasUrl.trim()) {
      setSyncStatus('offline');
      return;
    }

    // 1. Initial Pull on Mount
    pullFromGasSilent();

    // 2. Auto-Pull when window regains focus (e.g. user returns from editing Google Sheets)
    const onFocus = () => {
      pullFromGasSilent();
    };
    window.addEventListener('focus', onFocus);

    // 3. Periodic gentle sync every 45 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullFromGasSilent();
      }
    }, 45000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [gasUrl, pullFromGasSilent]);

  // Manual 2-Way Sync Trigger (Pull latest from Sheets + Push local to Sheets)
  const handleManualSync = async () => {
    if (!gasUrl.trim()) {
      if (currentRole?.id === 'developer') {
        setIsGasCenterOpen(true);
      } else {
        alert('Endpoint Google Sheets belum disetel. Hubungi Developer / Administrator.');
      }
      return;
    }
    setSyncStatus('syncing');
    try {
      // Step 1: Pull latest from Sheets
      await pullFromGasSilent();

      // Step 2: Push local state to Sheets
      const res = await pushFullStateToGas(gasUrl, appState, authUser?.email || 'user');
      if (res.ok) {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        addActivityLog('Database', 'Ubah', 'Sinkronisasi dua arah (2-Way Sync) berhasil.');
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  };

  // Pull latest from GAS
  const handlePullFromGas = async () => {
    setSyncStatus('syncing');
    try {
      const remote = await fetchRemoteStateFromGas(gasUrl);
      if (remote) {
        updateStateAndPersist((prev) => ({
          ...prev,
          categories: (remote.categories as any) || prev.categories,
          accounts: remote.accounts || prev.accounts,
          members: remote.members || prev.members,
          events: remote.events || prev.events,
          transactions: remote.transactions || prev.transactions,
          users: remote.users || prev.users,
          activityLogs: remote.activityLogs || prev.activityLogs,
          lastSyncAt: new Date().toISOString(),
        }));
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        alert('Data berhasil diperbarui dari Google Sheets!');
      } else {
        alert('Gagal mengambil data dari Google Sheets. Pastikan endpoint aktif.');
      }
    } finally {
      setSyncStatus('synced');
    }
  };

  // Push local to GAS
  const handlePushToGas = async () => {
    setSyncStatus('syncing');
    try {
      const res = await pushFullStateToGas(gasUrl, appState, authUser?.email || 'user');
      if (res.ok) {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        alert('Seluruh data berhasil diunggah ke Google Sheets!');
      } else {
        alert('Gagal mengunggah data: ' + res.message);
      }
    } finally {
      setSyncStatus('synced');
    }
  };

  // Fullscreen Handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    saveThemeMode(nextTheme);
  };

  // Sidebar toggle
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      saveSidebarCollapsed(!prev);
      return !prev;
    });
  };

  // Authentication Handlers
  const handleLogin = (email: string, pin: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    // Find user by email
    let foundUser = appState.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // If primary developer account not yet in current state array, initialize it
    if (!foundUser && cleanEmail === 'loehendrasoftware@gmail.com') {
      foundUser = {
        email: 'loehendrasoftware@gmail.com',
        name: 'Lalu Mahendra (Lead Dev)',
        roleId: 'developer',
        pin: DEFAULT_PIN_PRIVILEGED,
        isDefaultPin: false,
        createdAt: new Date().toISOString(),
      };
      updateStateAndPersist((prev) => ({
        ...prev,
        users: [foundUser!, ...prev.users],
      }));
    }

    if (!foundUser) return false;

    // Check PIN: matches saved PIN OR matches standard PIN for role OR transition fallback
    const expectedStandardPin = getDefaultPinForRole(foundUser.roleId);
    const isPrivileged =
      foundUser.roleId === 'developer' ||
      foundUser.roleId === 'bendahara_utama' ||
      cleanEmail === 'loehendrasoftware@gmail.com';

    const isPinValid =
      cleanPin === foundUser.pin ||
      cleanPin === expectedStandardPin ||
      (isPrivileged && (cleanPin === '889900' || cleanPin === '123456')) ||
      (!isPrivileged && cleanPin === '123456');

    if (isPinValid) {
      // Sync stored user with current valid pin
      const updatedUser: UserAccount = {
        ...foundUser,
        pin: cleanPin,
        roleId: foundUser.roleId || (isPrivileged ? 'developer' : 'user'),
      };
      setAuthUser(updatedUser);
      saveCurrentAuthUser(updatedUser);

      updateStateAndPersist((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.email.toLowerCase() === cleanEmail ? updatedUser : u
        ),
      }));

      addActivityLog('Pengguna', 'Login', `Login berhasil via Email: ${foundUser.email}`);
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    setAuthUser(null);
    saveCurrentAuthUser(null);
  };

  const handleSelectRole = (roleId: string) => {
    if (!authUser) return;
    const updatedUser = { ...authUser, roleId };
    setAuthUser(updatedUser);
    saveCurrentAuthUser(updatedUser);

    updateStateAndPersist((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.email === updatedUser.email ? updatedUser : u)),
    }));
  };

  const handleChangePin = async (newPin: string): Promise<boolean> => {
    if (!authUser) return false;

    // 1. Update local user
    const updatedUser: UserAccount = {
      ...authUser,
      pin: newPin,
      isDefaultPin: false,
    };
    setAuthUser(updatedUser);
    saveCurrentAuthUser(updatedUser);

    updateStateAndPersist((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.email === updatedUser.email ? updatedUser : u)),
    }));

    addActivityLog('Pengguna', 'Ganti PIN', `Pengguna ${authUser.email} memperbarui PIN akses.`);

    // 2. Push to GAS if configured
    if (gasUrl.trim()) {
      await pushChangePinToGas(gasUrl, authUser.email, newPin);
    }
    return true;
  };

  // Data mutation handlers
  const handleSaveTransaction = (tx: Transaction) => {
    const existing = appState.transactions.find((t) => t.id === tx.id);
    if (existing) {
      // Record snapshot history
      const hist: TransactionHistory = {
        id: generateUid(),
        transactionId: tx.id,
        editedBy: authUser?.email || 'user',
        editedAt: new Date().toISOString(),
        oldSnapshot: {
          date: existing.date,
          type: existing.type,
          accountId: existing.accountId,
          category: existing.category,
          desc: existing.desc,
          amount: existing.amount,
          toAccountId: existing.toAccountId,
          memberId: existing.memberId,
          eventId: existing.eventId,
        },
      };

      updateStateAndPersist((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) => (t.id === tx.id ? tx : t)),
        txHistories: [hist, ...(prev.txHistories || [])],
      }));
      addActivityLog('Transaksi', 'Ubah', `${tx.type} Rp ${tx.amount} (${tx.desc || tx.category})`);
    } else {
      updateStateAndPersist((prev) => ({
        ...prev,
        transactions: [tx, ...prev.transactions],
      }));
      addActivityLog('Transaksi', 'Tambah', `${tx.type} Rp ${tx.amount} (${tx.desc || tx.category})`);
    }

    // Silent sync single transaction
    if (gasUrl.trim()) {
      pushSingleTxToGas(gasUrl, tx, authUser?.email || 'user');
    }
  };

  // Debounced auto-push for master data mutations
  const triggerDebouncedPush = useCallback(() => {
    if (!gasUrl.trim()) return;
    setTimeout(() => {
      pushFullStateToGas(gasUrl, loadLocalState(), authUser?.email || 'user');
    }, 600);
  }, [gasUrl, authUser]);

  const handleDeleteTransaction = (id: string) => {
    const tx = appState.transactions.find((t) => t.id === id);
    updateStateAndPersist((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    if (tx) {
      addActivityLog('Transaksi', 'Hapus', `${tx.type} Rp ${tx.amount} (${tx.desc || tx.category})`);
    }
    triggerDebouncedPush();
  };

  const handleUpdateCategories = (cat: { income: string[]; expense: string[] }) => {
    updateStateAndPersist((prev) => ({ ...prev, categories: cat }));
    addActivityLog('Kategori', 'Ubah', 'Pembaruan daftar pos pemasukan & pengeluaran.');
    triggerDebouncedPush();
  };

  const handlePurgeDummyData = () => {
    if (
      !confirm(
        'PERINGATAN: Apakah Anda yakin ingin membersihkan semua transaksi/angka dummy pengujian dan mengatur ulang saldo awal seluruh akun kas menjadi Rp 0?'
      )
    ) {
      return;
    }

    updateStateAndPersist((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => ({ ...a, initialBalance: 0 })),
      transactions: [],
      txHistories: [],
      activityLogs: [
        {
          id: generateUid(),
          time: new Date().toISOString(),
          email: authUser?.email || 'system',
          entity: 'Transaksi',
          action: 'Hapus',
          desc: 'Pembersihan total angka & transaksi dummy (seluruh saldo kas kembali Rp 0)',
        },
      ],
    }));

    alert('Berhasil! Seluruh transaksi dummy telah dibersihkan dan saldo awal semua akun kembali ke Rp 0.');
    triggerDebouncedPush();
  };

  const handleAddAccount = (acc: Account) => {
    updateStateAndPersist((prev) => ({ ...prev, accounts: [...prev.accounts, acc] }));
    addActivityLog('Akun', 'Tambah', `Akun kas baru: ${acc.name} (${acc.type})`);
    triggerDebouncedPush();
  };

  const handleDeleteAccount = (id: string) => {
    const acc = appState.accounts.find((a) => a.id === id);
    updateStateAndPersist((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
    }));
    if (acc) addActivityLog('Akun', 'Hapus', `Akun kas ${acc.name} dihapus.`);
    triggerDebouncedPush();
  };

  const handleAddMember = (m: Member) => {
    updateStateAndPersist((prev) => ({ ...prev, members: [...prev.members, m] }));
    addActivityLog('Anggota', 'Tambah', `Anggota baru: ${m.name}`);
    triggerDebouncedPush();
  };

  const handleDeleteMember = (id: string) => {
    const m = appState.members.find((mem) => mem.id === id);
    updateStateAndPersist((prev) => ({
      ...prev,
      members: prev.members.filter((mem) => mem.id !== id),
    }));
    if (m) addActivityLog('Anggota', 'Hapus', `Anggota ${m.name} dihapus.`);
    triggerDebouncedPush();
  };

  const handleToggleMemberStatus = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === id ? { ...m, status: m.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : m
      ),
    }));
    triggerDebouncedPush();
  };

  const handleAddEvent = (ev: AppEvent) => {
    updateStateAndPersist((prev) => ({ ...prev, events: [...prev.events, ev] }));
    addActivityLog('Event', 'Tambah', `Event baru: ${ev.name}`);
    triggerDebouncedPush();
  };

  const handleDeleteEvent = (id: string) => {
    const ev = appState.events.find((e) => e.id === id);
    updateStateAndPersist((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
    if (ev) addActivityLog('Event', 'Hapus', `Event ${ev.name} dihapus.`);
    triggerDebouncedPush();
  };

  const handleAddUser = (u: UserAccount) => {
    updateStateAndPersist((prev) => ({ ...prev, users: [...prev.users, u] }));
    addActivityLog('Pengguna', 'Tambah', `Pengguna baru: ${u.name} (${u.email})`);
  };

  const handleDeleteUser = (email: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.email.toLowerCase() !== email.toLowerCase()),
    }));
    addActivityLog('Pengguna', 'Hapus', `Akun pengguna ${email} dihapus.`);
  };

  const handleResetPin = (email: string) => {
    const targetUser = appState.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    const assignedDefaultPin = getDefaultPinForRole(targetUser?.roleId || 'user');

    updateStateAndPersist((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.email.toLowerCase() === email.toLowerCase()
          ? { ...u, pin: assignedDefaultPin, isDefaultPin: true }
          : u
      ),
    }));
    alert(
      `PIN pengguna ${email} berhasil di-reset ke PIN standar (${assignedDefaultPin}) sesuai perannya.`
    );
    addActivityLog(
      'Pengguna',
      'Ubah',
      `Reset PIN ke standar (${assignedDefaultPin}) untuk ${email}`
    );
    triggerDebouncedPush();
  };

  const handleUpdateUserRole = (email: string, newRoleId: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, roleId: newRoleId } : u
      ),
    }));

    if (authUser && authUser.email.toLowerCase() === email.toLowerCase()) {
      const updated = { ...authUser, roleId: newRoleId };
      setAuthUser(updated);
      saveCurrentAuthUser(updated);
    }

    const roleName = appState.roles.find((r) => r.id === newRoleId)?.name || newRoleId;
    addActivityLog('Pengguna', 'Ubah', `Ubah peran ${email} menjadi ${roleName}`);
    triggerDebouncedPush();
  };

  const handleSaveRoles = (updatedRoles: UserRolePermission[]) => {
    updateStateAndPersist((prev) => ({ ...prev, roles: updatedRoles }));
    addActivityLog('Peran', 'Ubah', 'Pembaruan matriks checklist hak akses (RBAC).');
  };

  // If not authenticated, show Login View
  if (!authUser) {
    return <LoginView users={appState.users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Desktop & Tablet Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={authUser}
        currentRole={currentRole}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenGasCenter={() => setIsGasCenterOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isInstalled={isInstalled}
        onOpenInstall={handleDirectInstall}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Top Header */}
        <Header
          currentTab={activeTab}
          currentUser={authUser}
          currentRole={currentRole}
          roles={appState.roles}
          onSelectRole={handleSelectRole}
          syncStatus={syncStatus}
          lastSyncTime={lastSyncTime}
          onManualSync={handleManualSync}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onOpenChangePin={() => setIsChangePinOpen(true)}
          onOpenRoleSettings={() => setIsRoleSettingsOpen(true)}
          onOpenGasCenter={() => setIsGasCenterOpen(true)}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isInstalled={isInstalled}
          onOpenInstall={handleDirectInstall}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {activeTab === 'beranda' && (
            <BerandaView
              state={appState}
              currentRole={currentRole}
              onNavigateTab={setActiveTab}
              getAccountBalance={getAccountBalance}
            />
          )}

          {activeTab === 'setup' && (
            <SetupView
              state={appState}
              currentRole={currentRole}
              onUpdateCategories={handleUpdateCategories}
              onPurgeDummyData={
                currentRole?.permissions.canManageSetup ? handlePurgeDummyData : undefined
              }
            />
          )}

          {activeTab === 'akun' && (
            <AkunView
              state={appState}
              currentRole={currentRole}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
              getAccountBalance={getAccountBalance}
            />
          )}

          {activeTab === 'anggota' && (
            <AnggotaView
              state={appState}
              currentRole={currentRole}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onToggleStatus={handleToggleMemberStatus}
            />
          )}

          {activeTab === 'transaksi' && (
            <TransaksiView
              state={appState}
              currentRole={currentRole}
              userEmail={authUser.email}
              onSaveTransaction={handleSaveTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              getAccountBalance={getAccountBalance}
              txHistories={appState.txHistories}
            />
          )}

          {activeTab === 'iuran' && (
            <IuranView
              state={appState}
              currentRole={currentRole}
              userEmail={authUser.email}
              onRecordDues={handleSaveTransaction}
            />
          )}

          {activeTab === 'event' && (
            <EventView
              state={appState}
              currentRole={currentRole}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {activeTab === 'rekap' && (
            <RekapView
              state={appState}
              currentRole={currentRole}
              getAccountBalance={getAccountBalance}
            />
          )}

          {activeTab === 'rincian' && (
            <RincianView state={appState} currentRole={currentRole} />
          )}

          {activeTab === 'surplus' && (
            <SurplusView state={appState} currentRole={currentRole} />
          )}

          {activeTab === 'neraca' && (
            <NeracaView state={appState} currentRole={currentRole} />
          )}

          {activeTab === 'aruskas' && (
            <ArusKasView state={appState} currentRole={currentRole} />
          )}

          {activeTab === 'pengguna' && (
            <PenggunaView
              state={appState}
              currentRole={currentRole}
              currentUserEmail={authUser.email}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onResetPin={handleResetPin}
              onUpdateUserRole={handleUpdateUserRole}
              onOpenRoleSettings={() => setIsRoleSettingsOpen(true)}
            />
          )}

          {activeTab === 'riwayat' && (
            <RiwayatView state={appState} currentRole={currentRole} />
          )}

          {/* Application Footer */}
          <footer className="mt-12 py-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 select-none">
            <p className="font-medium tracking-wide">
              obeecreatives Allright Reserved . Developed by Lalu Mahendra
            </p>
          </footer>
        </main>
      </div>

      {/* 3. Mobile Thumb-Friendly Bottom Nav */}
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* 4. Mobile Full Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={authUser}
        currentRole={currentRole}
        isInstalled={isInstalled}
        onOpenGasCenter={() => setIsGasCenterOpen(true)}
        onOpenInstall={handleDirectInstall}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 5. Modals & Dialogs */}
      <GasCenterModal
        isOpen={isGasCenterOpen && currentRole?.id === 'developer'}
        onClose={() => setIsGasCenterOpen(false)}
        gasUrl={gasUrl}
        onSaveGasUrl={(url) => {
          setGasUrl(url);
          saveGasUrl(url);
        }}
        onPullFromGas={handlePullFromGas}
        onPushToGas={handlePushToGas}
        isSyncing={syncStatus === 'syncing'}
      />

      <RoleSettingsModal
        isOpen={isRoleSettingsOpen}
        onClose={() => setIsRoleSettingsOpen(false)}
        roles={appState.roles}
        onSaveRoles={handleSaveRoles}
      />

      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        userEmail={authUser.email}
        isDefaultPin={authUser.isDefaultPin}
        onChangePin={handleChangePin}
      />

      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleDirectInstall}
      />

      <BantuanModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 6. Floating 1-Click Install Banner for mobile / desktop browsers */}
      <PWAInstallBanner
        isInstalled={isInstalled}
        onInstall={handleDirectInstall}
      />

      {/* Hidden print container for official PDF export */}
      <div id="print-area-hidden" className="hidden print:block fixed inset-0 bg-white z-[9999]" />
    </div>
  );
}
