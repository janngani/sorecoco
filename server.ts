import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined in environment variables. Falling back to insecure default for development.');
}
const SECRET = JWT_SECRET || 'soreco-portal-fallback-secret-2026';
const PORT = process.env.PORT || 10000;

// Initialize Database
const db = new Database('database.sqlite');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT,
    email TEXT UNIQUE,
    password TEXT,
    accountNumber TEXT,
    role TEXT,
    phoneNumber TEXT,
    address TEXT,
    profileImage TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    consumerId TEXT,
    consumerName TEXT,
    accountNumber TEXT,
    type TEXT,
    category TEXT,
    description TEXT,
    status TEXT,
    isUrgent INTEGER DEFAULT 0,
    evidenceImage TEXT,
    checklist TEXT,
    messages TEXT,
    feedback TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: Add isUrgent to tickets if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(tickets)").all() as any[];
  const hasIsUrgent = tableInfo.some(column => column.name === 'isUrgent');
  if (!hasIsUrgent) {
    db.exec("ALTER TABLE tickets ADD COLUMN isUrgent INTEGER DEFAULT 0");
    console.log("Migration: Added isUrgent column to tickets table");
  }
} catch (e) {
  console.error("Migration error:", e);
}

// Seed Admin User if not exists
const seedAdmin = async () => {
  const usersToSeed = [
    {
      id: 'admin-001',
      fullName: 'System Administrator',
      email: 'admin@gov.ph'.toLowerCase(),
      password: 'admin123',
      role: 'admin',
      accountNumber: 'ADMIN-001'
    },
    {
      id: 'admin-002',
      fullName: 'Janry Maligaso',
      email: 'janry.maligaso@sorsu.edu.ph'.toLowerCase(),
      password: 'admin123',
      role: 'admin',
      accountNumber: 'ADMIN-002'
    },
    {
      id: 'consumer-demo-001',
      fullName: 'Demo Consumer',
      email: 'consumer@gov.ph'.toLowerCase(),
      password: 'consumer123',
      role: 'consumer',
      accountNumber: '00-1234-5678'
    }
  ];

  for (const user of usersToSeed) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      // We use INSERT OR REPLACE to ensure the demo users have the correct credentials even if the DB already exists
      const stmt = db.prepare('INSERT OR REPLACE INTO users (id, fullName, email, password, role, accountNumber) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(user.id, user.fullName, user.email, hashedPassword, user.role, user.accountNumber);
      console.log(`Seeded/Updated demo user: ${user.email}`);
    } catch (err: any) {
      console.error(`Error seeding user ${user.email}:`, err.message);
    }
  }

  const existingAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get() as any;
  if (existingAnnouncements.count === 0) {
    const announcements = [
      { id: 'ann-1', title: 'Scheduled Maintenance: Bulan Proper', content: 'Power interruption in Bulan Proper on May 20, 2026, from 8:00 AM to 5:00 PM for line upgrading and maintenance. Please plan accordingly.' },
      { id: 'ann-2', title: 'New Payment Channels', content: 'We now accept payments via GCash, PayMaya, and 7-Eleven. Simply use your account number to pay your monthly bills conveniently.' },
      { id: 'ann-3', title: 'Billing Cycle Update', content: 'May 2026 billing statements are now being distributed. You can also view your current balance through our new Digital Consumer Portal.' }
    ];
    const stmt = db.prepare('INSERT INTO announcements (id, title, content) VALUES (?, ?, ?)');
    for (const ann of announcements) {
      stmt.run(ann.id, ann.title, ann.content);
    }
    console.log('Default announcements seeded');
  }
};

async function startServer() {
  // Seed Admin User
  await seedAdmin();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/register', async (req, res) => {
    const { fullName, password, accountNumber, role } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    console.log(`Registration attempt for: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substring(2, 15);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const stmt = db.prepare('INSERT INTO users (id, fullName, email, password, accountNumber, role) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(id, fullName, email, hashedPassword, accountNumber, role || 'consumer');
      console.log(`User registered successfully: ${email}`);
      
      const token = jwt.sign({ id, email, role: role || 'consumer' }, SECRET);
      res.json({ token, user: { id, fullName, email, accountNumber, role: role || 'consumer' } });
    } catch (e: any) {
      console.error(`Registration error for ${email}:`, e.message);
      res.status(400).json({ error: 'Email already exists or registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    console.log(`Login attempt for: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(email) as any;

    if (user) {
      console.log(`User found in DB: ${user.email} with role: ${user.role}`);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password comparison result: ${isMatch}`);
      
      if (isMatch) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET);
        const { password: _, ...userWithoutPassword } = user;
        console.log(`Login successful for: ${email}`);
        res.json({ token, user: userWithoutPassword });
      } else {
        console.log(`Password mismatch for: ${email}`);
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      console.log(`User not found in DB: ${email}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.patch('/api/auth/profile', authenticateToken, (req: any, res) => {
    const { fullName, phoneNumber, address, profileImage, accountNumber } = req.body;
    const stmt = db.prepare(`
      UPDATE users 
      SET fullName = ?, phoneNumber = ?, address = ?, profileImage = ?, accountNumber = ?
      WHERE id = ?
    `);
    stmt.run(fullName, phoneNumber, address, profileImage, accountNumber, req.user.id);
    res.json({ success: true });
  });

  // Tickets
  app.get('/api/tickets', authenticateToken, (req: any, res) => {
    let tickets;
    if (req.user.role === 'admin') {
      tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all();
    } else {
      tickets = db.prepare('SELECT * FROM tickets WHERE consumerId = ? ORDER BY createdAt DESC').all(req.user.id);
    }
    
    // Parse JSON fields
    const parsedTickets = tickets.map((t: any) => ({
      ...t,
      checklist: t.checklist ? JSON.parse(t.checklist) : null,
      messages: t.messages ? JSON.parse(t.messages) : [],
      feedback: t.feedback ? JSON.parse(t.feedback) : null
    }));
    
    res.json(parsedTickets);
  });

  app.post('/api/tickets', authenticateToken, (req: any, res) => {
    const { type, category, description, evidenceImage, checklist, consumerName, accountNumber, isUrgent } = req.body;
    const id = 'TICK-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    const stmt = db.prepare(`
      INSERT INTO tickets (id, consumerId, consumerName, accountNumber, type, category, description, status, isUrgent, evidenceImage, checklist, messages)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, 
      req.user.id, 
      consumerName, 
      accountNumber, 
      type, 
      category, 
      description, 
      'pending', 
      isUrgent ? 1 : 0,
      evidenceImage, 
      JSON.stringify(checklist || null),
      JSON.stringify([])
    );
    
    res.json({ id });
  });

  app.get('/api/tickets/:id', authenticateToken, (req: any, res) => {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id) as any;
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    res.json({
      ...ticket,
      checklist: ticket.checklist ? JSON.parse(ticket.checklist) : null,
      messages: ticket.messages ? JSON.parse(ticket.messages) : [],
      feedback: ticket.feedback ? JSON.parse(ticket.feedback) : null
    });
  });

  app.patch('/api/tickets/:id', authenticateToken, (req: any, res) => {
    const { status, messages, feedback, evidenceImage } = req.body;
    
    if (status) {
      db.prepare('UPDATE tickets SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    }
    if (messages) {
      db.prepare('UPDATE tickets SET messages = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(messages), req.params.id);
    }
    if (feedback) {
      db.prepare('UPDATE tickets SET feedback = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(feedback), req.params.id);
    }
    if (evidenceImage) {
      db.prepare('UPDATE tickets SET evidenceImage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(evidenceImage, req.params.id);
    }
    
    res.json({ success: true });
  });

  // Announcements
  app.get('/api/announcements', (req, res) => {
    const announcements = db.prepare('SELECT * FROM announcements ORDER BY createdAt DESC').all();
    res.json(announcements);
  });

  app.post('/api/announcements', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { title, content } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    db.prepare('INSERT INTO announcements (id, title, content) VALUES (?, ?, ?)').run(id, title, content);
    res.json({ id });
  });

  app.delete('/api/announcements/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Settings
  app.get('/api/settings/:key', (req, res) => {
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key) as any;
    res.json({ value: setting ? setting.value : null });
  });

  app.post('/api/settings/:key', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(req.params.key, value);
    res.json({ success: true });
  });

  // --- Vite / Static Files ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
