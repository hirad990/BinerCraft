const express=require('express')
const cors=require('cors')
const crypto=require('crypto')
const fs=require('fs')
const path=require('path')

const app=express()
const PORT=Number(process.env.PORT||3000)
const PREFIX=(String(process.env.API_PREFIX||'/loloh').replace(/\/$/,'')||'/loloh')
const SECRET=String(process.env.AUTH_SECRET||'binercraft-dev-secret-change-me').trim()
const ADMIN=String(process.env.ADMIN_USERNAME||'hirad990').trim().toLowerCase()
const ADMIN_PASSWORD=String(process.env.ADMIN_PASSWORD||'').trim()
const DB_FILE=path.join(__dirname,'db.json')

const origins=['https://binercraft.ir','https://www.binercraft.ir','http://localhost:5173','http://127.0.0.1:5173',...(process.env.FRONTEND_URL||'').split(',').map(x=>x.trim()).filter(Boolean)]
app.use(cors({origin:(o,cb)=>!o||origins.includes(o)||/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)?cb(null,true):cb(new Error('CORS origin is not allowed')),credentials:true}))
app.use(express.json({limit:'2mb'}))
app.use((req,_res,next)=>{if(req.url===PREFIX)req.url='/';else if(req.url.startsWith(PREFIX+'/'))req.url=req.url.slice(PREFIX.length);next()})

const id=()=>crypto.randomUUID()
const now=()=>new Date().toISOString()
const clone=x=>JSON.parse(JSON.stringify(x))
const readDB=()=>{
  try{return JSON.parse(fs.readFileSync(DB_FILE,'utf8'))}
  catch(e){console.error('db.json read failed:',e);return {users:[],products:[],blogPosts:[],blog:[],cart:[],orders:[],orderItems:[],discounts:[],tickets:[],notifications:[],transactions:[],siteSettings:{},serverStats:{}}}
}
const normalize=db=>{
  db.users??=[];db.products??=[];db.blogPosts??=db.blog??[];db.blog??=db.blogPosts;db.cart??=[];db.orders??=[];db.orderItems??=[];db.discounts??=[];db.tickets??=[];db.notifications??=[];db.transactions??=[]
  db.siteSettings??={siteName:'BinerCraft',supportEmail:'support@binercraft.ir',supportHours:'هر روز، ۹ تا ۲۳',contactText:'تیم BinerCraft آماده پاسخ‌گویی به شماست.',serverAddress:'play.binercraft.ir',announcement:''}
  db.serverStats??={players:0,stability:99.9,sales:0,support:0,status:'online'}
  return db
}
let db=normalize(readDB())
const saveDB=()=>{const tmp=`${DB_FILE}.tmp`;fs.writeFileSync(tmp,JSON.stringify(db,null,2),'utf8');fs.renameSync(tmp,DB_FILE)}
const safeUser=u=>{if(!u)return null;const x=clone(u);delete x.password;delete x.passwordHash;return x}
const hashPassword=p=>{const salt=crypto.randomBytes(16).toString('hex');return `${salt}:${crypto.scryptSync(String(p),salt,64).toString('hex')}`}
const verifyPassword=(p,h)=>{if(!h||!h.includes(':'))return false;const [salt,hex]=h.split(':');try{const a=crypto.scryptSync(String(p),salt,64),b=Buffer.from(hex,'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b)}catch{return false}}
const token=payload=>{const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');const b=Buffer.from(JSON.stringify(payload)).toString('base64url');const s=crypto.createHmac('sha256',SECRET).update(`${h}.${b}`).digest('base64url');return `${h}.${b}.${s}`}
const decode=t=>{if(!t)return null;const a=String(t).split('.');if(a.length!==3)return null;const sig=crypto.createHmac('sha256',SECRET).update(`${a[0]}.${a[1]}`).digest('base64url');if(sig!==a[2])return null;try{const p=JSON.parse(Buffer.from(a[1],'base64url'));return p.exp>Date.now()/1000?p:null}catch{return null}}
const auth=(req,res,next)=>{const h=String(req.headers.authorization||'');const p=decode(h.startsWith('Bearer ')?h.slice(7):'');if(!p)return res.status(401).json({error:'Authentication required'});req.auth=p;next()}
const optionalAuth=(req,_res,next)=>{const h=String(req.headers.authorization||'');req.auth=decode(h.startsWith('Bearer ')?h.slice(7):'')||null;next()}
const admin=(req,res,next)=>auth(req,res,()=>req.auth.role==='admin'?next():res.status(403).json({error:'Admin access required'}))
const route=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)
const findUser=(identifier)=>db.users.find(u=>String(u.username||'').toLowerCase()===String(identifier||'').toLowerCase()||String(u.email||'').toLowerCase()===String(identifier||'').toLowerCase())
const productView=p=>({...p,price:Number(p.price||0),active:p.active!==false})

const ensureAdmin=()=>{
  if(!ADMIN_PASSWORD)return
  let u=db.users.find(x=>String(x.username).toLowerCase()===ADMIN)
  if(!u){u={id:id(),username:ADMIN,email:`${ADMIN}@binercraft.ir`,displayName:'مدیر BinerCraft',role:'admin',wallet:0,avatar:'',createdAt:now()};db.users.push(u)}
  u.role='admin';u.passwordHash=hashPassword(ADMIN_PASSWORD);saveDB()
}
ensureAdmin()

app.get('/',route(async(_req,res)=>res.json({status:'ok',service:'BinerCraft Backend',database:'json',apiPrefix:PREFIX,timestamp:now()})))
app.get('/health',route(async(_req,res)=>res.json({status:'ok',service:'BinerCraft Backend',database:'json',apiPrefix:PREFIX,timestamp:now()})))
app.get('/api/health',route(async(_req,res)=>res.json({status:'ok',service:'BinerCraft Backend',database:'json',apiPrefix:PREFIX,timestamp:now()})))

app.post('/api/users/register',route(async(req,res)=>{const b=req.body||{};const username=String(b.username||'').trim(),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');if(!/^[-_a-zA-Z0-9]{3,32}$/.test(username)||password.length<8||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Invalid registration data'});if(findUser(username)||findUser(email))return res.status(409).json({error:'Username or email already exists'});const u={id:id(),username,email,displayName:String(b.displayName||username).trim(),role:'user',wallet:0,avatar:'',passwordHash:hashPassword(password),createdAt:now()};db.users.push(u);saveDB();const t=token({sub:u.id,username:u.username,role:u.role,exp:Math.floor(Date.now()/1000)+43200});res.status(201).json({user:safeUser(u),token:t})}))
app.post('/api/users/login',route(async(req,res)=>{const identifier=String(req.body.identifier||req.body.username||req.body.email||'').trim();const u=findUser(identifier);if(!u||!verifyPassword(String(req.body.password||''),u.passwordHash||u.password))return res.status(401).json({error:'Invalid username/email or password'});const t=token({sub:u.id,username:u.username,role:u.role,exp:Math.floor(Date.now()/1000)+43200});res.json({user:safeUser(u),token:t})}))
app.post('/api/auth/admin/login',route(async(req,res)=>{const u=findUser(String(req.body.username||req.body.identifier||''));if(!u||u.role!=='admin'||!verifyPassword(String(req.body.password||''),u.passwordHash||u.password))return res.status(401).json({error:'Invalid admin credentials'});const t=token({sub:u.id,username:u.username,role:'admin',exp:Math.floor(Date.now()/1000)+43200});res.json({user:safeUser(u),token:t})}))
app.get('/api/auth/me',auth,route(async(req,res)=>{const u=db.users.find(x=>x.id===req.auth.sub);if(!u)return res.status(401).json({error:'User not found'});res.json({user:safeUser(u)})}))

app.get('/api/users',admin,route(async(_req,res)=>res.json(db.users.map(safeUser))))
app.post('/api/users',admin,route(async(req,res)=>{const b=req.body||{};if(findUser(b.username)||findUser(b.email))return res.status(409).json({error:'User already exists'});const u={id:id(),username:String(b.username||'').trim(),email:String(b.email||'').trim().toLowerCase(),displayName:String(b.displayName||b.username||'').trim(),role:b.role==='admin'?'admin':'user',wallet:Number(b.wallet||0),avatar:String(b.avatar||''),createdAt:now()};if(b.password)u.passwordHash=hashPassword(b.password);db.users.push(u);saveDB();res.status(201).json(safeUser(u))}))
app.patch('/api/users/:id',admin,route(async(req,res)=>{const u=db.users.find(x=>x.id===req.params.id);if(!u)return res.status(404).json({error:'User not found'});const b=req.body||{};for(const k of ['email','displayName','username','avatar'])if(b[k]!==undefined)u[k]=String(b[k]||'').trim();if(b.role!==undefined)u.role=b.role==='admin'?'admin':'user';if(b.wallet!==undefined)u.wallet=Number(b.wallet);if(b.password)u.passwordHash=hashPassword(b.password);saveDB();res.json(safeUser(u))}))
app.delete('/api/users/:id',admin,route(async(req,res)=>{if(req.params.id===req.auth.sub)return res.status(400).json({error:'You cannot delete your own account'});db.users=db.users.filter(x=>x.id!==req.params.id);db.cart=db.cart.filter(x=>x.userId!==req.params.id);saveDB();res.status(204).send()}))
app.patch('/api/account',auth,route(async(req,res)=>{const u=db.users.find(x=>x.id===req.auth.sub);if(!u)return res.status(404).json({error:'User not found'});const b=req.body||{};for(const k of ['email','displayName','username','avatar'])if(b[k]!==undefined)u[k]=String(b[k]||'').trim();if(b.password)u.passwordHash=hashPassword(b.password);saveDB();res.json(safeUser(u))}))

app.get('/api/products',route(async(_req,res)=>res.json(db.products.filter(p=>p.active!==false).map(productView))))
app.get('/api/products/all',admin,route(async(_req,res)=>res.json(db.products.map(productView))))
app.post('/api/products',admin,route(async(req,res)=>{const b=req.body||{};const p={id:id(),name:String(b.name||''),category:String(b.category||''),price:Number(b.price||0),description:String(b.description||''),image:String(b.image||''),active:b.active!==false,metadata:b.metadata||{},createdAt:now()};db.products.push(p);saveDB();res.status(201).json(productView(p))}))
app.patch('/api/products/:id',admin,route(async(req,res)=>{const p=db.products.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:'Product not found'});const b=req.body||{};for(const k of ['name','category','description','image'])if(b[k]!==undefined)p[k]=String(b[k]||'');if(b.price!==undefined)p.price=Number(b.price);if(b.active!==undefined)p.active=!!b.active;if(b.metadata!==undefined)p.metadata=b.metadata;saveDB();res.json(productView(p))}))
app.delete('/api/products/:id',admin,route(async(req,res)=>{db.products=db.products.filter(x=>x.id!==req.params.id);db.cart=db.cart.filter(x=>x.productId!==req.params.id);saveDB();res.status(204).send()}))

app.get('/api/blog',route(async(_req,res)=>res.json((db.blogPosts||db.blog||[]).filter(x=>x.published!==false))))
app.post('/api/blog',auth,route(async(req,res)=>{const b=req.body||{};const p={id:id(),title:String(b.title||''),summary:String(b.summary||''),content:String(b.content||''),author:String(b.author||req.auth.username),authorId:req.auth.sub,date:b.date||new Date().toISOString().slice(0,10),likes:Number(b.likes||0),comments:Array.isArray(b.comments)?b.comments:[],category:String(b.category||''),image:String(b.image||''),published:b.published!==false,createdAt:now()};db.blogPosts.push(p);db.blog=db.blogPosts;saveDB();res.status(201).json(p)}))
app.patch('/api/blog/:id',admin,route(async(req,res)=>{const p=(db.blogPosts||[]).find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:'Post not found'});Object.assign(p,req.body||{});db.blog=db.blogPosts;saveDB();res.json(p)}))
app.delete('/api/blog/:id',admin,route(async(req,res)=>{db.blogPosts=db.blogPosts.filter(x=>x.id!==req.params.id);db.blog=db.blogPosts;saveDB();res.status(204).send()}))

app.get('/api/site-settings',route(async(_req,res)=>res.json(db.siteSettings||{})))
app.patch('/api/site-settings',admin,route(async(req,res)=>{db.siteSettings={...(db.siteSettings||{}),...(req.body||{})};saveDB();res.json(db.siteSettings)}))
app.get('/api/server-stats',route(async(_req,res)=>res.json(db.serverStats||{})))
app.patch('/api/server-stats',admin,route(async(req,res)=>{db.serverStats={...(db.serverStats||{}),...(req.body||{})};saveDB();res.json(db.serverStats)}))

const cartForUser=userId=>db.cart.filter(x=>String(x.userId)===String(userId)).map(x=>{const p=db.products.find(p=>String(p.id)===String(x.productId));return p?{...x,...productView(p),productId:p.id,quantity:Number(x.quantity||1)}:null}).filter(Boolean)
app.get('/api/cart',optionalAuth,route(async(req,res)=>{const userId=req.auth?.sub||String(req.query.userId||'guest');res.json(cartForUser(userId))}))
app.post('/api/cart',optionalAuth,route(async(req,res)=>{const b=req.body||{},userId=req.auth?.sub||String(b.userId||'guest'),productId=String(b.productId||b.id||'');const p=db.products.find(x=>String(x.id)===productId&&x.active!==false);if(!p)return res.status(404).json({error:'Product not found'});const quantity=Math.max(1,Number(b.quantity||1));let item=db.cart.find(x=>String(x.userId)===userId&&String(x.productId)===productId);if(item)item.quantity=Number(item.quantity||0)+quantity;else{item={id:id(),userId,productId,quantity,createdAt:now()};db.cart.push(item)}saveDB();res.status(201).json(cartForUser(userId).find(x=>String(x.productId)===productId))}))
app.patch('/api/cart/:id',optionalAuth,route(async(req,res)=>{const item=db.cart.find(x=>x.id===req.params.id);if(!item)return res.status(404).json({error:'Cart item not found'});if(req.auth&&item.userId!==req.auth.sub)return res.status(403).json({error:'Forbidden'});item.quantity=Math.max(1,Number(req.body.quantity||1));saveDB();res.json(cartForUser(item.userId).find(x=>x.id===item.id))}))
app.delete('/api/cart/:id',optionalAuth,route(async(req,res)=>{const item=db.cart.find(x=>x.id===req.params.id);if(!item)return res.status(404).json({error:'Cart item not found'});if(req.auth&&item.userId!==req.auth.sub)return res.status(403).json({error:'Forbidden'});db.cart=db.cart.filter(x=>x.id!==item.id);saveDB();res.status(204).send()}))

app.get('/api/discounts',admin,route(async(_req,res)=>res.json(db.discounts||[])))
app.post('/api/discounts',admin,route(async(req,res)=>{const b=req.body||{},d={id:id(),code:String(b.code||'').trim().toUpperCase(),description:String(b.description||''),discount:Number(b.discount||0),type:String(b.type||'percent'),maxUses:Number(b.maxUses||0),usedCount:0,active:b.active!==false,expiryDate:b.expiryDate||null,createdAt:now()};db.discounts.push(d);saveDB();res.status(201).json(d)}))
app.patch('/api/discounts/:id',admin,route(async(req,res)=>{const d=db.discounts.find(x=>x.id===req.params.id);if(!d)return res.status(404).json({error:'Discount not found'});Object.assign(d,req.body||{});if(d.code)d.code=String(d.code).toUpperCase();saveDB();res.json(d)}))
app.delete('/api/discounts/:id',admin,route(async(req,res)=>{db.discounts=db.discounts.filter(x=>x.id!==req.params.id);saveDB();res.status(204).send()}))
app.post('/api/discounts/apply',route(async(req,res)=>{const code=String(req.body.code||'').trim().toUpperCase(),d=(db.discounts||[]).find(x=>x.code===code&&x.active!==false&&(!x.expiryDate||x.expiryDate>=new Date().toISOString().slice(0,10))&&(!x.maxUses||x.usedCount<x.maxUses));if(!d)return res.status(404).json({error:'Discount not found or expired'});res.json(d)}))

app.get('/api/orders',admin,route(async(_req,res)=>res.json(db.orders||[])))
app.post('/api/orders',auth,route(async(req,res)=>{const items=Array.isArray(req.body.items)?req.body.items:[];if(!items.length)return res.status(400).json({error:'Order items are required'});const normalized=[];let total=0;for(const item of items){const p=db.products.find(x=>String(x.id)===String(item.productId||item.id)&&x.active!==false);if(!p)return res.status(400).json({error:'Product not found'});const quantity=Math.max(1,Number(item.quantity||1));const price=Number(p.price||0);total+=price*quantity;normalized.push({id:id(),productId:p.id,name:p.name,price,quantity})}const order={id:id(),userId:req.auth.sub,username:req.auth.username,total,status:String(req.body.status||'pending'),paymentMethod:String(req.body.paymentMethod||''),paymentRef:String(req.body.paymentRef||''),customerData:req.body.customerData||{},items:normalized,createdAt:now()};db.orders.push(order);db.orderItems.push(...normalized.map(x=>({...x,orderId:order.id})));saveDB();res.status(201).json(order)}))
app.patch('/api/orders/:id',admin,route(async(req,res)=>{const o=db.orders.find(x=>x.id===req.params.id);if(!o)return res.status(404).json({error:'Order not found'});Object.assign(o,req.body||{});saveDB();res.json(o)}))

app.get('/api/tickets',admin,route(async(_req,res)=>res.json(db.tickets||[])))
app.post('/api/tickets',auth,route(async(req,res)=>{const t={id:id(),userId:req.auth.sub,subject:String(req.body.subject||''),message:String(req.body.message||''),status:'open',priority:String(req.body.priority||'normal'),replies:[],createdAt:now()};db.tickets.push(t);saveDB();res.status(201).json(t)}))
app.patch('/api/tickets/:id',admin,route(async(req,res)=>{const t=db.tickets.find(x=>x.id===req.params.id);if(!t)return res.status(404).json({error:'Ticket not found'});Object.assign(t,req.body||{});saveDB();res.json(t)}))

app.get('/api/notifications',auth,route(async(req,res)=>res.json((db.notifications||[]).filter(x=>!x.targetUserId||x.targetUserId===req.auth.sub))))
app.patch('/api/notifications/:id/read',auth,route(async(req,res)=>{const n=db.notifications.find(x=>x.id===req.params.id);if(!n)return res.status(404).json({error:'Notification not found'});n.read=true;n.isRead=true;saveDB();res.json(n)}))
app.get('/api/transactions',auth,route(async(req,res)=>res.json((db.transactions||[]).filter(x=>x.userId===req.auth.sub))))
app.post('/api/pay-with-wallet',auth,route(async(req,res)=>{const amount=Math.max(0,Number(req.body.amount||0));const u=db.users.find(x=>x.id===req.auth.sub);if(!amount)return res.status(400).json({error:'Amount must be positive'});if(!u||Number(u.wallet||0)<amount)return res.status(400).json({error:'Insufficient wallet balance'});u.wallet=Number(u.wallet)-amount;const tx={id:id(),userId:u.id,amount,type:'wallet_payment',status:'completed',referenceCode:String(req.body.reference||''),createdAt:now()};db.transactions.push(tx);saveDB();res.json({success:true,transactionId:tx.id,amount,balance:u.wallet})}))

app.get('/api/admin/overview',admin,route(async(_req,res)=>{const orders=db.orders||[];res.json({users:db.users.length,products:db.products.length,posts:(db.blogPosts||[]).length,orders:orders.length,openTickets:(db.tickets||[]).filter(x=>['open','pending'].includes(x.status)).length,revenue:orders.filter(x=>['paid','completed','success'].includes(x.status)).reduce((s,x)=>s+Number(x.total||0),0),serverStats:db.serverStats||{}})}))
app.get('/api/admin/data/:table',admin,route(async(req,res)=>{const map={users:'users',products:'products',blog:'blogPosts',orders:'orders',tickets:'tickets',discounts:'discounts',transactions:'transactions',notifications:'notifications',cart:'cart'};const key=map[req.params.table];if(!key)return res.status(400).json({error:'Table is not allowed'});res.json(db[key]||[])}))
app.post('/api/create-bale-invoice',auth,route(async(req,res)=>{const url=String(process.env.BALE_PAYMENT_URL||'').trim();if(!url)return res.status(503).json({error:'Bale payment is not configured'});res.json({success:true,paymentUrl:url,amount:Number(req.body.amount||0)})}))
app.post('/api/bale-callback',route(async(_req,res)=>res.json({ok:true,received:true})))

app.use((req,res)=>res.status(404).json({error:'Route not found',path:req.path,prefix:PREFIX}))
app.use((err,_req,res,_next)=>{console.error(err);res.status(Number(err.status)||500).json({error:process.env.NODE_ENV==='production'?'Internal server error':err.message||'Internal server error'})})

const server=app.listen(PORT,()=>console.log(`BinerCraft JSON backend listening on ${PORT} (${PREFIX})`))
server.on('error',e=>{console.error('BinerCraft server error:',e);process.exit(1)})
