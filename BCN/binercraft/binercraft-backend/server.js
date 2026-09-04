const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const DB_PATH = path.join(__dirname, 'db.json')

const DEFAULT_DB = { users: [], products: [], blog: [], orders: [], cart: [], notifications: [], discounts: [], tickets: [], transactions: [], serverStats: { players: 0, stability: 99.9, sales: 0, support: 0, status: 'online' } }
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((value) => value.trim()).filter(Boolean)
const configuredBaleToken = process.env.BALE_WALLET_TOKEN && !process.env.BALE_WALLET_TOKEN.startsWith('YOUR_') ? process.env.BALE_WALLET_TOKEN : ''
const configuredBalePaymentUrl = process.env.BALE_PAYMENT_URL && !process.env.BALE_PAYMENT_URL.startsWith('YOUR_') ? process.env.BALE_PAYMENT_URL : ''

app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('CORS origin is not allowed')) } }))
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

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'BinerCraft Backend', timestamp: new Date().toISOString() }))

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
  return res.json({ user: sanitizeUser(user) })
})

app.get('/api/users', (req, res) => res.json(readDB().users.map(sanitizeUser)))
app.post('/api/users', (req, res) => {
  const db = readDB(); const password = String(req.body.password || ''); const user = { id: generateId(), ...req.body, wallet: Number(req.body.wallet || 0), ...(password ? { passwordHash: hashPassword(password) } : {}) }
  delete user.password; db.users.push(user); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save user' }); return res.status(201).json(sanitizeUser(user))
})
app.patch('/api/users/:id', (req, res) => {
  const db = readDB(); const index = db.users.findIndex((user) => String(user.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'User not found' })
  const updates = { ...req.body }; if (updates.password) { updates.passwordHash = hashPassword(String(updates.password)); delete updates.password }
  db.users[index] = { ...db.users[index], ...updates }; if (!writeDB(db)) return res.status(500).json({ error: 'Could not save user' }); return res.json(sanitizeUser(db.users[index]))
})

app.get('/api/products', (req, res) => res.json(readDB().products))
app.post('/api/products', (req, res) => { const db = readDB(); const product = { id: generateId(), ...req.body, price: Number(req.body.price || 0) }; db.products.push(product); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save product' }); return res.status(201).json(product) })
app.patch('/api/products/:id', (req, res) => { const db = readDB(); const index = db.products.findIndex((product) => String(product.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Product not found' }); db.products[index] = { ...db.products[index], ...req.body }; if (!writeDB(db)) return res.status(500).json({ error: 'Could not save product' }); return res.json(db.products[index]) })
app.delete('/api/products/:id', (req, res) => { const db = readDB(); db.products = db.products.filter((product) => String(product.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/blog', (req, res) => res.json(readDB().blog))
app.post('/api/blog', (req, res) => { const db = readDB(); const post = { id: generateId(), ...req.body, date: new Date().toISOString().split('T')[0], likes: 0, comments: [] }; db.blog.push(post); writeDB(db); return res.status(201).json(post) })
app.patch('/api/blog/:id', (req, res) => { const db = readDB(); const index = db.blog.findIndex((post) => String(post.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Post not found' }); db.blog[index] = { ...db.blog[index], ...req.body }; writeDB(db); return res.json(db.blog[index]) })
app.delete('/api/blog/:id', (req, res) => { const db = readDB(); db.blog = db.blog.filter((post) => String(post.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/orders', (req, res) => { const db = readDB(); const userId = req.query.userId; return res.json(userId ? db.orders.filter((order) => String(order.userId) === String(userId)) : db.orders) })
app.post('/api/orders', (req, res) => { const db = readDB(); const order = { id: generateId(), ...req.body, createdAt: new Date().toISOString(), status: req.body.status || 'pending' }; db.orders.push(order); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save order' }); return res.status(201).json(order) })

app.get('/api/cart', (req, res) => sendUpdatedCart(res, readDB(), getUserId(req)))
app.post('/api/cart', (req, res) => {
  const db = readDB(); const userId = getUserId(req); const productId = String(req.body.productId || ''); const quantity = Math.max(1, Number(req.body.quantity || 1))
  if (!db.products.some((product) => String(product.id) === productId)) return res.status(404).json({ error: 'Product not found' })
  const existing = db.cart.find((item) => String(item.userId || 'guest') === userId && String(item.productId) === productId); if (existing) existing.quantity += quantity; else db.cart.push({ id: generateId(), userId, productId, quantity })
  if (!writeDB(db)) return res.status(500).json({ error: 'Could not save cart' }); return sendUpdatedCart(res, db, userId)
})
app.patch('/api/cart/:id', (req, res) => { const db = readDB(); const userId = getUserId(req); const item = db.cart.find((entry) => String(entry.id) === String(req.params.id) && String(entry.userId || 'guest') === userId); if (!item) return res.status(404).json({ error: 'Cart item not found' }); item.quantity = Math.max(1, Number(req.body.quantity || 1)); if (!writeDB(db)) return res.status(500).json({ error: 'Could not save cart' }); return sendUpdatedCart(res, db, userId) })
app.delete('/api/cart/:id', (req, res) => { const db = readDB(); const userId = getUserId(req); db.cart = db.cart.filter((item) => !(String(item.id) === String(req.params.id) && String(item.userId || 'guest') === userId)); writeDB(db); return sendUpdatedCart(res, db, userId) })
app.delete('/api/cart', (req, res) => { const db = readDB(); const userId = getUserId(req); db.cart = db.cart.filter((item) => String(item.userId || 'guest') !== userId); writeDB(db); return sendUpdatedCart(res, db, userId) })

app.get('/api/notifications', (req, res) => { const db = readDB(); const userId = String(req.query.userId || 'guest'); return res.json(db.notifications.filter((notification) => !notification.targetUserId || String(notification.targetUserId) === userId)) })
app.post('/api/notifications', (req, res) => { const db = readDB(); const notification = { id: generateId(), ...req.body, read: false, createdAt: new Date().toISOString() }; db.notifications.push(notification); writeDB(db); return res.status(201).json(notification) })
app.patch('/api/notifications/:id', (req, res) => { const db = readDB(); const index = db.notifications.findIndex((notification) => String(notification.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Notification not found' }); db.notifications[index] = { ...db.notifications[index], ...req.body }; writeDB(db); return res.json(db.notifications[index]) })
app.patch('/api/notifications', (req, res) => { const db = readDB(); const userId = String(req.body.userId || 'guest'); db.notifications = db.notifications.map((notification) => (!notification.targetUserId || String(notification.targetUserId) === userId ? { ...notification, read: true } : notification)); writeDB(db); return res.json(db.notifications.filter((notification) => !notification.targetUserId || String(notification.targetUserId) === userId)) })
app.delete('/api/notifications/:id', (req, res) => { const db = readDB(); db.notifications = db.notifications.filter((notification) => String(notification.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/discounts', (req, res) => res.json(readDB().discounts))
app.post('/api/discounts', (req, res) => { const db = readDB(); const discount = { id: generateId(), ...req.body }; db.discounts.push(discount); writeDB(db); return res.status(201).json(discount) })
app.post('/api/discounts/apply', (req, res) => {
  const db = readDB(); const code = String(req.body.code || '').trim().toUpperCase(); const discount = db.discounts.find((entry) => String(entry.code || '').toUpperCase() === code && entry.active !== false)
  if (!discount) return res.status(404).json({ error: 'Discount code is invalid or inactive' })
  if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) return res.status(400).json({ error: 'Discount code has expired' })
  if (discount.maxUses != null && Number(discount.usedCount || 0) >= Number(discount.maxUses)) return res.status(400).json({ error: 'Discount usage limit reached' })
  const amount = Math.max(0, Number(req.body.amount || 0)); const discountAmount = discount.type === 'fixed' ? Math.min(amount, Number(discount.discount || 0)) : amount * (Number(discount.discount || 0) / 100)
  return res.json({ code: discount.code, discount: Number(discount.discount || 0), type: discount.type || 'percent', discountAmount, finalAmount: Math.max(0, amount - discountAmount) })
})
app.patch('/api/discounts/:id', (req, res) => { const db = readDB(); const index = db.discounts.findIndex((discount) => String(discount.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Discount not found' }); db.discounts[index] = { ...db.discounts[index], ...req.body }; writeDB(db); return res.json(db.discounts[index]) })
app.delete('/api/discounts/:id', (req, res) => { const db = readDB(); db.discounts = db.discounts.filter((discount) => String(discount.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/tickets', (req, res) => { const db = readDB(); const userId = req.query.userId; return res.json(userId ? db.tickets.filter((ticket) => String(ticket.userId) === String(userId)) : db.tickets) })
app.post('/api/tickets', (req, res) => { const db = readDB(); const ticket = { id: generateId(), ...req.body, status: 'open', createdAt: new Date().toISOString() }; db.tickets.push(ticket); writeDB(db); return res.status(201).json(ticket) })
app.patch('/api/tickets/:id', (req, res) => { const db = readDB(); const index = db.tickets.findIndex((ticket) => String(ticket.id) === String(req.params.id)); if (index === -1) return res.status(404).json({ error: 'Ticket not found' }); db.tickets[index] = { ...db.tickets[index], ...req.body }; writeDB(db); return res.json(db.tickets[index]) })
app.delete('/api/tickets/:id', (req, res) => { const db = readDB(); db.tickets = db.tickets.filter((ticket) => String(ticket.id) !== String(req.params.id)); writeDB(db); return res.status(204).send() })

app.get('/api/wallet/:userId', (req, res) => { const db = readDB(); const user = db.users.find((candidate) => String(candidate.id) === String(req.params.userId)); if (!user) return res.status(404).json({ error: 'User not found' }); return res.json({ wallet: Number(user.wallet || 0) }) })
app.post('/api/pay-with-wallet', (req, res) => { const db = readDB(); const user = db.users.find((candidate) => String(candidate.id) === String(req.body.userId)); const amount = Number(req.body.amount); if (!user) return res.status(404).json({ error: 'User not found' }); if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' }); if (Number(user.wallet || 0) < amount) return res.status(400).json({ error: 'Insufficient wallet balance' }); user.wallet = Number(user.wallet || 0) - amount; db.transactions.push({ id: generateId(), userId: user.id, amount: -amount, type: 'wallet-payment', createdAt: new Date().toISOString() }); writeDB(db); return res.json({ success: true, newBalance: user.wallet }) })

app.post('/api/create-bale-invoice', (req, res) => {
  const amount = Number(req.body.amount); if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' })
  return res.json({ success: true, paymentUrl: configuredBalePaymentUrl || null, invoiceId: generateId(), amount, description: String(req.body.description || 'خرید از BinerCraft'), status: 'pending', configured: Boolean(configuredBaleToken && configuredBalePaymentUrl) })
})
app.post('/api/bale-callback', (req, res) => { const { invoiceId, status, transactionId } = req.body; if (!invoiceId) return res.status(400).json({ success: false, message: 'invoiceId is required' }); if (status === 'paid') return res.json({ success: true, message: 'Payment confirmed', transactionId: transactionId || null }); return res.json({ success: false, message: 'Payment failed or cancelled' }) })
app.get('/api/server-stats', (req, res) => res.json(readDB().serverStats))

app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((error, req, res, next) => { console.error(error); if (res.headersSent) return next(error); return res.status(500).json({ error: 'Internal server error' }) })
app.listen(PORT, () => { console.log(`🚀 BinerCraft Backend running on http://localhost:${PORT}`); console.log('📡 API endpoints ready') })
