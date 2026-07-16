import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js'; // Added to initialize our admin client
import { supabase as publicSupabase, hasSupabaseConfig, getSupabaseConfigError } from '../../supabaseClient.js';
import { hashPassword, verifyPassword } from './password';
import { User, BankingDetail, AuditLog } from './schema';

export interface StoredSession {
  userId: string;
  expiresAt: number;
}

// Create a server-side privileged client using the Service Role Key if available (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const privilegedSupabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

function ensureSupabase() {
  if (privilegedSupabase) {
    return privilegedSupabase;
  }
  if (!publicSupabase || !hasSupabaseConfig()) {
    throw new Error(getSupabaseConfigError() || 'Supabase is not configured.');
  }
  return publicSupabase;
}

function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    passwordHash: (row.password_hash ?? row.passwordHash) as string,
    role: row.role as User['role'],
    businessName: (row.business_name ?? row.businessName) as string,
    logoUrl: (row.logo_url ?? row.logoUrl) as string | undefined,
    createdAt: (row.created_at ?? row.createdAt) as string,
    accountType: (row.account_type ?? row.accountType) as User['accountType'],
    accountStatus: (row.account_status ?? row.accountStatus) as User['accountStatus'],
    expiryDate: (row.expiry_date ?? row.expiryDate) as string | undefined,
    lastNotified: (row.last_notified ?? row.lastNotified) as string | undefined,
  };
}

function toSupabaseUser(user: Partial<User>) {
  return {
    id: user.id,
    username: user.username,
    password_hash: user.passwordHash,
    role: user.role,
    business_name: user.businessName,
    logo_url: user.logoUrl ?? null,
    created_at: user.createdAt,
    account_type: user.accountType ?? null,
    account_status: user.accountStatus ?? null,
    expiry_date: user.expiryDate ?? null,
    last_notified: user.lastNotified ?? null,
  };
}

function toBankingDetail(row: Record<string, unknown>): BankingDetail {
  return {
    id: row.id as string,
    userId: (row.user_id ?? row.userId) as string,
    bankName: (row.bank_name ?? row.bankName) as string,
    accountNumber: (row.account_number ?? row.accountNumber) as string,
    payLink: (row.pay_link ?? row.payLink ?? '') as string,
    isActive: Boolean(row.is_active ?? row.isActive),
    createdAt: (row.created_at ?? row.createdAt) as string,
  };
}

function toSupabaseBankingDetail(detail: Partial<BankingDetail>) {
  return {
    id: detail.id,
    user_id: detail.userId,
    bank_name: detail.bankName,
    account_number: detail.accountNumber,
    pay_link: detail.payLink ?? '',
    is_active: detail.isActive ?? true,
    created_at: detail.createdAt,
  };
}

function toAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    userId: (row.user_id ?? row.userId ?? null) as string | null,
    username: (row.username ?? null) as string | null,
    action: row.action as string,
    details: row.details as string,
    createdAt: (row.created_at ?? row.createdAt) as string,
  };
}

function toSupabaseAuditLog(log: Partial<AuditLog>) {
  return {
    id: log.id,
    user_id: log.userId ?? null,
    username: log.username ?? null,
    action: log.action,
    details: log.details,
    created_at: log.createdAt,
  };
}

async function insertRow(table: string, payload: Record<string, unknown>) {
  const client = ensureSupabase();
  const { data, error } = await client.from(table).insert(payload).select('*').single();
  if (error) {
    throw new Error(`Failed to insert into ${table}: ${error.message}`);
  }
  return data;
}

async function updateRow(table: string, payload: Record<string, unknown>, column: string, value: string) {
  const client = ensureSupabase();
  const { data, error } = await client.from(table).update(payload).eq(column, value).select('*').single();
  if (error) {
    throw new Error(`Failed to update ${table}: ${error.message}`);
  }
  return data;
}

async function deleteRow(table: string, column: string, value: string) {
  const client = ensureSupabase();
  const { error } = await client.from(table).delete().eq(column, value);
  if (error) {
    throw new Error(`Failed to delete from ${table}: ${error.message}`);
  }
}

async function seedSupabaseIfNeeded() {
  const client = ensureSupabase();
  const { data: existingUsers, error: userError } = await client.from('users').select('id').limit(1);
  if (userError) {
    throw new Error(`Failed to check users table: ${userError.message}`);
  }

  if ((existingUsers ?? []).length > 0) {
    return;
  }

  const adminUser: User = {
    id: 'admin-id',
    username: 'admin',
    passwordHash: hashPassword('admin'),
    role: 'admin',
    businessName: 'System Administration',
    createdAt: new Date().toISOString(),
  };

  const demoUser: User = {
    id: 'm-demo',
    username: 'demomerchant',
    passwordHash: hashPassword('merchant123'),
    role: 'merchant',
    businessName: 'Elegance Boutique Ltd',
    createdAt: new Date().toISOString(),
  };

  await insertRow('users', toSupabaseUser(adminUser));
  await insertRow('users', toSupabaseUser(demoUser));

  const demoBanks: BankingDetail[] = [
    {
      id: 'bank-demo-1',
      userId: 'm-demo',
      bankName: 'Commercial Bank of Ethiopia (CBE)',
      accountNumber: '1000349581948',
      payLink: 'https://www.combanketh.et',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bank-demo-2',
      userId: 'm-demo',
      bankName: 'Telebirr Mobile Wallet',
      accountNumber: '0911223344',
      payLink: 'telebirr://',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bank-demo-3',
      userId: 'm-demo',
      bankName: 'Dashen Bank A.S.',
      accountNumber: '5093847291039',
      payLink: '',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const bank of demoBanks) {
    await insertRow('banking_details', toSupabaseBankingDetail(bank));
  }

  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId: 'system',
    username: 'system',
    action: 'system_init',
    details: 'Supabase database initialized with default admin and demo merchant accounts.',
    createdAt: new Date().toISOString(),
  }));
}

export async function initDb() {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(`${configError} Persistent storage requires Supabase.`);
  }

  const client = ensureSupabase();
  const { error: sessionsError } = await client.from('sessions').select('token').limit(1);
  if (sessionsError) {
    throw new Error(
      `Supabase sessions table is missing or inaccessible: ${sessionsError.message}. Run supabase-schema.sql in your Supabase SQL editor.`
    );
  }

  await seedSupabaseIfNeeded();
}

export async function createSession(token: string, userId: string, expiresAt: number): Promise<void> {
  await insertRow('sessions', {
    token,
    user_id: userId,
    expires_at: new Date(expiresAt).toISOString(),
    created_at: new Date().toISOString(),
  });
}

export async function getSessionByToken(token: string): Promise<StoredSession | null> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read session: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const expiresAt = new Date(data.expires_at).getTime();
  if (expiresAt < Date.now()) {
    await deleteSession(token);
    return null;
  }

  return {
    userId: data.user_id,
    expiresAt,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await deleteRow('sessions', 'token', token);
}

export async function checkAndApplyExpirations() {
  const client = ensureSupabase();
  const now = new Date().toISOString();

  const { data: expiredMerchants, error } = await client
    .from('users')
    .select('*')
    .eq('role', 'merchant')
    .eq('account_type', 'temporary')
    .neq('account_status', 'paused')
    .lt('expiry_date', now);

  if (error) {
    throw new Error(`Failed to check account expirations: ${error.message}`);
  }

  for (const row of expiredMerchants ?? []) {
    const user = toUser(row);
    const updated = { ...user, accountStatus: 'paused' as const };
    await updateRow('users', toSupabaseUser(updated), 'id', user.id);
    await insertRow('audit_logs', toSupabaseAuditLog({
      id: crypto.randomUUID(),
      userId: 'system',
      username: 'System Automated Scheduler',
      action: 'account_paused',
      details: `Temporary merchant account "${user.businessName}" (Username: ${user.username}, ID: ${user.id}) has expired and has been automatically PAUSED.`,
      createdAt: now,
    }));
  }
}

export async function getUsers(): Promise<User[]> {
  await checkAndApplyExpirations();
  const client = ensureSupabase();
  const { data, error } = await client.from('users').select('*').order('created_at', { ascending: true });
  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }
  return (data ?? []).map(toUser);
}

export async function getUserById(id: string): Promise<User | undefined> {
  await checkAndApplyExpirations();
  const client = ensureSupabase();
  const { data, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw new Error(`Failed to load user: ${error.message}`);
  }
  return data ? toUser(data) : undefined;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  await checkAndApplyExpirations();
  const users = await getUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
}

export async function createMerchantUser(
  username: string,
  businessName: string,
  passwordPlain: string,
  actorId: string,
  actorName: string,
  accountType: 'temporary' | 'permanent' = 'permanent'
): Promise<User> {
  const existingUsers = await getUsers();
  if (existingUsers.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    throw new Error(`Username "${username}" is already taken.`);
  }

  const newId = 'm-' + crypto.randomBytes(6).toString('hex');
  let expiryDate: string | undefined;
  if (accountType === 'temporary') {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    expiryDate = expiry.toISOString();
  }

  const newUser: User = {
    id: newId,
    username,
    passwordHash: hashPassword(passwordPlain),
    role: 'merchant',
    businessName,
    createdAt: new Date().toISOString(),
    accountType,
    accountStatus: 'active',
    expiryDate,
  };

  const inserted = await insertRow('users', toSupabaseUser(newUser));
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId: actorId,
    username: actorName,
    action: 'merchant_create',
    details: `Created ${accountType} merchant account for business "${businessName}" (Username: ${username}, ID: ${newId}).${accountType === 'temporary' ? ` Expiry: ${new Date(expiryDate!).toLocaleDateString()}` : ''}`,
    createdAt: new Date().toISOString(),
  }));

  return toUser(inserted);
}

export async function upgradeToPermanent(userId: string, actorId: string, actorName: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const updated = { ...user, accountType: 'permanent' as const, accountStatus: 'active' as const, expiryDate: undefined };
  await updateRow('users', toSupabaseUser(updated), 'id', userId);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId: actorId,
    username: actorName,
    action: 'account_upgrade',
    details: `Upgraded merchant account "${user.businessName}" (ID: ${userId}) to PERMANENT status. Account reactivated.`,
    createdAt: new Date().toISOString(),
  }));

  return updated;
}

export async function acknowledgeMaintenance(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const updated = { ...user, lastNotified: new Date().toISOString() };
  await updateRow('users', toSupabaseUser(updated), 'id', userId);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId: user.id,
    username: user.username,
    action: 'maintenance_ack',
    details: `Merchant "${user.businessName}" acknowledged monthly website maintenance reminder.`,
    createdAt: new Date().toISOString(),
  }));

  return updated;
}

export async function updateUserProfile(userId: string, username: string, businessName: string, actorName: string): Promise<User> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const existing = await getUsers();
  if (
    user.username.toLowerCase() !== username.toLowerCase() &&
    existing.some((entry) => entry.username.toLowerCase() === username.toLowerCase() && entry.id !== userId)
  ) {
    throw new Error(`Username "${username}" is already taken.`);
  }

  const updated = { ...user, username, businessName };
  await updateRow('users', toSupabaseUser(updated), 'id', userId);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId,
    username: actorName,
    action: 'profile_update',
    details: `Updated profile details. Username: "${user.username}" -> "${username}", Business: "${user.businessName}" -> "${businessName}".`,
    createdAt: new Date().toISOString(),
  }));

  return updated;
}

export async function updateUserPassword(userId: string, newPasswordPlain: string, actorName: string, oldPasswordPlain?: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const updated = { ...user, passwordHash: hashPassword(newPasswordPlain) };
  await updateRow('users', toSupabaseUser(updated), 'id', userId);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId,
    username: actorName,
    action: 'password_change',
    details: oldPasswordPlain
      ? `Successfully changed password for user ${user.username}.\nBefore password: "${oldPasswordPlain}"\nNew password: "${newPasswordPlain}"`
      : `Successfully changed password for user ${user.username}.\nNew password: "${newPasswordPlain}"`,
    createdAt: new Date().toISOString(),
  }));
}

export async function deleteMerchantUser(targetUserId: string, actorId: string, actorName: string) {
  const user = await getUserById(targetUserId);
  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role === 'admin') {
    throw new Error('Super admins cannot be deleted.');
  }

  await deleteRow('banking_details', 'user_id', targetUserId);
  await deleteRow('sessions', 'user_id', targetUserId);
  await deleteRow('users', 'id', targetUserId);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId: actorId,
    username: actorName,
    action: 'merchant_delete',
    details: `Deleted merchant account "${user.businessName}" (Username: ${user.username}, ID: ${targetUserId}).`,
    createdAt: new Date().toISOString(),
  }));
}

export async function getBankingDetailsByUserId(userId: string): Promise<BankingDetail[]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('banking_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load banking details: ${error.message}`);
  }

  return (data ?? []).map(toBankingDetail);
}

export async function addBankingDetail(
  userId: string,
  bankName: string,
  accountNumber: string,
  payLink: string,
  isActive: boolean,
  actorName: string
): Promise<BankingDetail> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Merchant user not found.');
  }

  const detail: BankingDetail = {
    id: 'bank-' + crypto.randomUUID(),
    userId,
    bankName,
    accountNumber,
    payLink: payLink || '',
    isActive,
    createdAt: new Date().toISOString(),
  };

  const inserted = await insertRow('banking_details', toSupabaseBankingDetail(detail));
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId,
    username: actorName,
    action: 'bank_add',
    details: `Added banking detail: ${bankName} (${accountNumber}) for business ${user.businessName}.`,
    createdAt: new Date().toISOString(),
  }));

  return toBankingDetail(inserted);
}

export async function updateBankingDetail(
  id: string,
  userId: string,
  bankName: string,
  accountNumber: string,
  payLink: string,
  isActive: boolean,
  actorName: string
): Promise<BankingDetail> {
  const current = (await getBankingDetailsByUserId(userId)).find((detail) => detail.id === id);
  if (!current) {
    throw new Error('Banking detail not found or unauthorized.');
  }

  const updated = { ...current, bankName, accountNumber, payLink: payLink || '', isActive };
  await updateRow('banking_details', toSupabaseBankingDetail(updated), 'id', id);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId,
    username: actorName,
    action: 'bank_update',
    details: `Updated banking detail ID ${id}. Changed to ${bankName} (${accountNumber}), Active: ${isActive}.`,
    createdAt: new Date().toISOString(),
  }));

  return updated;
}

export async function deleteBankingDetail(id: string, userId: string, actorName: string) {
  const current = (await getBankingDetailsByUserId(userId)).find((detail) => detail.id === id);
  if (!current) {
    throw new Error('Banking detail not found or unauthorized.');
  }

  await deleteRow('banking_details', 'id', id);
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId,
    username: actorName,
    action: 'bank_delete',
    details: `Deleted banking detail: ${current.bankName} (${current.accountNumber}).`,
    createdAt: new Date().toISOString(),
  }));
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load audit logs: ${error.message}`);
  }

  return (data ?? []).map(toAuditLog);
}

export async function addCustomAuditLog(userId: string | null, username: string | null, action: string, details: string) {
  await insertRow('audit_logs', toSupabaseAuditLog({
    id: crypto.randomUUID(),
    userId,
    username,
    action,
    details,
    createdAt: new Date().toISOString(),
  }));
}

export { verifyPassword };