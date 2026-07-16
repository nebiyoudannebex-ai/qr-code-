import dotenv from 'dotenv';
dotenv.config(); // Loads env variables from your .env file into process.env[cite: 2]

import helmet from 'helmet';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { loginRateLimiter, adminRouteRateLimiter } from './src/utils/rateLimit';
import {
  initDb,
  getUsers,
  getUserById,
  getUserByUsername,
  createMerchantUser,
  updateUserProfile,
  updateUserPassword,
  getBankingDetailsByUserId,
  addBankingDetail,
  updateBankingDetail,
  deleteBankingDetail,
  deleteMerchantUser,
  upgradeToPermanent,
  acknowledgeMaintenance,
  getAuditLogs,
  addCustomAuditLog,
  verifyPassword,
  createSession,
  getSessionByToken,
  deleteSession
} from './src/db/supabaseDb';
// Fixed: Importing from the root level where supabaseClient is located
import { getSupabaseConfigError } from './supabaseClient';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Security configuration: Disable CSP completely during local development 
// so Vite's WebSockets, HMR (Hot Module Replacement), and inline scripts aren't blocked.
if (IS_PRODUCTION) {
  app.use(helmet());
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
}

// Required when running behind Render / other reverse proxies so secure cookies work.
app.set('trust proxy', 1);

app.use(express.json());

const SESSION_COOKIE_NAME = 'mbd_session_token';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DIST_PATH = path.join(process.cwd(), 'dist');

function buildSessionCookie(token: string, maxAgeSeconds: number): string {
  const sameSite = IS_PRODUCTION ? 'SameSite=None' : 'SameSite=Lax';
  const secure = IS_PRODUCTION ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; ${sameSite}${secure}`;
}

function buildClearSessionCookie(): string {
  const sameSite = IS_PRODUCTION ? 'SameSite=None' : 'SameSite=Lax';
  const secure = IS_PRODUCTION ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; ${sameSite}${secure}`;
}

// Helper to parse cookies manually without external packages
function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

// Authentication Middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  (async () => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];
    
    let user = null;
    if (token) {
      const session = await getSessionByToken(token);
      if (session) {
        user = await getUserById(session.userId);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    // Attach user to request
    (req as any).user = user;
    (req as any).sessionToken = token;
    next();
  })().catch(err => {
    console.error('Authentication middleware failed:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  });
}

// Admin-Only Middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Administrator privilege required.' });
  }
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// Authenticated current user status
app.get('/api/auth/me', async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];

    let user = null;
    if (token) {
      const session = await getSessionByToken(token);
      if (session) {
        user = await getUserById(session.userId);
      }
    }

    if (!user) {
      return res.json({ user: null });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        businessName: user.businessName,
        createdAt: user.createdAt,
        accountType: user.accountType || 'permanent',
        accountStatus: user.accountStatus || 'active',
        expiryDate: user.expiryDate,
        lastNotified: user.lastNotified
      }
    });
  } catch (error: any) {
    console.error('[GET /api/auth/me] Session check failed:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Login route
app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await getUserByUsername(username);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      await addCustomAuditLog(null, username, 'login_failed', 'Attempted login with incorrect credentials.');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    await createSession(token, user.id, expiresAt);

    res.setHeader('Set-Cookie', buildSessionCookie(token, SESSION_DURATION_MS / 1000));
    await addCustomAuditLog(user.id, user.username, 'login_success', `User successfully logged in. Role: ${user.role}`);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        businessName: user.businessName,
        createdAt: user.createdAt,
        accountType: user.accountType || 'permanent',
        accountStatus: user.accountStatus || 'active',
        expiryDate: user.expiryDate,
        lastNotified: user.lastNotified
      }
    });
  } catch (error: any) {
    console.error('[POST /api/auth/login] Login failed:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Logout route
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const token = (req as any).sessionToken;

  try {
    if (token) {
      await deleteSession(token);
    }
    res.setHeader('Set-Cookie', buildClearSessionCookie());
    await addCustomAuditLog(user.id, user.username, 'logout', 'User logged out.');
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/auth/logout] Logout failed:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Update password route
app.post('/api/auth/password', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required' });
  }

  try {
    const freshUser = await getUserById(user.id);
    if (!freshUser || !verifyPassword(oldPassword, freshUser.passwordHash)) {
      await addCustomAuditLog(user.id, user.username, 'password_change_failed', 'Failed password change: invalid current password.');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({ error: 'New password must be at least 5 characters long' });
    }

    await updateUserPassword(user.id, newPassword, user.username, oldPassword);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/auth/password] Password update failed:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Update profile route (Merchant updates their own username and business name)
app.post('/api/auth/profile', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  const { username, businessName } = req.body;

  if (!username || !businessName) {
    return res.status(400).json({ error: 'Username and Business Name are required' });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (businessName.trim().length < 2) {
    return res.status(400).json({ error: 'Business Name must be at least 2 characters' });
  }

  try {
    const updatedUser = await updateUserProfile(user.id, username.trim(), businessName.trim(), user.username);
    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        businessName: updatedUser.businessName
      }
    });
  } catch (err: any) {
    console.error('[POST /api/auth/profile] Profile update failed:', err);
    return res.status(err.message?.includes('already taken') ? 409 : 500).json({ error: err.message?.includes('already taken') ? err.message : 'An internal server error occurred. Please try again.' });
  }
});

// ==========================================
// MERCHANT BANKING DETAILS ROUTES
// ==========================================

// Get banking details for logged-in user
app.get('/api/merchant/banks', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  try {
    const details = await getBankingDetailsByUserId(user.id);
    return res.json(details);
  } catch (error: any) {
    console.error('[GET /api/merchant/banks] Failed to load banking details:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Add a banking detail
app.post('/api/merchant/banks', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  const { bankName, accountNumber, payLink, isActive } = req.body;

  if (!bankName || !accountNumber) {
    return res.status(400).json({ error: 'Bank Name and Account Number are required' });
  }

  try {
    const newDetail = await addBankingDetail(
      user.id,
      bankName.trim(),
      accountNumber.trim(),
      (payLink || '').trim(),
      isActive === true,
      user.username
    );
    return res.json(newDetail);
  } catch (err: any) {
    console.error('[POST /api/merchant/banks] Failed to add banking detail:', err);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Update a banking detail
app.put('/api/merchant/banks/:id', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { bankName, accountNumber, payLink, isActive } = req.body;

  if (!bankName || !accountNumber) {
    return res.status(400).json({ error: 'Bank Name and Account Number are required' });
  }

  try {
    const updated = await updateBankingDetail(
      id,
      user.id,
      bankName.trim(),
      accountNumber.trim(),
      (payLink || '').trim(),
      isActive === true,
      user.username
    );
    return res.json(updated);
  } catch (err: any) {
    console.error('[PUT /api/merchant/banks/:id] Failed to update banking detail:', err);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Delete a banking detail
app.delete('/api/merchant/banks/:id', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  try {
    await deleteBankingDetail(id, user.id, user.username);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/merchant/banks/:id] Failed to delete banking detail:', err);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// ==========================================
// SUPER ADMIN ROUTES
// ==========================================

// Get all users (Admin only)
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = (await getUsers()).map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      businessName: u.businessName,
      createdAt: u.createdAt,
      accountType: u.accountType || 'permanent',
      accountStatus: u.accountStatus || 'active',
      expiryDate: u.expiryDate,
      lastNotified: u.lastNotified
    }));
    return res.json(users);
  } catch (error: any) {
    console.error('[GET /api/admin/users] Failed to load users:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Create new merchant user (Admin only)
app.post('/api/admin/users', adminRouteRateLimiter, requireAuth, requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const { username, businessName, password, accountType } = req.body;

  if (!username || !businessName || !password) {
    return res.status(400).json({ error: 'Username, Business Name, and Password are required' });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (password.length < 5) {
    return res.status(400).json({ error: 'Password must be at least 5 characters long' });
  }

  try {
    const newUser = await createMerchantUser(
      username.trim(),
      businessName.trim(),
      password,
      admin.id,
      admin.username,
      accountType || 'permanent'
    );

    return res.json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      businessName: newUser.businessName,
      createdAt: newUser.createdAt,
      accountType: newUser.accountType || 'permanent',
      accountStatus: newUser.accountStatus || 'active',
      expiryDate: newUser.expiryDate
    });
  } catch (err: any) {
    console.error('[POST /api/admin/users] Failed to create merchant user:', err);
    return res.status(err.message?.includes('already taken') ? 409 : 500).json({ error: err.message?.includes('already taken') ? err.message : 'An internal server error occurred. Please try again.' });
  }
});

// Upgrade merchant user to permanent (Admin only)
app.post('/api/admin/users/:id/upgrade', requireAuth, requireAdmin, adminRouteRateLimiter, async (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    const updated = await upgradeToPermanent(id, admin.id, admin.username);
    return res.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('[POST /api/admin/users/:id/upgrade] Failed to upgrade user:', err);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Acknowledge monthly maintenance reminder (Merchant only)
app.post('/api/merchant/acknowledge-maintenance', requireAuth, adminRouteRateLimiter, async (req, res) => {
  const user = (req as any).user;
  
  if (user.role !== 'merchant') {
    return res.status(403).json({ error: 'Merchant privilege required.' });
  }

  try {
    const updated = await acknowledgeMaintenance(user.id);
    return res.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('[POST /api/merchant/acknowledge-maintenance] Failed:', err);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Delete merchant user (Admin only)
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, adminRouteRateLimiter, async (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    await deleteMerchantUser(id, admin.id, admin.username);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/admin/users/:id] Failed to delete merchant user:', err);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// Get all audit logs (Admin only)
app.get('/api/admin/logs', requireAuth, requireAdmin, adminRouteRateLimiter, async (req, res) => {
  try {
    const logs = await getAuditLogs();
    return res.json(logs);
  } catch (error: any) {
    console.error('[GET /api/admin/logs] Failed to load audit logs:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Get business info & active payment profiles for public customer gateway
app.get('/api/u/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const owner = await getUserById(ownerId);
    
    if (!owner || owner.role !== 'merchant') {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    const accountStatus = owner.accountStatus || 'active';
    if (accountStatus === 'paused') {
      return res.json({
        id: owner.id,
        businessName: owner.businessName,
        logoUrl: owner.logoUrl,
        createdAt: owner.createdAt,
        accountStatus: 'paused',
        banks: []
      });
    }

    const allBanks = await getBankingDetailsByUserId(owner.id);
    const activeBanks = allBanks.filter(b => b.isActive);

    return res.json({
      id: owner.id,
      businessName: owner.businessName,
      logoUrl: owner.logoUrl,
      createdAt: owner.createdAt,
      accountStatus: 'active',
      banks: activeBanks.map(b => ({
        id: b.id,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        payLink: b.payLink
      }))
    });
  } catch (error: any) {
    console.error('[GET /api/u/:ownerId] Failed to load public merchant data:', error);
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
  }
});

// ==========================================
// SERVER START & STATIC FILES / VITE SERVING
// ==========================================

async function startServer() {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(`${configError} Set Supabase environment variables before starting the server.`);
  }

  await initDb();

  if (!IS_PRODUCTION) {
    // Mount Vite development server middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/db.json'],
        },
        hmr: {
          // Explicitly ensure the WebSocket uses local protocol without CSP blocking
          protocol: 'ws',
          host: 'localhost',
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Development SPA Fallback for page requests
    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const fs = await import('fs');
        const path = await import('path');
        let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve production built assets
    app.use(express.static(DIST_PATH));
    app.get('*', (req, res) => {
      res.sendFile(path.join(DIST_PATH, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});