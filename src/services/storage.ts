import { AppState, UserRolePermission, UserAccount } from '../types';

export const SPREADSHEET_ID_DEFAULT =
  (import.meta.env?.VITE_SPREADSHEET_ID as string) ||
  '1tyYyUpBnbv7OtHuEbG7qf4pn0mCnjzDG-sSgZ99H8F4';
export const DEFAULT_GAS_URL =
  (import.meta.env?.VITE_GAS_URL as string) ||
  'https://script.google.com/macros/s/AKfycbyTvyHhydD5LII2U7L1T2ZEgY6MEMQfWiPzkk1ffuymBeBRhIoan_coYTocrK1Rq7HY/exec';
export const STORAGE_KEY_APP_STATE = 'gabsi_batu_finance_state_v2';
export const STORAGE_KEY_AUTH_USER = 'gabsi_batu_auth_user_v2';
export const STORAGE_KEY_GAS_URL = 'gabsi_batu_gas_endpoint_v2';
export const STORAGE_KEY_SIDEBAR_COLLAPSED = 'gabsi_batu_sidebar_collapsed_v2';
export const STORAGE_KEY_THEME = 'gabsi_batu_theme_mode_v2';

export const DEFAULT_ROLES: UserRolePermission[] = [
  {
    id: 'developer',
    name: 'Developer / Site Engineer',
    description: 'Akses teknis mutlak, konfigurasi Headless GAS Center, logs, dan database bypass.',
    isSystem: true,
    permissions: {
      canViewDashboard: true,
      canManageSetup: true,
      canManageAccounts: true,
      canManageMembers: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: true,
      canViewTxHistory: true,
      canManageDues: true,
      canManageEvents: true,
      canViewReports: true,
      canExportReports: true,
      canManageUsers: true,
      canManageRoles: true,
      canViewActivityLogs: true,
      canAccessGasCenter: true,
    },
  },
  {
    id: 'bendahara_utama',
    name: 'Bendahara Utama',
    description: 'Pemegang otoritas keuangan tertinggi, persetujuan transaksi, neraca, dan kelola peran.',
    isSystem: true,
    permissions: {
      canViewDashboard: true,
      canManageSetup: true,
      canManageAccounts: true,
      canManageMembers: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: true,
      canViewTxHistory: true,
      canManageDues: true,
      canManageEvents: true,
      canViewReports: true,
      canExportReports: true,
      canManageUsers: true,
      canManageRoles: true,
      canViewActivityLogs: true,
      canAccessGasCenter: true,
    },
  },
  {
    id: 'admin',
    name: 'Admin Keuangan',
    description: 'Pengelola operasional harian, input transaksi kas, mutasi, iuran dan event.',
    isSystem: true,
    permissions: {
      canViewDashboard: true,
      canManageSetup: true,
      canManageAccounts: true,
      canManageMembers: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: false,
      canViewTxHistory: true,
      canManageDues: true,
      canManageEvents: true,
      canViewReports: true,
      canExportReports: true,
      canManageUsers: false,
      canManageRoles: false,
      canViewActivityLogs: true,
      canAccessGasCenter: false,
    },
  },
  {
    id: 'user',
    name: 'Pengurus / Anggota',
    description: 'Pencatatan terbatas transaksi dan pemantauan pembayaran iuran.',
    isSystem: true,
    permissions: {
      canViewDashboard: true,
      canManageSetup: false,
      canManageAccounts: false,
      canManageMembers: false,
      canCreateTransaction: true,
      canEditTransaction: false,
      canDeleteTransaction: false,
      canViewTxHistory: false,
      canManageDues: true,
      canManageEvents: false,
      canViewReports: false,
      canExportReports: false,
      canManageUsers: false,
      canManageRoles: false,
      canViewActivityLogs: false,
      canAccessGasCenter: false,
    },
  },
];

export const DEFAULT_PIN_PRIVILEGED = '889900'; // Khusus Developer / Site Engineer & Bendahara Utama
export const DEFAULT_PIN_GENERAL = '123456';    // Khusus Admin & User / Pengurus Lain

export function getDefaultPinForRole(roleId: string): string {
  if (roleId === 'developer' || roleId === 'bendahara_utama') {
    return DEFAULT_PIN_PRIVILEGED;
  }
  return DEFAULT_PIN_GENERAL;
}

export const DEFAULT_USERS: UserAccount[] = [
  {
    email: 'loehendrasoftware@gmail.com',
    name: 'Lalu Mahendra (Lead Dev)',
    roleId: 'developer',
    pin: DEFAULT_PIN_PRIVILEGED,
    isDefaultPin: true,
    createdAt: '2026-10-16 00:00:00',
  },
  {
    email: 'bendahara@gabsibatu.org',
    name: 'Bendahara GABSI Batu',
    roleId: 'bendahara_utama',
    pin: DEFAULT_PIN_PRIVILEGED,
    isDefaultPin: true,
    createdAt: '2026-10-16 00:00:00',
  },
  {
    email: 'admin@gabsibatu.org',
    name: 'Admin Sekretariat',
    roleId: 'admin',
    pin: DEFAULT_PIN_GENERAL,
    isDefaultPin: true,
    createdAt: '2026-10-16 00:00:00',
  },
  {
    email: 'pengurus@gabsibatu.org',
    name: 'Seksi Turnamen & Latihan',
    roleId: 'user',
    pin: DEFAULT_PIN_GENERAL,
    isDefaultPin: true,
    createdAt: '2026-10-16 00:00:00',
  },
];

export function getInitialState(): AppState {
  return {
    spreadsheetId: SPREADSHEET_ID_DEFAULT,
    lastSyncAt: new Date().toISOString(),
    categories: {
      income: [
        'Iuran Anggota',
        'Iuran Turnamen/Event',
        'Sponsorship',
        'Donasi',
        'Bantuan Hibah KONI Batu',
        'Pemasukan Lain-lain',
      ],
      expense: [
        'Sewa Tempat & GOR',
        'Konsumsi Latihan & Rapat',
        'Peralatan Bridge (Kartu, Bidding Box)',
        'Hadiah & Uang Pembinaan',
        'Administrasi & Afiliasi GABSI Jatim',
        'Transport & Akomodasi Atlet',
        'Dokumentasi & Publikasi',
        'Pengeluaran Lain-lain',
      ],
    },
    accounts: [
      {
        id: 'acc_kas_tunai',
        name: 'Kas Tunai Bendahara',
        type: 'Kas',
        initialBalance: 2500000,
      },
      {
        id: 'acc_bank_jatim',
        name: 'Rekening Bank Jatim GABSI',
        type: 'Bank',
        initialBalance: 14750000,
      },
      {
        id: 'acc_ewallet_operasional',
        name: 'Kas Digital / QRIS',
        type: 'E-Wallet',
        initialBalance: 1200000,
      },
    ],
    members: [
      {
        id: 'mem_1',
        name: 'Dr. Agus Santoso, Sp.A',
        phone: '081234567890',
        status: 'Aktif',
        monthlyDues: 50000,
      },
      {
        id: 'mem_2',
        name: 'Ir. Hendra Kusuma',
        phone: '081298765432',
        status: 'Aktif',
        monthlyDues: 50000,
      },
      {
        id: 'mem_3',
        name: 'Siti Rahmawati, S.Pd',
        phone: '081333444555',
        status: 'Aktif',
        monthlyDues: 50000,
      },
      {
        id: 'mem_4',
        name: 'Bambang Sudibyo (Atlet Junior)',
        phone: '085711223344',
        status: 'Aktif',
        monthlyDues: 25000,
      },
      {
        id: 'mem_5',
        name: 'Dewi Lestari (Nonaktif)',
        phone: '085877889900',
        status: 'Nonaktif',
        monthlyDues: 50000,
      },
    ],
    events: [
      {
        id: 'evt_walikota_2026',
        name: 'Piala Wali Kota Batu Bridge Championship 2026',
        date: '2026-11-20',
        location: 'Hall Kusuma Agrowisata Batu',
      },
      {
        id: 'evt_kejurprov_jatim',
        name: 'Puslatcab Pra-Porprov Jatim 2026',
        date: '2026-10-25',
        location: 'GOR Ganesha Kota Batu',
      },
    ],
    transactions: [
      {
        id: 'tx_01',
        date: '2026-10-02',
        type: 'income',
        accountId: 'acc_bank_jatim',
        category: 'Bantuan Hibah KONI Batu',
        desc: 'Pencairan Dana Pembinaan Cabang Olahraga Tahap II',
        amount: 10000000,
        createdBy: 'bendahara@gabsibatu.org',
        createdAt: '2026-10-02 09:30:00',
      },
      {
        id: 'tx_02',
        date: '2026-10-05',
        type: 'income',
        accountId: 'acc_kas_tunai',
        category: 'Iuran Anggota',
        desc: 'Iuran Oktober 2026 - Dr. Agus Santoso, Sp.A',
        amount: 50000,
        createdBy: 'bendahara@gabsibatu.org',
        memberId: 'mem_1',
        createdAt: '2026-10-05 14:15:00',
      },
      {
        id: 'tx_03',
        date: '2026-10-06',
        type: 'income',
        accountId: 'acc_kas_tunai',
        category: 'Iuran Anggota',
        desc: 'Iuran Oktober 2026 - Ir. Hendra Kusuma',
        amount: 50000,
        createdBy: 'bendahara@gabsibatu.org',
        memberId: 'mem_2',
        createdAt: '2026-10-06 10:00:00',
      },
      {
        id: 'tx_04',
        date: '2026-10-08',
        type: 'expense',
        accountId: 'acc_kas_tunai',
        category: 'Peralatan Bridge (Kartu, Bidding Box)',
        desc: 'Pembelian 10 Deck Kartu Bridge Plastik & 4 Bidding Box',
        amount: 1450000,
        createdBy: 'pengurus@gabsibatu.org',
        createdAt: '2026-10-08 16:40:00',
      },
      {
        id: 'tx_05',
        date: '2026-10-10',
        type: 'transfer',
        accountId: 'acc_bank_jatim',
        toAccountId: 'acc_kas_tunai',
        category: '',
        desc: 'Penarikan Kas Tunai dari Bank Jatim untuk Operasional Latihan',
        amount: 2000000,
        createdBy: 'bendahara@gabsibatu.org',
        createdAt: '2026-10-10 11:15:00',
      },
      {
        id: 'tx_06',
        date: '2026-10-12',
        type: 'expense',
        accountId: 'acc_kas_tunai',
        category: 'Sewa Tempat & GOR',
        desc: 'Sewa Ruang Latihan Rutin Minggu 1 & 2 Oktober',
        amount: 600000,
        createdBy: 'admin@gabsibatu.org',
        eventId: 'evt_kejurprov_jatim',
        createdAt: '2026-10-12 18:20:00',
      },
      {
        id: 'tx_07',
        date: '2026-10-14',
        type: 'income',
        accountId: 'acc_bank_jatim',
        category: 'Sponsorship',
        desc: 'Sponsorship Banner Turnamen Piala Wali Kota - Bank Jatim',
        amount: 3500000,
        createdBy: 'bendahara@gabsibatu.org',
        eventId: 'evt_walikota_2026',
        createdAt: '2026-10-14 13:00:00',
      },
    ],
    users: DEFAULT_USERS,
    roles: DEFAULT_ROLES,
    activityLogs: [
      {
        id: 'act_init_1',
        time: '2026-10-16 00:00:00',
        email: 'loehendrasoftware@gmail.com',
        entity: 'Pengguna',
        action: 'Tambah',
        desc: 'Inisialisasi sistem RBAC & migrasi database Google Sheets',
      },
      {
        id: 'act_init_2',
        time: '2026-10-16 00:01:00',
        email: 'bendahara@gabsibatu.org',
        entity: 'Akun',
        action: 'Tambah',
        desc: 'Sinkronisasi 3 akun kas/bank organisasi',
      },
    ],
    txHistories: [],
  };
}

export function loadLocalState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APP_STATE);
    if (!raw) {
      const initial = getInitialState();
      saveLocalState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure critical arrays and defaults exist
    if (!parsed.roles || parsed.roles.length === 0) parsed.roles = DEFAULT_ROLES;
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = DEFAULT_USERS;
    } else {
      // Ensure privileged accounts have 889900 if previously on 123456
      parsed.users = parsed.users.map((u: UserAccount) => {
        const isPrivileged =
          u.roleId === 'developer' ||
          u.roleId === 'bendahara_utama' ||
          u.email.toLowerCase() === 'loehendrasoftware@gmail.com';

        if (isPrivileged && (u.pin === '123456' || u.isDefaultPin)) {
          return {
            ...u,
            pin: DEFAULT_PIN_PRIVILEGED,
            roleId: u.roleId || 'developer',
            isDefaultPin: false,
          };
        }
        if (u.isDefaultPin) {
          return { ...u, pin: getDefaultPinForRole(u.roleId) };
        }
        return u;
      });

      // Ensure primary developer account is always present
      if (
        !parsed.users.some(
          (u: UserAccount) =>
            u.email.toLowerCase() === 'loehendrasoftware@gmail.com'
        )
      ) {
        parsed.users.unshift(DEFAULT_USERS[0]);
      }
    }
    if (!parsed.categories) parsed.categories = getInitialState().categories;
    if (!parsed.accounts) parsed.accounts = getInitialState().accounts;
    if (!parsed.members) parsed.members = getInitialState().members;
    if (!parsed.events) parsed.events = getInitialState().events;
    if (!parsed.transactions) parsed.transactions = getInitialState().transactions;
    if (!parsed.activityLogs) parsed.activityLogs = [];
    if (!parsed.txHistories) parsed.txHistories = [];
    if (!parsed.spreadsheetId) parsed.spreadsheetId = SPREADSHEET_ID_DEFAULT;
    return parsed;
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return getInitialState();
  }
}

export function saveLocalState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY_APP_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function loadCurrentAuthUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentAuthUser(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } else {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving current user:', e);
  }
}

export function loadGasUrl(): string {
  return localStorage.getItem(STORAGE_KEY_GAS_URL) || DEFAULT_GAS_URL;
}

export function saveGasUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
}

export function loadSidebarCollapsed(): boolean {
  return localStorage.getItem(STORAGE_KEY_SIDEBAR_COLLAPSED) === 'true';
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(STORAGE_KEY_SIDEBAR_COLLAPSED, collapsed ? 'true' : 'false');
}

export function loadThemeMode(): 'light' | 'dark' {
  const t = localStorage.getItem(STORAGE_KEY_THEME);
  return t === 'dark' ? 'dark' : 'light';
}

export function saveThemeMode(theme: 'light' | 'dark'): void {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
