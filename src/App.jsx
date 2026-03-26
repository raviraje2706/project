import { useState, useEffect, useRef, useCallback } from "react";

// ─── DB SEED (mirrors db.json on disk) ───────────────────────────────────────
// This is the initial seed. On first load it is written into localStorage under
// the key "luxe_db". All subsequent reads/writes use localStorage so that
// registered users persist across sessions — exactly like json-server would
// persist changes to db.json.
const DB_SEED = {
  products: [
    { id:1,  name:"AirPods Pro Max",       category:"Electronics", price:549, originalPrice:749, discount:27, rating:4.8, reviews:2341, image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", isOffer:true,  stock:15 },
    { id:2,  name:"Minimal Sneakers",       category:"Footwear",    price:129, originalPrice:199, discount:35, rating:4.6, reviews:876,  image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", isOffer:true,  stock:42 },
    { id:3,  name:"Leather Tote Bag",       category:"Accessories", price:89,  originalPrice:150, discount:41, rating:4.7, reviews:543,  image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", isOffer:true,  stock:8  },
    { id:4,  name:"Smart Watch Pro",        category:"Electronics", price:299, originalPrice:399, discount:25, rating:4.5, reviews:1203, image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", isOffer:true,  stock:20 },
    { id:5,  name:"Linen Summer Dress",     category:"Clothing",    price:65,  originalPrice:110, discount:41, rating:4.4, reviews:329,  image:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", isOffer:false, stock:35 },
    { id:6,  name:"Ceramic Coffee Set",     category:"Home",        price:48,  originalPrice:75,  discount:36, rating:4.9, reviews:712,  image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", isOffer:true,  stock:12 },
    { id:7,  name:"Running Shoes Elite",    category:"Footwear",    price:159, originalPrice:220, discount:28, rating:4.7, reviews:994,  image:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80", isOffer:false, stock:50 },
    { id:8,  name:"Wireless Keyboard",      category:"Electronics", price:79,  originalPrice:120, discount:34, rating:4.3, reviews:445,  image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80", isOffer:false, stock:30 },
    { id:9,  name:"Silk Scarf",             category:"Accessories", price:45,  originalPrice:80,  discount:44, rating:4.6, reviews:231,  image:"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80", isOffer:true,  stock:25 },
    { id:10, name:"Indoor Plant Set",       category:"Home",        price:35,  originalPrice:55,  discount:36, rating:4.8, reviews:876,  image:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80", isOffer:false, stock:60 },
    { id:11, name:"Denim Jacket",           category:"Clothing",    price:95,  originalPrice:140, discount:32, rating:4.5, reviews:567,  image:"https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&q=80", isOffer:false, stock:22 },
    { id:12, name:"Noise Cancelling Buds",  category:"Electronics", price:199, originalPrice:279, discount:29, rating:4.6, reviews:1567, image:"https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80", isOffer:true,  stock:18 },
    { id:13, name:"Canvas Backpack",        category:"Accessories", price:55,  originalPrice:90,  discount:39, rating:4.4, reviews:389,  image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", isOffer:false, stock:45 },
    { id:14, name:"Yoga Mat Premium",       category:"Sports",      price:42,  originalPrice:70,  discount:40, rating:4.7, reviews:654,  image:"https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80", isOffer:true,  stock:38 },
    { id:15, name:"Perfume Collection",     category:"Beauty",      price:88,  originalPrice:130, discount:32, rating:4.8, reviews:891,  image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80", isOffer:false, stock:14 },
    { id:16, name:"Mechanical Keyboard",    category:"Electronics", price:149, originalPrice:199, discount:25, rating:4.5, reviews:723,  image:"https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400&q=80", isOffer:false, stock:28 },
  ],
  categories: [
    { id:1, name:"Electronics", icon:"💻", color:"#6366f1" },
    { id:2, name:"Clothing",    icon:"👗", color:"#ec4899" },
    { id:3, name:"Footwear",    icon:"👟", color:"#f59e0b" },
    { id:4, name:"Accessories", icon:"👜", color:"#10b981" },
    { id:5, name:"Home",        icon:"🏠", color:"#8b5cf6" },
    { id:6, name:"Sports",      icon:"⚽", color:"#ef4444" },
    { id:7, name:"Beauty",      icon:"💄", color:"#f97316" },
  ],
  users: [
    { id:1, name:"Demo User", email:"demo@shop.com", password:"demo123", avatar:"DU", joined:"Jan 2024", orders:12 }
  ]
};

// ─── localStorage ↔ db.json bridge ───────────────────────────────────────────
// Simulates json-server: reads/writes the full DB as one JSON blob in
// localStorage["luxe_db"], keeping it in sync just like db.json on disk.
const DB_KEY = "luxe_db";

function readDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // First run — seed the store exactly as db.json would be seeded
  localStorage.setItem(DB_KEY, JSON.stringify(DB_SEED));
  return DB_SEED;
}

function writeDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Convenience: add a user record (POST /users)
function dbRegisterUser(newUser) {
  const db = readDB();
  // guard: reject if email already exists
  if (db.users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    return { ok: false, error: "Email already registered. Please sign in." };
  }
  const record = { ...newUser, id: Date.now() };
  db.users = [...db.users, record];
  writeDB(db);
  return { ok: true, user: record };
}

// Convenience: find a user by credentials (GET /users?email=&password=)
function dbLoginUser(email, password) {
  const db = readDB();
  const user = db.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: "Invalid email or password." };
  return { ok: true, user };
}

// Expose products & categories (they never change at runtime)
const DB = readDB();

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --bg2: #12121a;
    --bg3: #1a1a26;
    --card: #16161f;
    --border: rgba(255,255,255,0.07);
    --accent: #ff3c5f;
    --accent2: #ff7d54;
    --gold: #ffd166;
    --text: #f0f0f5;
    --muted: #8888aa;
    --green: #06d6a0;
    --r: 16px;
    --shadow: 0 8px 32px rgba(0,0,0,0.5);
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; }

  /* Animations */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
  @keyframes slideRight { from { transform:translateX(-100%); } to { transform:translateX(0); } }
  @keyframes popBounce { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes marquee  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes floatUp  { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-80px) scale(0.5)} }
  @keyframes cartWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(255,60,95,0.3)} 50%{box-shadow:0 0 40px rgba(255,60,95,0.7)} }

  .fade-up   { animation: fadeUp 0.5s ease forwards; }
  .fade-in   { animation: fadeIn 0.3s ease forwards; }
  .scale-in  { animation: scaleIn 0.3s ease forwards; }
  .pop       { animation: popBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* Nav */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    transition: all 0.3s;
  }
  .nav-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; cursor:pointer; }
  .nav-links { display:flex; align-items:center; gap:4px; }
  .nav-link {
    padding: 8px 14px; border-radius: 8px; cursor: pointer;
    font-size: 0.875rem; font-weight: 500; color: var(--muted);
    transition: all 0.2s; border: none; background: transparent;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-link:hover { color: var(--text); background: var(--bg3); }
  .nav-link.active { color: var(--accent); background: rgba(255,60,95,0.1); }
  .nav-actions { display:flex; align-items:center; gap:12px; }
  .cart-btn {
    position:relative; background:var(--bg3); border:1px solid var(--border);
    color:var(--text); padding:8px 16px; border-radius:10px; cursor:pointer;
    display:flex; align-items:center; gap:6px; font-size:0.875rem;
    transition:all 0.2s; font-family:'DM Sans',sans-serif;
  }
  .cart-btn:hover { border-color:var(--accent); color:var(--accent); }
  .cart-btn.wiggle { animation: cartWiggle 0.4s ease; }
  .cart-badge {
    position:absolute; top:-6px; right:-6px;
    background:var(--accent); color:#fff; border-radius:50%;
    width:18px; height:18px; font-size:0.7rem; font-weight:700;
    display:flex; align-items:center; justify-content:center;
    animation: popBounce 0.3s ease;
  }
  .login-btn {
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    color:#fff; border:none; padding:8px 20px; border-radius:10px;
    cursor:pointer; font-weight:600; font-size:0.875rem;
    transition:all 0.2s; font-family:'DM Sans',sans-serif;
    box-shadow:0 4px 15px rgba(255,60,95,0.3);
  }
  .login-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(255,60,95,0.45); }
  .avatar-btn {
    width:36px; height:36px; border-radius:50%;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    border:none; color:#fff; font-weight:700; font-size:0.875rem;
    cursor:pointer; transition:all 0.2s;
    display:flex; align-items:center; justify-content:center;
  }
  .avatar-btn:hover { transform:scale(1.1); box-shadow:0 4px 15px rgba(255,60,95,0.4); }

  /* Banner */
  .marquee-wrap { background:linear-gradient(90deg,var(--accent),var(--accent2)); padding:6px 0; overflow:hidden; }
  .marquee { display:flex; gap:40px; animation:marquee 20s linear infinite; white-space:nowrap; }
  .marquee-item { font-size:0.78rem; font-weight:600; color:#fff; letter-spacing:0.05em; }

  /* Hero */
  .hero {
    min-height: 100vh; padding: 120px 24px 80px;
    background: radial-gradient(ellipse at 20% 50%, rgba(255,60,95,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(255,125,84,0.08) 0%, transparent 50%),
                var(--bg);
    display: flex; align-items: center; justify-content: center;
  }
  .hero-inner { max-width:1200px; width:100%; display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
  .hero-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(255,60,95,0.1); border:1px solid rgba(255,60,95,0.3); color:var(--accent); padding:6px 14px; border-radius:999px; font-size:0.78rem; font-weight:600; margin-bottom:20px; }
  .hero-title { font-size:clamp(2.5rem,5vw,4rem); line-height:1.1; font-weight:800; color:var(--text);margin-bottom:20px; }
  .hero-title span { background:linear-gradient(135deg,var(--accent),var(--accent2),var(--gold)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .hero-sub { color:var(--muted); font-size:1.1rem; line-height:1.7; margin-bottom:36px; }
  .hero-btns { display:flex; gap:14px; flex-wrap:wrap; }
  .btn-primary {
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    color:#fff; border:none; padding:14px 32px; border-radius:12px;
    cursor:pointer; font-weight:600; font-size:1rem; font-family:'DM Sans',sans-serif;
    transition:all 0.2s; box-shadow:0 6px 20px rgba(255,60,95,0.35);
    animation: glow 3s ease infinite;
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(255,60,95,0.5); }
  .btn-outline {
    background:transparent; color:var(--text); border:1px solid var(--border);
    padding:14px 32px; border-radius:12px; cursor:pointer; font-weight:600;
    font-size:1rem; font-family:'DM Sans',sans-serif; transition:all 0.2s;
  }
  .btn-outline:hover { border-color:var(--accent); color:var(--accent); background:rgba(255,60,95,0.05); }
  .hero-stats { display:flex; gap:32px; margin-top:40px; }
  .stat { }
  .stat-num { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .stat-label { color:var(--muted); font-size:0.8rem; }
  .hero-visual { position:relative; }
  .hero-card-float {
    background:var(--card); border:1px solid var(--border); border-radius:20px;
    padding:20px; display:flex; flex-direction:column; gap:12px;
    box-shadow:var(--shadow); animation:fadeUp 0.8s ease 0.3s both;
  }
  .hero-img { width:100%; height:220px; object-fit:cover; border-radius:12px; }
  .hero-card-info { display:flex; justify-content:space-between; align-items:center; }
  .hero-mini-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px; }
  .mini-card {
    background:var(--bg3); border-radius:12px; padding:12px;
    border:1px solid var(--border); animation:fadeUp 0.6s ease both;
  }
  .mini-card:nth-child(1){animation-delay:0.4s} .mini-card:nth-child(2){animation-delay:0.5s}

  /* Section */
  .section { max-width:1200px; margin:0 auto; padding:60px 24px; }
  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:36px; }
  .section-title { font-size:1.8rem; font-weight:800; }
  .section-title span { color:var(--accent); }
  .see-all { color:var(--accent); background:transparent; border:none; cursor:pointer; font-size:0.9rem; font-weight:600; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .see-all:hover { text-decoration:underline; }

  /* Filters */
  .filter-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:28px; align-items:center; }
  .filter-chip {
    padding:8px 16px; border-radius:999px; font-size:0.82rem; font-weight:500;
    border:1px solid var(--border); background:var(--bg3); color:var(--muted);
    cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif;
  }
  .filter-chip:hover { border-color:var(--accent); color:var(--accent); }
  .filter-chip.active { background:var(--accent); border-color:var(--accent); color:#fff; }
  .sort-select {
    margin-left:auto; background:var(--bg3); border:1px solid var(--border);
    color:var(--text); padding:8px 14px; border-radius:10px; font-size:0.82rem;
    cursor:pointer; font-family:'DM Sans',sans-serif; outline:none;
  }
  .sort-select:focus { border-color:var(--accent); }

  /* Product Grid */
  .product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:20px; }

  /* Product Card */
  .product-card {
    background:var(--card); border:1px solid var(--border); border-radius:var(--r);
    overflow:hidden; transition:all 0.3s; cursor:pointer;
    animation: fadeUp 0.4s ease both;
  }
  .product-card:hover { transform:translateY(-4px); border-color:rgba(255,60,95,0.3); box-shadow:0 16px 48px rgba(0,0,0,0.4); }
  .product-img-wrap { position:relative; overflow:hidden; }
  .product-img { width:100%; height:200px; object-fit:cover; transition:transform 0.5s; }
  .product-card:hover .product-img { transform:scale(1.06); }
  .discount-badge {
    position:absolute; top:10px; left:10px;
    background:var(--accent); color:#fff; padding:3px 8px; border-radius:6px;
    font-size:0.72rem; font-weight:700;
  }
  .wish-btn {
    position:absolute; top:10px; right:10px;
    background:rgba(10,10,15,0.7); border:none; border-radius:50%;
    width:32px; height:32px; cursor:pointer; display:flex; align-items:center;
    justify-content:center; font-size:1rem; transition:all 0.2s;
    backdrop-filter:blur(8px);
  }
  .wish-btn:hover { transform:scale(1.1); background:rgba(255,60,95,0.2); }
  .product-body { padding:14px; }
  .product-cat { font-size:0.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; }
  .product-name { font-weight:600; font-size:0.95rem; margin-bottom:8px; line-height:1.4; }
  .product-rating { display:flex; align-items:center; gap:4px; font-size:0.78rem; color:var(--gold); margin-bottom:10px; }
  .product-rating span { color:var(--muted); }
  .product-price { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .price-now { font-family:'Syne',sans-serif; font-weight:700; font-size:1.15rem; color:var(--text); }
  .price-old { font-size:0.82rem; color:var(--muted); text-decoration:line-through; }
  .card-actions { display:flex; flex-direction:column; gap:8px; }
  .btn-cart {
    width:100%; padding:10px; border-radius:10px; font-size:0.85rem; font-weight:600;
    border:1px solid var(--border); background:var(--bg3); color:var(--text);
    cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .btn-cart:hover { border-color:var(--accent); color:var(--accent); background:rgba(255,60,95,0.08); }
  .btn-buy {
    width:100%; padding:10px; border-radius:10px; font-size:0.85rem; font-weight:600;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    color:#fff; border:none; cursor:pointer; transition:all 0.2s;
    font-family:'DM Sans',sans-serif;
  }
  .btn-buy:hover { opacity:0.9; transform:translateY(-1px); }
  .btn-cart.added { border-color:var(--green); color:var(--green); background:rgba(6,214,160,0.08); }

  /* Float particle */
  .float-particle {
    position:fixed; pointer-events:none; z-index:9999;
    font-size:1.2rem; animation:floatUp 0.8s ease forwards;
  }

  /* Modal overlay */
  .overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.7);
    backdrop-filter:blur(8px); z-index:200;
    display:flex; align-items:center; justify-content:center;
    animation:fadeIn 0.2s ease;
  }

  /* Auth Modal */
  .auth-modal {
    background:var(--bg2); border:1px solid var(--border); border-radius:24px;
    padding:40px; width:min(460px,90vw); position:relative;
    animation:scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .modal-close {
    position:absolute; top:16px; right:16px; background:var(--bg3);
    border:1px solid var(--border); border-radius:8px; width:32px; height:32px;
    cursor:pointer; color:var(--muted); font-size:1rem; display:flex;
    align-items:center; justify-content:center; transition:all 0.2s;
  }
  .modal-close:hover { color:var(--text); border-color:var(--accent); }
  .auth-tabs { display:flex; gap:0; margin-bottom:28px; border-radius:10px; background:var(--bg3); padding:4px; }
  .auth-tab {
    flex:1; padding:10px; border-radius:8px; background:transparent;
    border:none; color:var(--muted); font-weight:600; cursor:pointer;
    transition:all 0.2s; font-family:'DM Sans',sans-serif; font-size:0.9rem;
  }
  .auth-tab.active { background:var(--card); color:var(--text); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
  .input-group { margin-bottom:16px; }
  .input-label { display:block; font-size:0.82rem; color:var(--muted); margin-bottom:6px; font-weight:500; }
  .input-field {
    width:100%; background:var(--bg3); border:1px solid var(--border); border-radius:10px;
    color:var(--text); padding:12px 14px; font-size:0.9rem; font-family:'DM Sans',sans-serif;
    outline:none; transition:all 0.2s;
  }
  .input-field:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(255,60,95,0.1); }
  .auth-hint { font-size:0.78rem; color:var(--muted); margin-top:12px; text-align:center; }
  .auth-hint span { color:var(--accent); cursor:pointer; }
  .auth-error { background:rgba(255,60,95,0.1); border:1px solid rgba(255,60,95,0.3); border-radius:8px; padding:10px 14px; font-size:0.82rem; color:var(--accent); margin-bottom:14px; }

  /* Cart Drawer */
  .cart-drawer {
    position:fixed; top:0; right:0; bottom:0; width:min(420px,100vw);
    background:var(--bg2); border-left:1px solid var(--border);
    z-index:300; display:flex; flex-direction:column;
    animation:slideRight 0.3s ease reverse; /* from right */
    box-shadow:-20px 0 60px rgba(0,0,0,0.5);
  }
  .cart-drawer-enter { animation:none; transform:translateX(0); }
  .cart-header { padding:20px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
  .cart-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1.2rem; }
  .cart-body { flex:1; overflow-y:auto; padding:16px 24px; }
  .cart-item { display:flex; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); animation:fadeUp 0.3s ease; }
  .cart-item-img { width:72px; height:72px; border-radius:10px; object-fit:cover; flex-shrink:0; }
  .cart-item-info { flex:1; min-width:0; }
  .cart-item-name { font-weight:600; font-size:0.9rem; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cart-item-price { color:var(--accent); font-weight:700; font-size:0.95rem; }
  .qty-ctrl { display:flex; align-items:center; gap:8px; margin-top:8px; }
  .qty-btn { background:var(--bg3); border:1px solid var(--border); color:var(--text); width:26px; height:26px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.9rem; transition:all 0.2s; }
  .qty-btn:hover { border-color:var(--accent); color:var(--accent); }
  .qty-val { font-weight:600; font-size:0.9rem; min-width:20px; text-align:center; }
  .remove-btn { background:none; border:none; color:var(--muted); cursor:pointer; padding:4px; transition:all 0.2s; font-size:1rem; }
  .remove-btn:hover { color:var(--accent); }
  .cart-footer { padding:20px 24px; border-top:1px solid var(--border); }
  .cart-total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .cart-total-label { color:var(--muted); font-size:0.9rem; }
  .cart-total-val { font-family:'Syne',sans-serif; font-weight:700; font-size:1.4rem; color:var(--text); }
  .cart-sub { color:var(--muted); font-size:0.78rem; margin-bottom:16px; }
  .btn-order {
    width:100%; padding:14px; border-radius:12px; background:linear-gradient(135deg,var(--accent),var(--accent2));
    color:#fff; border:none; font-size:1rem; font-weight:700; cursor:pointer;
    transition:all 0.2s; font-family:'DM Sans',sans-serif;
    box-shadow:0 6px 20px rgba(255,60,95,0.35);
  }
  .btn-order:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(255,60,95,0.5); }
  .empty-cart { text-align:center; padding:60px 0; }
  .empty-icon { font-size:3rem; margin-bottom:16px; opacity:0.3; }
  .empty-text { color:var(--muted); font-size:0.95rem; }

  /* Order Success */
  .order-success {
    text-align:center; padding:40px;
    animation:popBounce 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }
  .success-icon { font-size:3.5rem; margin-bottom:16px; }
  .success-title { font-size:1.5rem; font-weight:800; margin-bottom:8px; color:var(--green); }

  /* Categories Page */
  .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:16px; margin-bottom:40px; }
  .cat-card {
    background:var(--card); border:1px solid var(--border); border-radius:16px;
    padding:24px 16px; text-align:center; cursor:pointer; transition:all 0.3s;
    animation:fadeUp 0.4s ease both;
  }
  .cat-card:hover { transform:translateY(-4px); }
  .cat-card.selected { border-width:2px; }
  .cat-icon { font-size:2.5rem; margin-bottom:10px; display:block; }
  .cat-name { font-weight:600; font-size:0.9rem; margin-bottom:4px; }
  .cat-count { font-size:0.75rem; color:var(--muted); }

  /* Offers */
  .offers-hero {
    background:linear-gradient(135deg,rgba(255,60,95,0.15),rgba(255,125,84,0.1));
    border:1px solid rgba(255,60,95,0.2); border-radius:24px;
    padding:40px; margin-bottom:40px; display:flex; align-items:center; justify-content:space-between;
    animation:fadeUp 0.5s ease;
  }
  .offers-title { font-size:2.2rem; font-weight:800; }
  .offers-sub { color:var(--muted); margin-top:8px; }
  .offer-badge { background:var(--accent); color:#fff; padding:8px 20px; border-radius:999px; font-weight:700; font-size:1.1rem; }

  /* Profile */
  .profile-card {
    background:var(--card); border:1px solid var(--border); border-radius:24px;
    padding:40px; max-width:600px; margin:0 auto;
    animation:scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .profile-avatar {
    width:80px; height:80px; border-radius:50%;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    display:flex; align-items:center; justify-content:center;
    font-size:1.8rem; font-weight:700; color:#fff; margin:0 auto 20px;
    box-shadow:0 8px 24px rgba(255,60,95,0.4);
  }
  .profile-name { text-align:center; font-size:1.4rem; font-weight:800; margin-bottom:4px; }
  .profile-email { text-align:center; color:var(--muted); margin-bottom:28px; }
  .profile-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:28px; }
  .p-stat { background:var(--bg3); border-radius:12px; padding:16px; text-align:center; }
  .p-stat-num { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:700; color:var(--accent); }
  .p-stat-label { font-size:0.75rem; color:var(--muted); margin-top:4px; }
  .logout-btn {
    width:100%; padding:12px; border-radius:10px; background:var(--bg3);
    border:1px solid var(--border); color:var(--muted); cursor:pointer;
    font-size:0.9rem; font-weight:600; transition:all 0.2s; font-family:'DM Sans',sans-serif;
  }
  .logout-btn:hover { border-color:var(--accent); color:var(--accent); }

  /* About */
  .about-section { text-align:center; padding:80px 24px; max-width:800px; margin:0 auto; }
  .about-logo { font-family:'Syne',sans-serif; font-size:3rem; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:16px; }
  .about-para { color:var(--muted); font-size:1.05rem; line-height:1.8; margin-bottom:20px; }
  .about-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:48px; }
  .about-feat { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:28px; animation:fadeUp 0.4s ease both; }
  .about-feat-icon { font-size:2rem; margin-bottom:12px; }
  .about-feat-title { font-weight:700; font-size:1rem; margin-bottom:8px; }
  .about-feat-desc { color:var(--muted); font-size:0.85rem; line-height:1.6; }

  /* Help */
  .faq-list { max-width:700px; margin:0 auto; }
  .faq-item { background:var(--card); border:1px solid var(--border); border-radius:12px; margin-bottom:12px; overflow:hidden; animation:fadeUp 0.3s ease both; }
  .faq-q { padding:18px 20px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; font-weight:600; transition:background 0.2s; }
  .faq-q:hover { background:var(--bg3); }
  .faq-a { padding:0 20px 18px; color:var(--muted); font-size:0.9rem; line-height:1.7; }
  .faq-arrow { transition:transform 0.3s; font-size:0.8rem; color:var(--muted); }
  .faq-arrow.open { transform:rotate(180deg); }

  /* Loading */
  .loading-dots { display:flex; gap:6px; justify-content:center; padding:40px; }
  .loading-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); animation:pulse 1s ease infinite; }
  .loading-dot:nth-child(2){animation-delay:0.2s} .loading-dot:nth-child(3){animation-delay:0.4s}

  /* Toast */
  .toast {
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:var(--card); border:1px solid var(--border); border-radius:12px;
    padding:14px 20px; display:flex; align-items:center; gap:10px;
    box-shadow:var(--shadow); animation:popBounce 0.4s ease;
    font-size:0.9rem; font-weight:500;
  }
  .toast.success { border-color:var(--green); }
  .toast.error   { border-color:var(--accent); }

  @media(max-width:768px){
    .hero-inner { grid-template-columns:1fr; }
    .hero-visual { display:none; }
    .about-grid { grid-template-columns:1fr; }
    .nav-links { display:none; }
    .profile-stats { grid-template-columns:1fr 1fr; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ color: i < full ? "#ffd166" : i === full && half ? "#ffd166" : "#333", fontSize: "0.85em" }}>
          {i < full ? "★" : i === full && half ? "⯨" : "☆"}
        </span>
      ))}
    </span>
  );
};

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onBuyNow, cartItems, delay = 0 }) {
  const [wishlist, setWishlist] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const inCart = cartItems.some(c => c.id === product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product, e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="product-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        {product.discount > 0 && (
          <div className="discount-badge">-{product.discount}%</div>
        )}
        <button className="wish-btn" onClick={e => { e.stopPropagation(); setWishlist(!wishlist); }}>
          {wishlist ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="product-body">
        <div className="product-cat">{product.category}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-rating">
          <Stars rating={product.rating} />
          <span>({product.reviews.toLocaleString()})</span>
        </div>
        <div className="product-price">
          <span className="price-now">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="price-old">${product.originalPrice}</span>
          )}
        </div>
        <div className="card-actions">
          <button
            className={`btn-cart ${justAdded || inCart ? "added" : ""}`}
            onClick={handleAddToCart}
          >
            {justAdded ? "✓ Added!" : inCart ? "✓ In Cart" : "🛒 Add to Cart"}
          </button>
          <button className="btn-buy" onClick={e => { e.stopPropagation(); onBuyNow(product, e); }}>
            ⚡ Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
// Register  → writes new user to localStorage["luxe_db"].users  (like POST /users in json-server)
// Login     → reads & verifies from localStorage["luxe_db"].users (like GET /users?email=&password=)
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab]   = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const switchTab = (t) => { setTab(t); setError(""); setSuccess(""); setForm({ name:"", email:"", password:"", confirmPassword:"" }); };

  const validate = () => {
    if (!form.email.trim())    return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
    if (!form.password)        return "Password is required.";
    if (tab === "register") {
      if (!form.name.trim())   return "Full name is required.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");

    // Simulate async (like a fetch to json-server)
    setTimeout(() => {
      setLoading(false);
      if (tab === "login") {
        // READ from db (localStorage["luxe_db"].users)
        const result = dbLoginUser(form.email, form.password);
        if (result.ok) {
          setSuccess(`Welcome back, ${result.user.name}! 🎉`);
          setTimeout(() => { onLogin(result.user); onClose(); }, 800);
        } else {
          setError(result.error);
        }
      } else {
        // WRITE new user to db (localStorage["luxe_db"].users)
        const newUser = {
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
          avatar:   form.name.trim().slice(0, 2).toUpperCase(),
          joined:   new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          orders:   0,
        };
        const result = dbRegisterUser(newUser);
        if (result.ok) {
          setSuccess(`Account created! Welcome, ${result.user.name} 🎊`);
          setTimeout(() => { onLogin(result.user); onClose(); }, 900);
        } else {
          setError(result.error);
        }
      }
    }, 500);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:"1.5rem", marginBottom:6 }}>
            {tab === "login" ? "Welcome back 👋" : "Create account ✨"}
          </div>
          <div style={{ color:"var(--muted)", fontSize:"0.88rem" }}>
            {tab === "login"
              ? "Sign in to continue shopping"
              : "Register to save your cart & orders"}
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==="login"    ? "active":""}`} onClick={() => switchTab("login")}>Sign In</button>
          <button className={`auth-tab ${tab==="register" ? "active":""}`} onClick={() => switchTab("register")}>Register</button>
        </div>

        {/* Feedback */}
        {error   && <div className="auth-error">⚠ {error}</div>}
        {success && (
          <div style={{ background:"rgba(6,214,160,0.1)", border:"1px solid rgba(6,214,160,0.3)", borderRadius:8, padding:"10px 14px", fontSize:"0.82rem", color:"var(--green)", marginBottom:14 }}>
            ✓ {success}
          </div>
        )}

        {/* Fields */}
        {tab === "register" && (
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input-field" placeholder="John Doe" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input className="input-field" type="email" placeholder="you@email.com" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <div style={{ position:"relative" }}>
            <input className="input-field" type={showPwd ? "text":"password"}
              placeholder={tab==="register" ? "Min. 6 characters" : "••••••••"}
              value={form.password} style={{ paddingRight:44 }}
              onChange={e => setForm({...form, password: e.target.value})}
              onKeyDown={e => e.key==="Enter" && handleSubmit()} />
            <button onClick={() => setShowPwd(!showPwd)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:"1rem" }}>
              {showPwd ? "🙈" : "👁"}
            </button>
          </div>
          {tab === "register" && form.password && (
            <div style={{ marginTop:6, display:"flex", gap:4 }}>
              {["Weak","Fair","Strong"].map((lbl, i) => (
                <div key={i} style={{ flex:1, height:3, borderRadius:2,
                  background: form.password.length >= (i+1)*3 ? ["#ef4444","#f59e0b","#06d6a0"][i] : "var(--border)" }} />
              ))}
              <span style={{ fontSize:"0.7rem", color:"var(--muted)", marginLeft:6, alignSelf:"center" }}>
                {form.password.length < 3 ? "Weak" : form.password.length < 6 ? "Fair" : "Strong"}
              </span>
            </div>
          )}
        </div>

        {tab === "register" && (
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input className="input-field" type={showPwd ? "text":"password"} placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={e => setForm({...form, confirmPassword: e.target.value})}
              onKeyDown={e => e.key==="Enter" && handleSubmit()}
              style={{ borderColor: form.confirmPassword && form.confirmPassword !== form.password ? "#ef4444" : undefined }} />
            {form.confirmPassword && form.confirmPassword !== form.password && (
              <div style={{ fontSize:"0.75rem", color:"#ef4444", marginTop:4 }}>Passwords do not match</div>
            )}
          </div>
        )}

        <button className="btn-primary" style={{ width:"100%", marginTop:8, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={loading}>
          {loading
            ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                {tab==="login" ? "Signing in…" : "Creating account…"}
              </span>
            : tab === "login" ? "Sign In →" : "Create Account →"
          }
        </button>

        <div className="auth-hint">
          {tab === "login" ? "No account? " : "Already registered? "}
          <span onClick={() => switchTab(tab==="login" ? "register" : "login")}>
            {tab === "login" ? "Register for free" : "Sign in instead"}
          </span>
        </div>

        {tab === "login" && (
          <div style={{ marginTop:14, padding:"12px 14px", background:"var(--bg3)", borderRadius:10, fontSize:"0.78rem", color:"var(--muted)" }}>
            <strong style={{ color:"var(--text)" }}>Demo credentials:</strong><br />
            📧 demo@shop.com &nbsp;|&nbsp; 🔑 demo123
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onUpdate, onRemove, user, onOpenAuth, onOrderPlaced }) {
  const [ordered, setOrdered] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleOrder = () => {
    if (!user) { onClose(); onOpenAuth(); return; }
    setOrdered(true);
    setTimeout(() => { onOrderPlaced(); setOrdered(false); onClose(); }, 2500);
  };

  return (
    <div className="overlay" style={{ justifyContent: "flex-end" }} onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <div>
            <div className="cart-title">🛒 Your Cart</div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
          </div>
          <button className="modal-close" style={{ position: "static" }} onClick={onClose}>✕</button>
        </div>

        <div className="cart-body">
          {ordered ? (
            <div className="order-success">
              <div className="success-icon">🎉</div>
              <div className="success-title">Order Placed!</div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Your items will arrive soon</div>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <div className="empty-text">Your cart is empty</div>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 8 }}>Add some products to get started</div>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => onUpdate(item.id, -1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => onUpdate(item.id, 1)}>+</button>
                    <button className="remove-btn" onClick={() => onRemove(item.id)} style={{ marginLeft: "auto" }}>🗑</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && !ordered && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-val">${total.toFixed(2)}</span>
            </div>
            <div className="cart-sub">Free shipping on orders over $50 ✓</div>
            <button className="btn-order" onClick={handleOrder}>
              {user ? `Place Order — $${total.toFixed(2)}` : "Login to Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast ${type}`}>
      <span>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ products, onAddToCart, onBuyNow, cart }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const cats = ["All", ...new Set(products.map(p => p.category))];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  let shown = filter === "All" ? products : products.filter(p => p.category === filter);
  if (sort === "price-asc")  shown = [...shown].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") shown = [...shown].sort((a, b) => b.price - a.price);
  if (sort === "rating")     shown = [...shown].sort((a, b) => b.rating - a.rating);
  if (sort === "discount")   shown = [...shown].sort((a, b) => b.discount - a.discount);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div style={{ animation: "fadeUp 0.6s ease" }}>
            <div className="hero-tag">🔥 Limited Time Offers</div>
            <h1 className="hero-title">Shop the <span>Future</span><br />of Retail</h1>
            <p className="hero-sub">Discover curated products with unbeatable deals. Premium quality, delivered fast.</p>
            <div className="hero-btns">
              <button className="btn-primary">Shop Now →</button>
              <button className="btn-outline">View Offers</button>
            </div>
            <div className="hero-stats">
              <div className="stat"><div className="stat-num">16+</div><div className="stat-label">Products</div></div>
              <div className="stat"><div className="stat-num">7</div><div className="stat-label">Categories</div></div>
              <div className="stat"><div className="stat-num">99%</div><div className="stat-label">Happy Customers</div></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-float">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" alt="hero" className="hero-img" />
              <div className="hero-card-info">
                <div>
                  <div style={{ fontWeight: 700 }}>Smart Watch Pro</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Electronics</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--accent)" }}>$299</div>
                  <div style={{ color: "var(--green)", fontSize: "0.75rem" }}>25% OFF</div>
                </div>
              </div>
            </div>
            <div className="hero-mini-cards">
              {[{ icon:"🚚", label:"Free Delivery" }, { icon:"🔄", label:"Easy Returns" }].map((f, i) => (
                <div className="mini-card" key={i}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">All <span>Products</span></h2>
        </div>
        <div className="filter-bar">
          {cats.map(c => (
            <button key={c} className={`filter-chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Best Discount</option>
          </select>
        </div>
        {loading ? (
          <div className="loading-dots">
            <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
          </div>
        ) : (
          <div className="product-grid">
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onBuyNow={onBuyNow} cartItems={cart} delay={i * 50} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── OFFERS PAGE ──────────────────────────────────────────────────────────────
function OffersPage({ products, onAddToCart, onBuyNow, cart }) {
  const offers = products.filter(p => p.isOffer).sort((a, b) => b.discount - a.discount);
  return (
    <div className="section" style={{ paddingTop: 100 }}>
      <div className="offers-hero">
        <div>
          <div className="offers-title">🔥 Top Offers</div>
          <div className="offers-sub">Handpicked deals just for you — up to 44% off</div>
        </div>
        <div className="offer-badge">UP TO 44% OFF</div>
      </div>
      <div className="section-header">
        <h2 className="section-title">{offers.length} <span>Hot Deals</span></h2>
      </div>
      <div className="product-grid">
        {offers.map((p, i) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onBuyNow={onBuyNow} cartItems={cart} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

// ─── CATEGORIES PAGE ──────────────────────────────────────────────────────────
function CategoriesPage({ products, categories, onAddToCart, onBuyNow, cart }) {
  const [selected, setSelected] = useState(null);
  const filtered = selected ? products.filter(p => p.category === selected) : [];

  return (
    <div className="section" style={{ paddingTop: 100 }}>
      <div className="section-header">
        <h2 className="section-title">Browse <span>Categories</span></h2>
        {selected && <button className="see-all" onClick={() => setSelected(null)}>← All Categories</button>}
      </div>
      <div className="cat-grid">
        {categories.map((c, i) => {
          const count = products.filter(p => p.category === c.name).length;
          return (
            <div
              key={c.id}
              className={`cat-card ${selected === c.name ? "selected" : ""}`}
              style={{
                animationDelay: `${i * 60}ms`,
                borderColor: selected === c.name ? c.color : undefined,
                background: selected === c.name ? `${c.color}18` : undefined
              }}
              onClick={() => setSelected(selected === c.name ? null : c.name)}
            >
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name" style={{ color: selected === c.name ? c.color : undefined }}>{c.name}</div>
              <div className="cat-count">{count} product{count !== 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>
      {selected && (
        <>
          <div className="section-header">
            <h2 className="section-title">{selected} <span>Products</span></h2>
          </div>
          <div className="product-grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onBuyNow={onBuyNow} cartItems={cart} delay={i * 50} />
            ))}
          </div>
        </>
      )}
      {!selected && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
          ☝️ Select a category to browse products
        </div>
      )}
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage() {
  const features = [
    { icon: "🌍", title: "Global Reach", desc: "We ship to over 120 countries with reliable logistics partners ensuring your order arrives safe and on time." },
    { icon: "🔒", title: "Secure Shopping", desc: "End-to-end encryption and trusted payment gateways keep your financial information always protected." },
    { icon: "💎", title: "Premium Quality", desc: "Every product is vetted by our quality team to ensure you receive only the best items on the market." },
  ];
  return (
    <div className="section" style={{ paddingTop: 100 }}>
      <div className="about-section">
        <div className="about-logo" style={{ animation: "fadeUp 0.5s ease" }}>LUXE</div>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 20, animation: "fadeUp 0.5s ease 0.1s both" }}>
          Redefining the Shopping <span style={{ color: "var(--accent)" }}>Experience</span>
        </h2>
        <p className="about-para" style={{ animation: "fadeUp 0.5s ease 0.2s both" }}>
          Founded in 2022, LUXE is your go-to destination for premium products across electronics, fashion, home decor, and more. We believe shopping should be effortless, enjoyable, and accessible to everyone.
        </p>
        <p className="about-para" style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>
          Our curated marketplace brings together thousands of quality products from trusted brands worldwide, all backed by our satisfaction guarantee and world-class customer support.
        </p>
        <div className="about-grid">
          {features.map((f, i) => (
            <div className="about-feat" key={i} style={{ animationDelay: `${i * 100 + 400}ms` }}>
              <div className="about-feat-icon">{f.icon}</div>
              <div className="about-feat-title">{f.title}</div>
              <div className="about-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HELP PAGE ────────────────────────────────────────────────────────────────
function HelpPage() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "How do I track my order?", a: "Once your order is placed, you'll receive an email with a tracking number. You can also view your order status in your Profile under 'Order History'." },
    { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached. Simply initiate a return from your account." },
    { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout for an additional fee." },
    { q: "Is my payment information secure?", a: "Absolutely. We use bank-grade SSL encryption and never store your full card details. Payments are processed through certified PCI-DSS gateways." },
    { q: "Can I change or cancel my order?", a: "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team at support@luxeshop.com." },
    { q: "Do you offer gift wrapping?", a: "Yes! You can add gift wrapping during checkout for $5. Include a personalized message and we'll make it special." },
  ];
  return (
    <div className="section" style={{ paddingTop: 100 }}>
      <div className="section-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
        <h2 className="section-title">Help & <span>Support</span></h2>
        <p style={{ color: "var(--muted)" }}>Find answers to common questions below</p>
      </div>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div className="faq-item" key={i} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span className={`faq-arrow ${open === i ? "open" : ""}`}>▼</span>
            </div>
            {open === i && <div className="faq-a">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, cart, onLogout, onOpenAuth }) {
  if (!user) return (
    <div className="section" style={{ paddingTop: 100, textAlign: "center" }}>
      <div style={{ fontSize: "4rem", marginBottom: 20 }}>👤</div>
      <h2 style={{ marginBottom: 12 }}>Sign in to view profile</h2>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Access your orders, wishlist, and account details</p>
      <button className="btn-primary" onClick={onOpenAuth}>Sign In / Register</button>
    </div>
  );

  return (
    <div className="section" style={{ paddingTop: 100 }}>
      <div className="profile-card">
        <div className="profile-avatar">{user.avatar || user.name.slice(0,2).toUpperCase()}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        <div className="profile-stats">
          <div className="p-stat">
            <div className="p-stat-num">{user.orders || 0}</div>
            <div className="p-stat-label">Orders</div>
          </div>
          <div className="p-stat">
            <div className="p-stat-num">{cart.length}</div>
            <div className="p-stat-label">In Cart</div>
          </div>
          <div className="p-stat">
            <div className="p-stat-num">{user.joined || "New"}</div>
            <div className="p-stat-label">Joined</div>
          </div>
        </div>
        <div style={{ background: "var(--bg3)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 8 }}>ACCOUNT DETAILS</div>
          {[["Full Name", user.name], ["Email", user.email], ["Member Since", user.joined || "Recently"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "0.88rem" }}>
              <span style={{ color: "var(--muted)" }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [particles, setParticles] = useState([]);
  const [cartWiggle, setCartWiggle] = useState(false);
  const [products] = useState(DB.products);
  const [categories] = useState(DB.categories);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const spawnParticle = (e, emoji) => {
    const id = Date.now() + Math.random();
    const x = e.clientX - 10;
    const y = e.clientY - 10;
    setParticles(p => [...p, { id, x, y, emoji }]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 900);
  };

  const handleAddToCart = useCallback((product, e) => {
    if (!user) { setShowAuth(true); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    if (e) spawnParticle(e, "🛒");
    setCartWiggle(true);
    setTimeout(() => setCartWiggle(false), 500);
    showToast(`${product.name} added to cart!`);
  }, [user]);

  const handleBuyNow = useCallback((product, e) => {
    if (!user) { setShowAuth(true); return; }
    handleAddToCart(product, e);
    setTimeout(() => setShowCart(true), 300);
  }, [user, handleAddToCart]);

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleOrderPlaced = () => {
    setCart([]);
    showToast("🎉 Order placed successfully!", "success");
  };

  const navLinks = [
    { key: "home", label: "Home" },
    { key: "offers", label: "🔥 Offers" },
    { key: "categories", label: "Categories" },
    { key: "about", label: "About" },
    { key: "help", label: "Help" },
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* Marquee Banner */}
      <div className="marquee-wrap">
        <div className="marquee">
          {[...Array(4)].flatMap(() => [
            "FREE SHIPPING ON ORDERS $50+", "⚡ FLASH SALE: UP TO 44% OFF", "NEW ARRIVALS WEEKLY",
            "🔒 SECURE CHECKOUT", "30-DAY RETURNS", "🌍 WORLDWIDE DELIVERY",
          ]).map((t, i) => (
            <span key={i} className="marquee-item">✦ {t}</span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("home")}>LUXE</div>
        <div className="nav-links">
          {navLinks.map(l => (
            <button key={l.key} className={`nav-link ${page === l.key ? "active" : ""}`} onClick={() => setPage(l.key)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className={`cart-btn ${cartWiggle ? "wiggle" : ""}`} onClick={() => setShowCart(true)}>
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          {user ? (
            <button className="avatar-btn" onClick={() => setPage("profile")} title={user.name}>
              {(user.avatar || user.name.slice(0,2)).toUpperCase()}
            </button>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>Login</button>
          )}
        </div>
      </nav>

      {/* Pages */}
      {page === "home"       && <HomePage       products={products} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} cart={cart} />}
      {page === "offers"     && <OffersPage      products={products} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} cart={cart} />}
      {page === "categories" && <CategoriesPage  products={products} categories={categories} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} cart={cart} />}
      {page === "about"      && <AboutPage />}
      {page === "help"       && <HelpPage />}
      {page === "profile"    && <ProfilePage user={user} cart={cart} onLogout={() => { setUser(null); showToast("Signed out!", "success"); }} onOpenAuth={() => setShowAuth(true)} />}

      {/* Modals */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={u => { setUser(u); showToast(`Welcome, ${u.name}! 👋`); }}
        />
      )}
      {showCart && (
        <CartDrawer
          cart={cart} user={user}
          onClose={() => setShowCart(false)}
          onUpdate={updateQty}
          onRemove={removeItem}
          onOpenAuth={() => setShowAuth(true)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {/* Toast */}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Float particles */}
      {particles.map(p => (
        <div key={p.id} className="float-particle" style={{ left: p.x, top: p.y }}>{p.emoji}</div>
      ))}
    </>
  );
}
