const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database file path
const DB_PATH = path.join(__dirname, 'db.json')

// Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database:', error)
    return { users: [], products: [], blog: [], orders: [], cart: [], notifications: [], discounts: [], tickets: [], transactions: [], serverStats: { players: 0, stability: 99.9, sales: 0, support: 0, status: 'online' } }
  }
}

// Write database
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing database:', error)
    return false
  }
}

// Helper to generate ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5)

// ============ API ROUTES ============

// Users
app.get('/api/users', (req, res) => {
  const db = readDB()
  res.json(db.users)
})

app.post('/api/users', (req, res) => {
  const db = readDB()
  const newUser = { id: generateId(), ...req.body, wallet: req.body.wallet || 0 }
  db.users.push(newUser)
  writeDB(db)
  res.status(201).json(newUser)
})

app.patch('/api/users/:id', (req, res) => {
  const db = readDB()
  const index = db.users.findIndex(u => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'User not found' })
  db.users[index] = { ...db.users[index], ...req.body }
  writeDB(db)
  res.json(db.users[index])
})

// Products
app.get('/api/products', (req, res) => {
  const db = readDB()
  res.json(db.products)
})

app.post('/api/products', (req, res) => {
  const db = readDB()
  const newProduct = { id: generateId(), ...req.body }
  db.products.push(newProduct)
  writeDB(db)
  res.status(201).json(newProduct)
})

app.patch('/api/products/:id', (req, res) => {
  const db = readDB()
  const index = db.products.findIndex(p => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Product not found' })
  db.products[index] = { ...db.products[index], ...req.body }
  writeDB(db)
  res.json(db.products[index])
})

app.delete('/api/products/:id', (req, res) => {
  const db = readDB()
  db.products = db.products.filter(p => p.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// Blog
app.get('/api/blog', (req, res) => {
  const db = readDB()
  res.json(db.blog)
})

app.post('/api/blog', (req, res) => {
  const db = readDB()
  const newPost = { id: generateId(), ...req.body, date: new Date().toISOString().split('T')[0], likes: 0, comments: [] }
  db.blog.push(newPost)
  writeDB(db)
  res.status(201).json(newPost)
})

app.patch('/api/blog/:id', (req, res) => {
  const db = readDB()
  const index = db.blog.findIndex(p => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Post not found' })
  db.blog[index] = { ...db.blog[index], ...req.body }
  writeDB(db)
  res.json(db.blog[index])
})

app.delete('/api/blog/:id', (req, res) => {
  const db = readDB()
  db.blog = db.blog.filter(p => p.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// Orders
app.get('/api/orders', (req, res) => {
  const db = readDB()
  res.json(db.orders)
})

app.post('/api/orders', (req, res) => {
  const db = readDB()
  const newOrder = { id: generateId(), ...req.body, createdAt: new Date().toISOString() }
  db.orders.push(newOrder)
  writeDB(db)
  res.status(201).json(newOrder)
})

// Cart
app.get('/api/cart', (req, res) => {
  const db = readDB()
  res.json(db.cart)
})

app.post('/api/cart', (req, res) => {
  const db = readDB()
  const { productId, quantity = 1 } = req.body
  const existing = db.cart.find(item => item.productId === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    db.cart.push({ id: generateId(), productId, quantity })
  }
  writeDB(db)
  res.json(db.cart)
})

app.patch('/api/cart/:id', (req, res) => {
  const db = readDB()
  const index = db.cart.findIndex(item => item.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Cart item not found' })
  db.cart[index] = { ...db.cart[index], ...req.body }
  writeDB(db)
  res.json(db.cart)
})

app.delete('/api/cart/:id', (req, res) => {
  const db = readDB()
  db.cart = db.cart.filter(item => item.id !== req.params.id)
  writeDB(db)
  res.json(db.cart)
})

app.delete('/api/cart', (req, res) => {
  const db = readDB()
  db.cart = []
  writeDB(db)
  res.json(db.cart)
})

// Notifications
app.get('/api/notifications', (req, res) => {
  const db = readDB()
  res.json(db.notifications)
})

app.post('/api/notifications', (req, res) => {
  const db = readDB()
  const newNotification = { id: generateId(), ...req.body, read: false, createdAt: new Date().toISOString() }
  db.notifications.push(newNotification)
  writeDB(db)
  res.status(201).json(newNotification)
})

app.patch('/api/notifications/:id', (req, res) => {
  const db = readDB()
  const index = db.notifications.findIndex(n => n.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Notification not found' })
  db.notifications[index] = { ...db.notifications[index], ...req.body }
  writeDB(db)
  res.json(db.notifications[index])
})

app.patch('/api/notifications', (req, res) => {
  const db = readDB()
  db.notifications = db.notifications.map(n => ({ ...n, read: true }))
  writeDB(db)
  res.json(db.notifications)
})

app.delete('/api/notifications/:id', (req, res) => {
  const db = readDB()
  db.notifications = db.notifications.filter(n => n.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// Discounts
app.get('/api/discounts', (req, res) => {
  const db = readDB()
  res.json(db.discounts)
})

app.post('/api/discounts', (req, res) => {
  const db = readDB()
  const newDiscount = { id: generateId(), ...req.body }
  db.discounts.push(newDiscount)
  writeDB(db)
  res.status(201).json(newDiscount)
})

app.patch('/api/discounts/:id', (req, res) => {
  const db = readDB()
  const index = db.discounts.findIndex(d => d.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Discount not found' })
  db.discounts[index] = { ...db.discounts[index], ...req.body }
  writeDB(db)
  res.json(db.discounts[index])
})

app.delete('/api/discounts/:id', (req, res) => {
  const db = readDB()
  db.discounts = db.discounts.filter(d => d.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// Tickets
app.get('/api/tickets', (req, res) => {
  const db = readDB()
  res.json(db.tickets)
})

app.post('/api/tickets', (req, res) => {
  const db = readDB()
  const newTicket = { id: generateId(), ...req.body, status: 'open', createdAt: new Date().toISOString() }
  db.tickets.push(newTicket)
  writeDB(db)
  res.status(201).json(newTicket)
})

app.patch('/api/tickets/:id', (req, res) => {
  const db = readDB()
  const index = db.tickets.findIndex(t => t.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' })
  db.tickets[index] = { ...db.tickets[index], ...req.body }
  writeDB(db)
  res.json(db.tickets[index])
})

app.delete('/api/tickets/:id', (req, res) => {
  const db = readDB()
  db.tickets = db.tickets.filter(t => t.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// Wallet
app.get('/api/wallet/:userId', (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ wallet: user.wallet || 0 })
})

app.post('/api/pay-with-wallet', (req, res) => {
  const db = readDB()
  const { userId, amount } = req.body
  const user = db.users.find(u => u.id === userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if ((user.wallet || 0) < amount) {
    return res.status(400).json({ error: 'Insufficient wallet balance' })
  }
  user.wallet = (user.wallet || 0) - amount
  writeDB(db)
  res.json({ success: true, newBalance: user.wallet })
})

// Bale payment
app.post('/api/create-bale-invoice', (req, res) => {
  const { amount, description, userId } = req.body
  
  // In a real implementation, you would call Bale's API here
  // For demo, we simulate the response
  res.json({
    success: true,
    paymentUrl: https://bale.com/pay/,
    invoiceId: generateId(),
    amount: amount,
    description: description || 'خرید از BinerCraft'
  })
})

app.post('/api/bale-callback', (req, res) => {
  // This is the webhook endpoint that Bale calls after payment
  const { invoiceId, status, transactionId } = req.body
  
  if (status === 'paid') {
    // Process successful payment
    res.json({ success: true, message: 'Payment confirmed' })
  } else {
    res.json({ success: false, message: 'Payment failed or cancelled' })
  }
})

// Server stats
app.get('/api/server-stats', (req, res) => {
  const db = readDB()
  res.json(db.serverStats || { players: 0, stability: 99.9, sales: 0, support: 0, status: 'online' })
})

// Start server
app.listen(PORT, () => {
  console.log(🚀 BinerCraft Backend running on http://localhost:)
  console.log('📡 API endpoints ready:')
  console.log(  - Users: http://localhost:/api/users)
  console.log(  - Products: http://localhost:/api/products)
  console.log(  - Blog: http://localhost:/api/blog)
  console.log(  - Cart: http://localhost:/api/cart)
})
