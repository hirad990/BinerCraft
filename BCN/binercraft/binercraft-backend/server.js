const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const DB_PATH = path.join(__dirname, 'db.json')

const DEFAULT_DB = {
  users: [], products: [], blog: [], orders: [], cart: [], notifications: [], discounts: [], tickets: [], transactions: [],
  serverStats: { players: 0, stability: 99.9, sales: 0, support: 0, status: 'online' }
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '').split(',').map((value) => value.trim()).filter(Boolean)
]
const configuredBaleToken = process.env.BALE_WALLET_TOKEN && !process.env.BALE_WALLET_TOKEN.startsWith('YOUR_') ? process.env.BALE_WALLET_TOKEN : ''
const configuredBalePaymentUrl = process.env.BALE_PAYMENT_URL && !process.env.BALE_PAYMENT_URL.startsWith('YOUR_') ? process.env.BALE_PAYMENT_URL : ''
const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME || 'hirad990').trim().toLowerCase()
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '')
const AUTH_SECRET = String(process.env.AUTH_SECRET || '').trim()

if (!AUTH_SECRET) console.warn('⚠️ AUTH_SECRET is not configured. Set a strong random AUTH_SECRET before production.')
if (!ADMIN_PASSWORD) console.warn('⚠️ ADMIN_PASSWORD is not configured. Admin login is disabled until it is set.')

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/localhost(?::\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)) return callback(null, true)
    return callback(new Error('CORS origin is not allowed'))
  }
}))
app.use(express.json({ limit: '1mb' }))

function ensureDBShape(db) {
  const result = { ...DEFAULT_DB, ...(db && typeof db === 'object' ? db : {}) }
  for (const key of ['users', 'products', 'blog', 'orders', 'cart', 'notifications', 'discounts', 'tickets', 'transactions']) if (!Array.isArray(result[key])) result[key] = []
  if (!result.serverStats || typeof result.serverStats !== 'object') result.serverStats = { ...DEFAULT_DB.serverStats }
  return result
}

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) { const db = ensureDBShape(DEFAULT_DB); writeDB(db); return db }
    return ensureDBShape(JSON.parse(fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '')))
  } catch (error) {
    console.error('Error reading database:', error.message)
    return ensureDBShape(DEFAULT_DB)
  }
}

function writeDB(data) {
  try {
    const tempPath = `${DB_PATH}.tmp`
    fs.writeFileSync(tempPath, `${JSON.stringify(ensureDBShape(data), null, 2)}\n`, 'utf8')
    fs.renameSync(tempPath, DB_PATH)
    return true
  } catch (error) {
    console.error('Error writing database:', error.message)
    return false
  }
}

function generateId() { return `${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}` }
function hashPassword(password) { const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.scryptSync(password, salt, 64).toString('hex'); return `${salt}:${hash}` }
function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) return false
  const [salt, hash] = storedHash.split(':')
  try { const derived = crypto.scryptSync(password, salt, 64).toString('hex'); return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex')) } catch { return false }
}
function sanitizeUser(user) { if (!user) return null; const { password, passwordHash, ...safeUser } = user; return safeUser }
function getUserId(req) { return String(req.query.userId || req.body?.userId || 'guest') }
function getCart(db, userId) { return db.cart.filter((item) => String(item.userId || 'guest') === String(userId)).map((item) => ({ ...item, product: db.products.find((product) => String(product.id) === String(item.productId)) || null })) }
function sendUpdatedCart(res, db, userId) { return res.json(getCart(db, userId)) }
function saveOr500(res, db, payload) { if (!writeDB(db)) return res.status(500).json({ error: 'Could not save data' }); return res.json(payload) }

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', AUTH_SECRET || 'development-only-secret').update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

function verifyToken(token) {
  if (!token || !AUTH_SECRET) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url')
  if (parts[2].length !== expected.length || !crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}

function getBearerToken(req) {
  const header = String(req.headers.authorization || '')
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

function requireAuth(req, res, next) {
  const user = verifyToken(getBearerToken(req))
  if (!user) return res.status(401).json({ error: 'Authentication required' })
  req.auth = user
  return next()
}

function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
    return next()
  })
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'BinerCraft Backend', timestamp: new Date().toISOString() }))

app.post('/api/auth/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD || !AUTH_SECRET) return res.status(503).json({ error: 'Admin authentication is not configured' })
  const username = String(req.body.username || req.body.identifier || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid admin credentials' })
  const db = readDB()
  let admin = db.users.find((user) => user.role === 'admin' && String(user.username || '').toLowerCase() === ADMIN_USERNAME)
  if (!admin) {
    admin = { id: generateId(), username: ADMIN_USERNAME, email: `${ADMIN_USERNAME}@binercraft.ir`, displayName: 'مدیر BinerCraft', role: 'admin', wallet: 0, avatar: '' }
    db.users.push(admin)
    writeDB(db)
  }
  const token = signToken({ sub: String(admin.id), username: admin.username, role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 })
  return res.json({ token, user: sanitizeUser(admin) })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = readDB().users.find((candidate) => String(candidate.id) === String(req.auth.sub))
  if (!user) return res.status(401).json({ error: 'User not found' })
  return res.json({ user: sanitizeUser(user) })
})

app.post('/api/users/register', (req, res) => {
  const db = readDB(); const username = String(req.body.username || '').trim(); const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || ''); const displayName = String(req.body.displayName || username).trim()
  if (username.length < 3 || !/^[-_a-zA-Z0-9]+$/.test(username)) return res.status(400).json({ error: 'Invalid username' })
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters' })
  if (db.users.some((user) => user.username?.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: 'Username already exists' })
  if (db.users.some((user) => user.email?.toLowerCase() === email)) return res.status(409).json({ error: 'Email already exists' })
  const user = { id: generateId(), username, email, displayName: displayName || username, role: 'user', wallet: 0, avatar: '', passwordHash: hashPassword(password), createdAt: new Date().toISOString() }
  db.users.push(user); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save user' }); return res.status(201).json(sanitizeUser(user))
})

app.post('/api/users/login', (req, res) => {
  const db = readDB(); const identifier = String(req.body.identifier || req.body.username || req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '')
  const user = db.users.find((candidate) => candidate.username?.toLowerCase() === identifier || candidate.email?.toLowerCase() === identifier)
  if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid username/email or password' })
  const token = AUTH_SECRET ? signToken({ sub: String(user.id), username: user.username, role: user.role || 'user', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 }) : null
  return res.json({ user: sanitizeUser(user), ...(token ? { token } : {}) })
})

app.get('/api/users', requireAdmin, (req, res) => res.json(readDB().users.map(sanitizeUser)))
app.post('/api/users', requireAdmin, (req, res) => {
  const db = readDB(); const password = String(req.body.password || ''); const user = { id: generateId(), ...req.body, wallet: Number(req.body.wallet || 0), role: req.body.role === 'admin' ? 'admin' : 'user', ...(password ? { passwordHash: hashPassword(password) } : {}) }
  delete user.password; db.users.push(user); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save user' }); return res.status(201).json(sanitizeUser(user))
})
app.patch('/api/users/:id', requireAdmin, (req, res) => {
  const db = readDB(); const index = db.users.findIndex((user) => String(user.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'User not found' })
  const updates = { ...req.body }; if (updates.password) { updates.passwordHash = hashPassword(String(updates.password)); delete updates.password }
  if (updates.role && !['user', 'admin'].includes(updates.role)) return res.status(400).json({ error: 'Invalid role' })
  db.users[index] = { ...db.users[index], ...updates }; if (!writeDB(db)) return res.status(500).json({ error: 'Could not save user' }); return res.json(sanitizeUser(db.users[index]))
})

app.get('/api/products', (req, res) => res.json(readDB().products))
app.post('/api/products', requireAdmin, (req, res) => { const db = readDB(); const product = { id: generateId(), ...req.body, price: Number(req.body.price || 0) }; db.products.push(product); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save product' }); return res.status(201).json(product) })
app.patch('/api/products/:id', requireAdmin, (req, res) => { const db = readDB(); const index = db.products.findIndex((product) => String(product.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Product not found' }); db.products[index] = { ...db.products[index], ...req.body }; if (!writeDB(db)) return res.status(500).json({ error: 'Could not save product' }); return res.json(db.products[index]) })
app.delete('/api/products/:id', requireAdmin, (req, res) => { const db = readDB(); db.products = db.products.filter((product) => String(product.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/blog', (req, res) => res.json(readDB().blog))
app.post('/api/blog', requireAdmin, (req, res) => { const db = readDB(); const post = { id: generateId(), ...req.body, date: new Date().toISOString().split('T')[0], likes: 0, comments: [] }; db.blog.push(post); writeDB(db); return res.status(201).json(post) })
app.patch('/api/blog/:id', requireAdmin, (req, res) => { const db = readDB(); const index = db.blog.findIndex((post) => String(post.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Post not found' }); db.blog[index] = { ...db.blog[index], ...req.body }; writeDB(db); return res.json(db.blog[index]) })
app.delete('/api/blog/:id', requireAdmin, (req, res) => { const db = readDB(); db.blog = db.blog.filter((post) => String(post.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/orders', requireAuth, (req, res) => { const db = readDB(); const userId = req.auth.role === 'admin' && req.query.userId ? req.query.userId : req.auth.role === 'admin' ? null : req.auth.sub; return res.json(userId ? db.orders.filter((order) => String(order.userId) === String(userId)) : db.orders) })
app.post('/api/orders', requireAuth, (req, res) => {
  const db = readDB(); const userId = String(req.auth.sub); const order = { id: generateId(), ...req.body, userId, createdAt: new Date().toISOString(), status: req.body.status || 'pending' }; db.orders.push(order); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save order' }); return res.status(201).json(order)
})

app.get('/api/cart', (req, res) => res.json(getCart(readDB(), getUserId(req))))
app.post('/api/cart', (req, res) => {
  const db = readDB(); const userId = getUserId(req); const productId = String(req.body.productId || ''); const quantity = Math.max(1, Number(req.body.quantity || 1))
  if (!db.products.some((product) => String(product.id) === productId)) return res.status(404).json({ error: 'Product not found' })
  const existing = db.cart.find((item) => String(item.userId || 'guest') === userId && String(item.productId) === productId); if (existing) existing.quantity += quantity; else db.cart.push({ id: generateId(), userId, productId, quantity })
  if (!writeDB(db)) return res.status(500).json({ error: 'Could not save cart' }); return sendUpdatedCart(res, db, userId)
})
app.patch('/api/cart/:id', (req, res) => { const db = readDB(); const userId = getUserId(req); const item = db.cart.find((entry) => String(entry.id) === String(req.params.id) && String(entry.userId || 'guest') === userId); if (!item) return res.status(404).json({ error: 'Cart item not found' }); item.quantity = Math.max(1, Number(req.body.quantity || 1)); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save cart' }); return sendUpdatedCart(res, db, userId) })
app.delete('/api/cart/:id', (req, res) => { const db = readDB(); const userId = getUserId(req); db.cart = db.cart.filter((item) => !(String(item.id) === String(req.params.id) && String(item.userId || 'guest') === userId)); writeDB(db); return sendUpdatedCart(res, db, userId) })
app.delete('/api/cart', (req, res) => { const db = readDB(); const userId = getUserId(req); db.cart = db.cart.filter((item) => String(item.userId || 'guest') !== userId); writeDB(db); return sendUpdatedCart(res, db, userId) })

app.get('/api/notifications', requireAuth, (req, res) => { const db = readDB(); const userId = String(req.auth.sub); return res.json(db.notifications.filter((notification) => !notification.targetUserId || String(notification.targetUserId) === userId)) })
app.post('/api/notifications', requireAdmin, (req, res) => { const db = readDB(); const notification = { id: generateId(), ...req.body, read: false, createdAt: new Date().toISOString() }; db.notifications.push(notification); writeDB(db); return res.status(201).json(notification) })
app.patch('/api/notifications/:id', requireAuth, (req, res) => { const db = readDB(); const index = db.notifications.findIndex((notification) => String(notification.id) === String(req.params.id) && (req.auth.role === 'admin' || !notification.targetUserId || String(notification.targetUserId) === String(req.auth.sub))); if (index === -1) return res.status(404).json({ error: 'Notification not found' }); db.notifications[index] = { ...db.notifications[index], ...req.body }; writeDB(db); return res.json(db.notifications[index]) })
app.patch('/api/notifications', requireAuth, (req, res) => { const db = readDB(); const userId = String(req.auth.sub); db.notifications = db.notifications.map((notification) => (!notification.targetUserId || String(notification.targetUserId) === userId ? { ...notification, read: true } : notification)); writeDB(db); return res.json(db.notifications.filter((notification) => !notification.targetUserId || String(notification.targetUserId) === userId)) })
app.delete('/api/notifications/:id', requireAdmin, (req, res) => { const db = readDB(); db.notifications = db.notifications.filter((notification) => String(notification.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/discounts', (req, res) => res.json(readDB().discounts))
app.post('/api/discounts', requireAdmin, (req, res) => { const db = readDB(); const discount = { id: generateId(), ...req.body }; db.discounts.push(discount); writeDB(db); return res.status(201).json(discount) })
app.post('/api/discounts/apply', (req, res) => {
  const db = readDB(); const code = String(req.body.code || '').trim().toUpperCase(); const discount = db.discounts.find((entry) => String(entry.code || '').toUpperCase() === code && entry.active !== false)
  if (!discount) return res.status(404).json({ error: 'Discount code is invalid or inactive' })
  if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) return res.status(400).json({ error: 'Discount code has expired' })
  if (discount.maxUses != null && Number(discount.usedCount || 0) >= Number(discount.maxUses)) return res.status(400).json({ error: 'Discount usage limit reached' })
  const amount = Math.max(0, Number(req.body.amount || 0)); const discountAmount = discount.type === 'fixed' ? Math.min(amount, Number(discount.discount || 0)) : amount * (Number(discount.discount || 0) / 100)
  return res.json({ code: discount.code, discount: Number(discount.discount || 0), type: discount.type || 'percent', discountAmount, finalAmount: Math.max(0, amount - discountAmount) })
})
app.patch('/api/discounts/:id', requireAdmin, (req, res) => { const db = readDB(); const index = db.discounts.findIndex((discount) => String(discount.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Discount not found' }); db.discounts[index] = { ...db.discounts[index], ...req.body }; writeDB(db); return res.json(db.discounts[index]) })
app.delete('/api/discounts/:id', requireAdmin, (req, res) => { const db = readDB(); db.discounts = db.discounts.filter((discount) => String(discount.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/tickets', requireAuth, (req, res) => { const db = readDB(); return res.json(req.auth.role === 'admin' ? db.tickets : db.tickets.filter((ticket) => String(ticket.userId) === String(req.auth.sub))) })
app.post('/api/tickets', requireAuth, (req, res) => { const db = readDB(); const ticket = { id: generateId(), ...req.body, userId: String(req.auth.sub), status: 'open', createdAt: new Date().toISOString() }; db.tickets.push(ticket); writeDB(db); return res.status(201).json(ticket) })
app.patch('/api/tickets/:id', requireAuth, (req, res) => { const db = readDB(); const index = db.tickets.findIndex((ticket) => String(ticket.id) === String(req.params.id) && (req.auth.role === 'admin' || String(ticket.userId) === String(req.auth.sub))); if (index === -1) return res.status(404).json({ error: 'Ticket not found' }); db.tickets[index] = { ...db.tickets[index], ...req.body }; writeDB(db); return res.json(db.tickets[index]) })
app.delete('/api/tickets/:id', requireAdmin, (req, res) => { const db = readDB(); db.tickets = db.tickets.filter((ticket) => String(ticket.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/wallet/:userId', requireAuth, (req, res) => { if (req.auth.role !== 'admin' && String(req.auth.sub) !== String(req.params.userId)) return res.status(403).json({ error: 'Forbidden' }); const db = readDB(); const user = db.users.find((candidate) => String(candidate.id) === String(req.params.userId)); if (!user) return res.status(404).json({ error: 'User not found' }); return res.json({ wallet: Number(user.wallet || 0) }) })
app.post('/api/pay-with-wallet', requireAuth, (req, res) => { const db = readDB(); const user = db.users.find((candidate) => String(candidate.id) === String(req.auth.sub)); const amount = Number(req.body.amount); if (!user) return res.status(404).json({ error: 'User not found' }); if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' }); if (Number(user.wallet || 0) < amount) return res.status(400).json({ error: 'Insufficient wallet balance' }); user.wallet = Number(user.wallet || 0) - amount; db.transactions.push({ id: generateId(), userId: user.id, amount: -amount, type: 'wallet-payment', createdAt: new Date().toISOString() }); writeDB(db); return res.json({ success: true, newBalance: user.wallet }) })

app.post('/api/create-bale-invoice', requireAuth, (req, res) => {
  const amount = Number(req.body.amount); if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' })
  return res.json({ success: true, paymentUrl: configuredBalePaymentUrl || null, invoiceId: generateId(), amount, description: String(req.body.description || 'خرید از BinerCraft'), status: 'pending', configured: Boolean(configuredBaleToken && configuredBalePaymentUrl) })
})
app.post('/api/bale-callback', (req, res) => { const { invoiceId, status, transactionId } = req.body; if (!invoiceId) return res.status(400).json({ success: false, message: 'invoiceId is required' }); if (status === 'paid') return res.json({ success: true, message: 'Payment confirmed', transactionId: transactionId || null }); return res.json({ success: false, message: 'Payment failed or cancelled' }) })
app.get('/api/server-stats', (req, res) => res.json(readDB().serverStats))

app.get('/api/admin/overview', requireAdmin, (req, res) => {
  const db = readDB()
  const revenue = db.orders.filter((order) => order.status === 'paid' || order.status === 'completed').reduce((sum, order) => sum + Number(order.total || order.amount || 0), 0)
  return res.json({
    users: db.users.length,
    admins: db.users.filter((user) => user.role === 'admin').length,
    products: db.products.length,
    orders: db.orders.length,
    pendingOrders: db.orders.filter((order) => order.status === 'pending').length,
    tickets: db.tickets.length,
    openTickets: db.tickets.filter((ticket) => ticket.status !== 'closed').length,
    discounts: db.discounts.length,
    revenue,
    serverStats: db.serverStats
  })
})

app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((error, req, res, next) => { console.error(error); if (res.headersSent) return next(error); return res.status(500).json({ error: 'Internal server error' }) })
app.listen(PORT, () => { console.log(`🚀 BinerCraft Backend running on http://localhost:${PORT}`); console.log('📡 API endpoints ready') })