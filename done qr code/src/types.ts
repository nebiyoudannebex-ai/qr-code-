export interface User {
  id: string;
  username: string;
  role: 'admin' | 'merchant';
  businessName: string;
  createdAt: string;
  accountType?: 'temporary' | 'permanent';
  accountStatus?: 'active' | 'paused';
  expiryDate?: string;
  lastNotified?: string;
}

export interface BankingDetail {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  payLink: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  username: string | null;
  action: string;
  details: string;
  createdAt: string;
}

export interface PublicBusiness {
  id: string;
  businessName: string;
  logoUrl?: string;
  createdAt?: string;
  banks: {
    id: string;
    bankName: string;
    accountNumber: string;
    payLink: string;
  }[];
}
