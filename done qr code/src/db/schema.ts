export interface User {
  id: string; // Unique string ID
  username: string; // Unique username
  passwordHash: string; // Securely hashed password
  role: 'admin' | 'merchant';
  businessName: string; // Business name, e.g. "Company Name Ltd"
  logoUrl?: string; // Optional custom business logo URL or emoji/icon class
  createdAt: string;
  accountType?: 'temporary' | 'permanent';
  accountStatus?: 'active' | 'paused';
  expiryDate?: string;
  lastNotified?: string;
}

export interface BankingDetail {
  id: string;
  userId: string; // Foreign key referencing User.id
  bankName: string; // e.g., "Commercial Bank of Ethiopia", "Telebirr", "Dashen Bank"
  accountNumber: string; // Account Number or Phone Number
  payLink: string; // Payment Link / Deep Link (e.g., telebirr://, etc.) or description
  isActive: boolean; // Active state
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null; // User who performed the action, or null if system/public
  username: string | null; // Username of user or null
  action: string; // e.g., "login", "user_create", "bank_create", "password_change"
  details: string; // Human-readable details
  createdAt: string;
}

export interface DatabaseState {
  users: User[];
  bankingDetails: BankingDetail[];
  auditLogs: AuditLog[];
}
