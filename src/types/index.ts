export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'Kas' | 'Bank' | 'E-Wallet' | 'Lainnya';
export type MemberStatus = 'Aktif' | 'Nonaktif';

export interface CategoryData {
  income: string[];
  expense: string[];
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  status: MemberStatus;
  monthlyDues: number;
}

export interface AppEvent {
  id: string;
  name: string;
  date: string;
  location: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  accountId: string;
  category: string;
  desc: string;
  amount: number;
  createdBy: string;
  toAccountId?: string;
  memberId?: string;
  eventId?: string;
  createdAt?: string;
}

export interface TransactionHistory {
  id: string;
  transactionId: string;
  editedBy: string;
  editedAt: string;
  oldSnapshot: {
    date: string;
    type: TransactionType;
    accountId: string;
    category: string;
    desc: string;
    amount: number;
    toAccountId?: string;
    memberId?: string;
    eventId?: string;
  };
}

export interface ActivityLog {
  id: string;
  time: string;
  email: string;
  entity: 'Transaksi' | 'Akun' | 'Anggota' | 'Kategori' | 'Event' | 'Pengguna' | 'Peran' | 'Database';
  action: 'Tambah' | 'Ubah' | 'Hapus' | 'Login' | 'Ganti PIN';
  desc: string;
}

export interface UserRolePermission {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean; // Developer, Bendahara Utama, Admin
  permissions: {
    canViewDashboard: boolean;
    canManageSetup: boolean;
    canManageAccounts: boolean;
    canManageMembers: boolean;
    canCreateTransaction: boolean;
    canEditTransaction: boolean;
    canDeleteTransaction: boolean;
    canViewTxHistory: boolean;
    canManageDues: boolean;
    canManageEvents: boolean;
    canViewReports: boolean; // Rekap, Rincian, Surplus, Neraca, Arus Kas
    canExportReports: boolean; // PDF, CSV
    canManageUsers: boolean;
    canManageRoles: boolean;
    canViewActivityLogs: boolean;
    canAccessGasCenter: boolean;
  };
}

export interface UserAccount {
  email: string;
  name: string;
  roleId: string; // references UserRolePermission.id
  pin: string; // standard 6-digit PIN or custom
  isDefaultPin: boolean;
  createdAt: string;
  avatarUrl?: string;
}

export interface AppState {
  categories: CategoryData;
  accounts: Account[];
  members: Member[];
  events: AppEvent[];
  transactions: Transaction[];
  users: UserAccount[];
  roles: UserRolePermission[];
  activityLogs: ActivityLog[];
  txHistories: TransactionHistory[];
  lastSyncAt: string | null;
  spreadsheetId: string;
}

export type ViewTab =
  | 'beranda'
  | 'setup'
  | 'akun'
  | 'anggota'
  | 'transaksi'
  | 'iuran'
  | 'event'
  | 'rekap'
  | 'rincian'
  | 'surplus'
  | 'neraca'
  | 'aruskas'
  | 'pengguna'
  | 'riwayat';
