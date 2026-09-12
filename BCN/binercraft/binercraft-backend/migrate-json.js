const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

const file = path.join(__dirname, 'db.json')
const source = JSON.parse(fs.readFileSync(file, 'utf8'))

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 5,
  charset: 'utf8mb4'
})

const id = value => String(value ?? crypto.randomUUID())
const crypto = require('crypto')
const j = value => JSON.stringify(value ?? {})

async function run() {
  const [existing] = await db.execute('SELECT COUNT(*) AS count FROM users')
  if (Number(existing[0].count) > 0) {
    console.log('Migration skipped: users table is not empty.')
    await db.end()
    return
  }

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    for (const u of source.users || []) {
      await conn.execute('INSERT IGNORE INTO users(id,username,email,display_name,role,wallet,avatar) VALUES(?,?,?,?,?,?,?)', [id(u.id), u.username, u.email || null, u.displayName || u.username, u.role === 'admin' ? 'admin' : 'user', Number(u.wallet || 0), u.avatar || ''])
    }
    for (const p of source.products || []) {
      await conn.execute('INSERT IGNORE INTO products(id,name,category,price,description,image,active,metadata) VALUES(?,?,?,?,?,?,?,?)', [id(p.id), p.name, p.category || '', Number(p.price || 0), p.description || '', p.image || '', 1, j(p.metadata || {})])
    }
    for (const b of source.blog || []) {
      await conn.execute('INSERT IGNORE INTO blog_posts(id,title,summary,content,author,author_id,date,likes,comments,category,image,published) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [id(b.id), b.title, b.summary || '', b.content || '', b.author || '', b.authorId ? id(b.authorId) : null, b.date || new Date().toISOString().slice(0, 10), Number(b.likes || 0), j(b.comments || []), b.category || '', b.image || '', 1])
    }
    for (const d of source.discounts || []) {
      await conn.execute('INSERT IGNORE INTO discounts(id,code,description,discount,type,max_uses,used_count,active,expiry_date) VALUES(?,?,?,?,?,?,?,?,?)', [id(d.id), String(d.code || '').toUpperCase(), d.description || '', Number(d.discount || 0), d.type || 'percent', Number(d.maxUses || 0), Number(d.usedCount || 0), d.active === false ? 0 : 1, d.expiryDate || null])
    }
    for (const n of source.notifications || []) {
      await conn.execute('INSERT IGNORE INTO notifications(id,message,type,target_user_id,is_read,created_at) VALUES(?,?,?,?,?,?)', [id(n.id), n.message || '', n.type || 'default', n.targetUserId ? id(n.targetUserId) : null, n.read ? 1 : 0, n.createdAt ? new Date(n.createdAt) : new Date()])
    }
    const s = source.serverStats || {}
    await conn.execute('UPDATE server_stats SET players=?,stability=?,sales=?,support=?,status=? WHERE id=1', [Number(s.players || 0), Number(s.stability || 99.9), Number(s.sales || 0), Number(s.support || 0), s.status || 'online'])
    await conn.commit()
    console.log('db.json migration completed successfully.')
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
    await db.end()
  }
}

run().catch(error => { console.error('Migration failed:', error); process.exit(1) })
