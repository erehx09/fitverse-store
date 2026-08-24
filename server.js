const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

if (!fs.existsSync('./public/uploads')) {
    fs.mkdirSync('./public/uploads', { recursive: true });
}

function initDB() {
    const defaultData = {
        products: [
            { 
                id: 1, 
                name: "FITVERSE Heavyweight Drop Hoodie", 
                price: 3450, 
                category: "Clothing", 
                sizes: ["M", "L", "XL"],
                images: [
                    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
                    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800"
                ] 
            },
            { 
                id: 2, 
                name: "FITVERSE Signature Track Pants", 
                price: 2200, 
                category: "Clothing", 
                sizes: ["S", "M", "L"],
                images: [
                    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800"
                ] 
            }
        ],
        categories: ["Jewelry", "Clothing", "Accessories", "Essentials Wardrobe", "Footwear", "Your Pieces", "Everything"],
        orders: [],
        site_content: {
            brand_name: "FITVERSE",
            nav_home: "Home",
            nav_collection: "Collection",
            nav_theme: "Theme",
            nav_support: "Concierge",
            buy_btn_text: "Acquire",
            hero_tagline: "ENGINEERED FOR PERFORMANCE",
            hero_title: "BEYOND THE ORDINARY",
            hero_subtitle: "AUTUMN / WINTER 2026 DROPS",
            hero_button_text: "EXPLORE DROPS",
            section_badge: "CURATED RELEASING",
            section_title: "LATEST EDITIONS",
            checkout_title: "ORDER CONFIRMATION",
            checkout_button: "CONFIRM PURCHASE",
            whatsapp_number: "01793837194",
            hero_videos: [
                "https://assets.mixkit.co/videos/preview/mixkit-models-walking-on-a-runway-41604-large.mp4"
            ]
        }
    };

    if (!fs.existsSync('./db.json')) {
        fs.writeFileSync('./db.json', JSON.stringify(defaultData, null, 2));
    } else {
        const current = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
        if (!current.categories) current.categories = defaultData.categories;
        if (!current.products) current.products = defaultData.products;
        if (!current.orders) current.orders = [];
        if (!current.site_content) current.site_content = defaultData.site_content;

        current.products = current.products.map(p => {
            if (p.image && !p.images) {
                p.images = [p.image];
                delete p.image;
            }
            if (!p.sizes) {
                p.sizes = ["S", "M", "L", "XL", "XXL"];
            }
            return p;
        });

        fs.writeFileSync('./db.json', JSON.stringify(current, null, 2));
    }
}

initDB();

function readDB() { 
    initDB();
    return JSON.parse(fs.readFileSync('./db.json', 'utf8')); 
}
function writeDB(data) { fs.writeFileSync('./db.json', JSON.stringify(data, null, 2)); }

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const upload = multer({
    storage: multer.diskStorage({
        destination: './public/uploads/',
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    })
});

// Front-End Store View
app.get('/', (req, res) => {
    const db = readDB();
    const products = db.products || [];
    const c = db.site_content || {};
    const categories = db.categories || [];
    const videos = c.hero_videos || [];

    const categorySidebarList = categories.map(cat => `
        <div onclick="filterByCategory('${cat}')" class="py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center group cursor-pointer hover:px-2 transition-all">
            <span class="font-bold tracking-wider text-sm sm:text-base uppercase text-gray-800 dark:text-white">${cat}</span>
            <span class="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </div>
    `).join('');

    const videoTags = videos.map((vid, idx) => `
        <video autoplay muted loop playsinline class="video-slide absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === 0 ? 'opacity-50' : 'opacity-0'}">
            <source src="${vid}" type="video/mp4">
        </video>
    `).join('');

    res.send(`<!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${c.brand_name} | Official Store</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif; 
                background-color: #000000; 
                color: #f5f5f7; 
                transition: background-color 0.3s, color 0.3s;
            }

            .dark body { background-color: #000000; color: #f5f5f7; }
            .dark header { background-color: rgba(0, 0, 0, 0.85); border-color: #222224; }
            .dark .brand-text { color: #ffffff; }
            .dark .nav-link { color: #a1a1a6; }
            .dark .nav-link:hover { color: #ffffff; }
            .dark .hero-title { color: #ffffff; }
            .dark .hero-sub { color: #a1a1a6; }
            .dark .product-card { background-color: #161618; border-color: #2c2c2e; }
            .dark .product-title { color: #f5f5f7; }
            .dark .product-price { color: #ffffff; }
            .dark .buy-btn { background-color: #ffffff; color: #000000; }
            .dark .theme-btn { border-color: #3a3a3c; color: #f5f5f7; }
            .dark .modal-box { background-color: #1c1c1e; border-color: #2c2c2e; color: #f5f5f7; }
            .dark .input-box { background-color: #2c2c2e; border-color: #3a3a3c; color: #ffffff; }

            .light body { background-color: #f5f5f7; color: #1d1d1f; }
            .light header { background-color: rgba(255, 255, 255, 0.85); border-color: #e5e5e7; }
            .light .brand-text { color: #1d1d1f !important; }
            .light .nav-link { color: #515154 !important; }
            .light .nav-link:hover { color: #000000 !important; }
            .light .hero-title { color: #ffffff !important; }
            .light .hero-sub { color: #e5e5e7 !important; }
            .light .product-card { background-color: #ffffff !important; border-color: #e5e5e7 !important; }
            .light .product-title { color: #1d1d1f !important; }
            .light .product-price { color: #0071e3 !important; }
            .light .buy-btn { background-color: #0071e3 !important; color: #ffffff !important; }
            .light .theme-btn { border-color: #d2d2d7 !important; color: #1d1d1f !important; }
            .light .sec-title { color: #1d1d1f !important; }
            .light .sec-badge { color: #0071e3 !important; }
            .light .modal-box { background-color: #ffffff !important; border-color: #d2d2d7 !important; color: #1d1d1f !important; }
            .light .input-box { background-color: #f5f5f7 !important; border-color: #d2d2d7 !important; color: #1d1d1f !important; }
            .light .modal-title { color: #1d1d1f !important; }
            .light .input-label { color: #6e6e73 !important; }
        </style>
    </head>
    <body class="transition-colors duration-300 relative pb-20">

        <header class="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-4 flex justify-between items-center transition-colors">
            <div class="flex items-center space-x-4">
                <button onclick="toggleSidebar()" class="p-2 text-xl font-black focus:outline-none hover:opacity-75">
                    ☰
                </button>
                <div class="brand-text text-xl sm:text-2xl font-black tracking-widest uppercase cursor-pointer" onclick="filterByCategory('Everything')">${c.brand_name}</div>
            </div>
            
            <nav class="space-x-3 sm:space-x-8 text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center">
                <a href="#" onclick="filterByCategory('Everything')" class="nav-link hidden md:inline transition">${c.nav_home || 'Home'}</a>
                <a href="#shop" onclick="filterByCategory('Everything')" class="nav-link transition">${c.nav_collection || 'Collection'}</a>
                <button onclick="toggleTheme()" class="theme-btn border px-3 py-1 rounded-full text-[10px] tracking-wider uppercase transition">${c.nav_theme || 'Theme'}</button>
                <button onclick="openCartDrawer()" class="relative bg-white text-black px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    Cart (<span id="cartCountNav">0</span>)
                </button>
            </nav>
        </header>

        <div id="sidebarOverlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/60 z-50 hidden backdrop-blur-sm transition-opacity"></div>
        <div id="sidebarDrawer" class="fixed top-0 left-0 bottom-0 w-[80%] max-w-md bg-white dark:bg-[#121214] z-50 transform -translate-x-full transition-transform duration-300 p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
                <div class="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-800">
                    <span class="font-black tracking-widest text-lg uppercase text-black dark:text-white">${c.brand_name}</span>
                    <button onclick="toggleSidebar()" class="text-xl font-bold text-gray-500 hover:text-black dark:hover:text-white">✕</button>
                </div>
                <div class="mt-8 space-y-1">
                    ${categorySidebarList}
                </div>
            </div>
            <div class="pt-8 border-t border-gray-200 dark:border-gray-800">
                <p class="text-xs text-gray-400 uppercase tracking-widest">© ${c.brand_name} Official Store</p>
            </div>
        </div>

        <section class="relative h-[85vh] sm:h-[90vh] flex items-center justify-center overflow-hidden">
            <div id="videoContainer" class="absolute inset-0 w-full h-full z-0">
                ${videoTags}
            </div>
            <div class="absolute inset-0 bg-black/50 z-[1]"></div>

            <div class="relative z-10 text-center px-4 max-w-4xl">
                <p class="hero-sub text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-3">${c.hero_tagline}</p>
                <h1 class="hero-title text-4xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase mb-4 leading-none">${c.hero_title}</h1>
                <p class="hero-sub text-xs sm:text-sm font-medium tracking-widest uppercase mb-8">${c.hero_subtitle}</p>
                <a href="#shop" onclick="filterByCategory('Everything')" class="inline-block bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition rounded-full shadow-2xl">${c.hero_button_text}</a>
            </div>
        </section>

        <!-- Collection Section -->
        <section id="shop" class="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 border-b border-gray-800 pb-6">
                <div>
                    <span class="sec-badge text-xs font-bold uppercase tracking-[0.3em] text-gray-400">${c.section_badge}</span>
                    <h2 id="activeCategoryHeading" class="sec-title text-2xl sm:text-4xl font-bold uppercase tracking-tight mt-1">${c.section_title}</h2>
                </div>
                <button onclick="filterByCategory('Everything')" class="text-xs font-bold uppercase tracking-widest text-blue-500 hover:underline mt-4 md:mt-0">Show All Products</button>
            </div>

            <!-- Dynamic Product Grid -->
            <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            </div>
        </section>

        <!-- CART SLIDE DRAWER -->
        <div id="cartOverlay" onclick="closeCartDrawer()" class="fixed inset-0 bg-black/70 z-50 hidden backdrop-blur-sm"></div>
        <div id="cartDrawer" class="fixed top-0 right-0 bottom-0 w-[90%] max-w-md bg-[#161618] z-50 transform translate-x-full transition-transform duration-300 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
                <div class="flex justify-between items-center pb-4 border-b border-gray-800">
                    <h3 class="font-bold text-lg uppercase tracking-wider text-white">Your Shopping Cart (<span id="cartCountTitle">0</span>)</h3>
                    <button onclick="closeCartDrawer()" class="text-xl font-bold text-gray-400 hover:text-white">✕</button>
                </div>

                <div id="cartItemsList" class="mt-6 space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                </div>
            </div>

            <!-- Cart Checkout Form Process -->
            <div class="pt-4 border-t border-gray-800 space-y-4">
                <div class="space-y-1 font-mono text-xs text-gray-300">
                    <div class="flex justify-between"><span>Subtotal:</span><span>BDT <span id="cartSubtotal">0</span></span></div>
                    <div class="flex justify-between text-blue-400"><span>Delivery Charge:</span><span>BDT <span id="cartDelivery">0</span></span></div>
                    <div class="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-700"><span>Total:</span><span>BDT <span id="cartGrandTotal">0</span></span></div>
                </div>

                <form action="/order" method="POST" class="space-y-3">
                    <input type="hidden" id="cartProductNames" name="product_name">
                    <input type="hidden" id="cartTotalPrice" name="total_price">

                    <input type="text" name="customer_name" placeholder="Full Legal Name" required class="input-box w-full p-3 rounded-xl text-xs focus:outline-none">
                    <input type="text" name="phone" placeholder="Phone Number (11 Digits)" maxlength="11" required oninput="this.value = this.value.replace(/[^0-9]/g, '');" class="input-box w-full p-3 rounded-xl text-xs focus:outline-none font-mono">
                    
                    <div>
                        <label class="block text-[10px] uppercase text-gray-400 mb-1">Select Delivery District</label>
                        <select id="cartDistrictSelect" name="district" onchange="calculateDeliveryCharge()" required class="input-box w-full p-3 rounded-xl text-xs focus:outline-none">
                            <option value="">Select District</option>
                            <option value="Dhaka">Dhaka (Inside Dhaka - BDT 80)</option>
                            <option value="Outside Dhaka">Outside Dhaka (All Other Districts - BDT 130)</option>
                        </select>
                    </div>

                    <textarea name="address" placeholder="Full Address (House no, Road, Thana/Area details)" required class="input-box w-full p-3 rounded-xl text-xs focus:outline-none" rows="2"></textarea>

                    <button type="submit" id="confirmOrderBtn" class="w-full bg-[#0071e3] text-white font-bold uppercase py-3.5 text-xs tracking-widest rounded-full opacity-50 cursor-not-allowed" disabled>CONFIRM ORDER</button>
                </form>
            </div>
        </div>

        <script>
            const allProducts = ${JSON.stringify(products)};
            const buyButtonText = "${c.buy_btn_text || 'Acquire'}";
            let cart = [];
            let selectedSizes = {};

            function renderProducts(items) {
                const grid = document.getElementById('productGrid');
                if(!items || items.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center py-16"><p class="text-gray-400 font-semibold text-sm uppercase tracking-widest">No items available in this collection yet.</p></div>';
                    return;
                }

                grid.innerHTML = items.map(p => {
                    const imgList = (p.images && p.images.length > 0) ? p.images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
                    const mainImg = imgList[0];
                    const sizesList = (p.sizes && p.sizes.length > 0) ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
                    
                    const sizeButtons = sizesList.map(sz => \`
                        <button type="button" id="size-btn-\${p.id}-\${sz}" onclick="selectSize(\${p.id}, '\${sz}')" class="size-btn-\${p.id} border border-gray-700 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase hover:border-white transition">\${sz}</button>
                    \`).join('');

                    const thumbs = imgList.map((img) => \`
                        <img src="\${img}" onclick="switchCardImage(\${p.id}, '\${img}')" class="w-10 h-10 object-cover rounded-lg border border-gray-700 cursor-pointer hover:border-blue-500 transition">
                    \`).join('');

                    return \`
                        <div class="product-card bg-[#161618] border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-500 hover:border-gray-500 shadow-2xl">
                            <div class="h-[320px] sm:h-[380px] overflow-hidden bg-black relative">
                                <img id="card-img-\${p.id}" src="\${mainImg}" class="h-full w-full object-cover group-hover:scale-105 transition duration-700">
                                <span class="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-gray-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-gray-200">\${p.category}</span>
                            </div>
                            <div class="p-5 sm:p-6 space-y-4">
                                <h3 class="product-title text-base sm:text-lg font-semibold tracking-tight uppercase">\${p.name}</h3>
                                
                                \${imgList.length > 1 ? \`<div class="flex space-x-2">\${thumbs}</div>\` : ''}

                                <div>
                                    <span class="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Select Size:</span>
                                    <div class="flex flex-wrap gap-2">
                                        \${sizeButtons}
                                    </div>
                                </div>

                                <div class="flex justify-between items-center pt-3 border-t border-gray-800">
                                    <span class="product-price text-lg font-bold font-mono">BDT \${p.price}</span>
                                    <button onclick="addToCart(\${p.id})" class="buy-btn bg-white text-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition rounded-full shadow-lg">+ Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    \`;
                }).join('');
            }

            function selectSize(productId, size) {
                selectedSizes[productId] = size;
                document.querySelectorAll('.size-btn-' + productId).forEach(b => {
                    b.classList.remove('bg-white', 'text-black', 'border-white');
                    b.classList.add('border-gray-700');
                });
                const selectedBtn = document.getElementById('size-btn-' + productId + '-' + size);
                if(selectedBtn) {
                    selectedBtn.classList.add('bg-white', 'text-black', 'border-white');
                }
            }

            function addToCart(productId) {
                const p = allProducts.find(item => item.id === productId);
                if(!p) return;

                const chosenSize = selectedSizes[productId];
                if(!chosenSize) {
                    alert('Please select a size first for ' + p.name);
                    return;
                }

                cart.push({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    size: chosenSize,
                    image: (p.images && p.images[0]) ? p.images[0] : ''
                });

                updateCartUI();
                openCartDrawer();
            }

            function removeFromCart(index) {
                cart.splice(index, 1);
                updateCartUI();
            }

            function updateCartUI() {
                document.getElementById('cartCountNav').innerText = cart.length;
                document.getElementById('cartCountTitle').innerText = cart.length;

                const cartList = document.getElementById('cartItemsList');
                if(cart.length === 0) {
                    cartList.innerHTML = '<p class="text-center text-xs text-gray-500 uppercase py-8">Your cart is empty.</p>';
                } else {
                    cartList.innerHTML = cart.map((item, idx) => \`
                        <div class="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-gray-800">
                            <div class="flex items-center space-x-3">
                                <img src="\${item.image}" class="w-12 h-12 object-cover rounded-xl">
                                <div>
                                    <p class="font-bold text-xs text-white uppercase">\${item.name}</p>
                                    <span class="text-[10px] text-gray-400">Size: <strong class="text-white">\${item.size}</strong> | BDT \${item.price}</span>
                                </div>
                            </div>
                            <button onclick="removeFromCart(\${idx})" class="text-red-500 font-bold hover:opacity-75 p-1 text-sm">✕</button>
                        </div>
                    \`).join('');
                }

                calculateDeliveryCharge();
            }

            function calculateDeliveryCharge() {
                const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
                const district = document.getElementById('cartDistrictSelect').value;
                let delivery = 0;

                if(cart.length > 0 && district !== '') {
                    delivery = (district === 'Dhaka') ? 80 : 130;
                }

                const total = subtotal + delivery;

                document.getElementById('cartSubtotal').innerText = subtotal;
                document.getElementById('cartDelivery').innerText = delivery;
                document.getElementById('cartGrandTotal').innerText = total;

                // Set Hidden Form Inputs
                const itemSummary = cart.map(i => i.name + ' (' + i.size + ')').join(', ');
                document.getElementById('cartProductNames').value = itemSummary;
                document.getElementById('cartTotalPrice').value = total;

                const btn = document.getElementById('confirmOrderBtn');
                if(cart.length > 0 && district !== '') {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                } else {
                    btn.disabled = true;
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                }
            }

            function openCartDrawer() {
                document.getElementById('cartOverlay').classList.remove('hidden');
                document.getElementById('cartDrawer').classList.remove('translate-x-full');
            }

            function closeCartDrawer() {
                document.getElementById('cartOverlay').classList.add('hidden');
                document.getElementById('cartDrawer').classList.add('translate-x-full');
            }

            function switchCardImage(pid, newSrc) {
                document.getElementById('card-img-' + pid).src = newSrc;
            }

            function filterByCategory(categoryName) {
                const heading = document.getElementById('activeCategoryHeading');
                const drawer = document.getElementById('sidebarDrawer');
                const overlay = document.getElementById('sidebarOverlay');

                if (!drawer.classList.contains('-translate-x-full')) {
                    drawer.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                }

                if(categoryName === 'Everything' || categoryName === 'ALL' || categoryName === 'Your Pieces') {
                    heading.innerText = "${c.section_title}";
                    renderProducts(allProducts);
                } else {
                    heading.innerText = categoryName + " COLLECTION";
                    const filtered = allProducts.filter(p => p.category && p.category.toLowerCase() === categoryName.toLowerCase());
                    renderProducts(filtered);
                }

                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
            }

            renderProducts(allProducts);

            function toggleSidebar() {
                const drawer = document.getElementById('sidebarDrawer');
                const overlay = document.getElementById('sidebarOverlay');
                if (drawer.classList.contains('-translate-x-full')) {
                    drawer.classList.remove('-translate-x-full');
                    overlay.classList.remove('hidden');
                } else {
                    drawer.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                }
            }

            function toggleTheme() {
                const html = document.documentElement;
                if (html.classList.contains('dark')) {
                    html.classList.remove('dark');
                    html.classList.add('light');
                } else {
                    html.classList.remove('light');
                    html.classList.add('dark');
                }
            }
        </script>
    </body>
    </html>`);
});

// Admin Auth
app.use('/admin', (req, res, next) => {
    const authPass = req.query.pass || req.body.pass;
    if (authPass === 'fitverse123') {
        next();
    } else {
        res.status(401).send(`<!DOCTYPE html>
        <html><head><title>Admin Authentication</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-[#000000] text-white flex items-center justify-center h-screen px-4">
            <form class="bg-[#1c1c1e] p-8 sm:p-10 rounded-3xl border border-gray-800 space-y-4 text-center max-w-sm w-full">
                <h2 class="text-white font-bold text-2xl uppercase tracking-widest">FITVERSE Admin</h2>
                <input type="password" name="pass" placeholder="Password" class="w-full bg-[#2c2c2e] border border-gray-700 p-3.5 rounded-xl text-white text-sm">
                <button class="w-full bg-[#0071e3] text-white font-bold py-3 uppercase text-xs tracking-widest rounded-full">Unlock Dashboard</button>
            </form>
        </body></html>`);
    }
});

// Admin Control Panel
app.get('/admin', (req, res) => {
    const db = readDB();
    const c = db.site_content || {};
    const categories = db.categories || [];
    const orders = db.orders || [];
    const products = db.products || [];

    const orderRows = orders.map(o => `
        <tr class="hover:bg-black/40">
            <td class="p-4 font-mono">#${o.id}</td>
            <td class="p-4 font-bold text-white">${o.customer_name}</td>
            <td class="p-4 font-mono text-blue-400">${o.phone}</td>
            <td class="p-4 text-gray-400 text-xs">${o.address}</td>
            <td class="p-4 text-white font-semibold">${o.product_name} (${o.total_price} BDT)</td>
            <td class="p-4 font-bold ${o.status === 'Confirmed' ? 'text-green-400' : o.status === 'Rejected' ? 'text-red-500' : 'text-amber-400'}">${o.status || 'Pending'}</td>
            <td class="p-4 flex space-x-2">
                <form action="/admin/order/status?pass=fitverse123" method="POST">
                    <input type="hidden" name="id" value="${o.id}">
                    <input type="hidden" name="status" value="Confirmed">
                    <button type="submit" title="Confirm" class="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-lg text-sm">✔</button>
                </form>
                <form action="/admin/order/status?pass=fitverse123" method="POST">
                    <input type="hidden" name="id" value="${o.id}">
                    <input type="hidden" name="status" value="Rejected">
                    <button type="submit" title="Reject" class="bg-amber-600 hover:bg-amber-700 text-white font-bold p-2 rounded-lg text-sm">✖</button>
                </form>
                <form action="/admin/order/delete?pass=fitverse123" method="POST">
                    <input type="hidden" name="id" value="${o.id}">
                    <button type="submit" title="Delete Order" class="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-lg text-sm">🗑</button>
                </form>
            </td>
        </tr>
    `).join('');

    const productManageRows = products.map(p => {
        const pImages = (p.images && p.images.length > 0) ? p.images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
        const pSizes = (p.sizes && p.sizes.length > 0) ? p.sizes.join(', ') : 'All';
        return `
        <div class="flex items-center justify-between bg-black p-3 rounded-xl border border-gray-800">
            <div class="flex items-center space-x-3">
                <img src="${pImages[0]}" class="w-10 h-10 object-cover rounded-lg">
                <div>
                    <p class="font-bold text-xs text-white">${p.name}</p>
                    <span class="text-[10px] text-gray-400">BDT ${p.price} | Sizes: ${pSizes}</span>
                </div>
            </div>
            <form action="/admin/product/delete?pass=fitverse123" method="POST">
                <input type="hidden" name="id" value="${p.id}">
                <button type="submit" class="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg">Delete</button>
            </form>
        </div>
    `}).join('');

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FITVERSE | Admin Suite</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#000000] text-gray-100 p-4 sm:p-8 font-sans">
        <div class="max-w-7xl mx-auto space-y-8 sm:space-y-12">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-6 gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-black uppercase text-white tracking-widest">Admin Control Suite</h1>
                </div>
                <a href="/?pass=fitverse123" class="text-xs font-bold uppercase bg-[#1c1c1e] border border-gray-700 px-6 py-3 rounded-full text-white hover:bg-gray-800">Live Website</a>
            </div>

            <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl">
                <h2 class="text-lg sm:text-xl font-bold uppercase mb-6 text-gray-200 tracking-wider">Customer Orders (${orders.length})</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse min-w-[600px]">
                        <thead class="border-b border-gray-800 bg-black text-gray-400 uppercase">
                            <tr>
                                <th class="p-4">#</th>
                                <th class="p-4">Customer</th>
                                <th class="p-4">Phone</th>
                                <th class="p-4">Address</th>
                                <th class="p-4">Items & Size</th>
                                <th class="p-4">Status</th>
                                <th class="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800">
                            ${orderRows}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Product Form with Size Checkboxes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <h2 class="text-lg sm:text-xl font-bold uppercase text-gray-200 tracking-wider">Add New Product + Sizes</h2>
                    <form action="/admin/product/add?pass=fitverse123" method="POST" enctype="multipart/form-data" class="space-y-3 text-xs">
                        <input type="text" name="name" placeholder="Product Title" required class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                        <input type="number" name="price" placeholder="Price (BDT)" required class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                        <select name="category" required class="w-full bg-black border border-gray-800 p-3.5 rounded-xl text-white">
                            <option value="">Select Category</option>
                            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        
                        <div class="border border-gray-800 p-4 rounded-2xl bg-black space-y-2">
                            <label class="block text-amber-400 font-bold mb-1">Select Available Sizes for this item:</label>
                            <div class="flex space-x-4 text-white font-bold">
                                <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" name="sizes" value="S" checked> <span>S</span></label>
                                <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" name="sizes" value="M" checked> <span>M</span></label>
                                <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" name="sizes" value="L" checked> <span>L</span></label>
                                <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" name="sizes" value="XL" checked> <span>XL</span></label>
                                <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" name="sizes" value="XXL"> <span>XXL</span></label>
                            </div>
                        </div>

                        <div class="border border-gray-800 p-4 rounded-2xl bg-black space-y-3">
                            <label class="block text-amber-400 font-bold">Product Images & Size Chart File Select</label>
                            <div>
                                <span class="block text-gray-400 text-[10px] uppercase mb-1">1. Main Product Image (Required)</span>
                                <input type="file" name="img_file_1" accept="image/*" class="w-full text-gray-400">
                            </div>
                            <div>
                                <span class="block text-gray-400 text-[10px] uppercase mb-1">2. Second Image / Angle (Optional)</span>
                                <input type="file" name="img_file_2" accept="image/*" class="w-full text-gray-400">
                            </div>
                            <div>
                                <span class="block text-gray-400 text-[10px] uppercase mb-1">3. Size Chart Image (Optional)</span>
                                <input type="file" name="img_file_3" accept="image/*" class="w-full text-gray-400">
                            </div>
                        </div>

                        <input type="text" name="image_urls" placeholder="OR Paste Image URLs (Comma-separated)" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                        <button type="submit" class="w-full bg-[#0071e3] text-white font-bold uppercase py-4 rounded-full tracking-widest">Publish Product</button>
                    </form>
                </div>

                <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <h2 class="text-lg sm:text-xl font-bold uppercase text-gray-200 tracking-wider">Product Inventory</h2>
                    <div class="space-y-3 max-h-80 overflow-y-auto">
                        ${productManageRows}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>`);
});

// Operations
app.post('/order', (req, res) => {
    const db = readDB();
    const { customer_name, phone, address, product_name, total_price } = req.body;
    db.orders.unshift({
        id: db.orders.length + 1,
        customer_name,
        phone,
        address,
        product_name,
        total_price,
        status: 'Pending'
    });
    writeDB(db);
    res.send("<body style='background:#000000;color:white;font-family:sans-serif;text-align:center;padding-top:120px;'><h1>ORDER PLACED SUCCESSFULLY</h1><p style='color:#0071e3;'>Your order is pending review.</p><a href='/' style='color:white;'>Return to Store</a></body>");
});

app.post('/admin/order/status', (req, res) => {
    const db = readDB();
    const { id, status } = req.body;
    const order = db.orders.find(o => o.id === Number(id));
    if (order) {
        order.status = status;
        writeDB(db);
    }
    res.redirect('/admin?pass=fitverse123');
});

app.post('/admin/order/delete', (req, res) => {
    const db = readDB();
    db.orders = db.orders.filter(o => o.id !== Number(req.body.id));
    writeDB(db);
    res.redirect('/admin?pass=fitverse123');
});

// Multi-Image & Size Selection Product Add
app.post('/admin/product/add', upload.fields([
    { name: 'img_file_1', maxCount: 1 },
    { name: 'img_file_2', maxCount: 1 },
    { name: 'img_file_3', maxCount: 1 }
]), (req, res) => {
    const db = readDB();
    const { name, price, category, image_urls, sizes } = req.body;
    
    let imgList = [];
    if (req.files) {
        if (req.files.img_file_1 && req.files.img_file_1[0]) imgList.push(`/uploads/${req.files.img_file_1[0].filename}`);
        if (req.files.img_file_2 && req.files.img_file_2[0]) imgList.push(`/uploads/${req.files.img_file_2[0].filename}`);
        if (req.files.img_file_3 && req.files.img_file_3[0]) imgList.push(`/uploads/${req.files.img_file_3[0].filename}`);
    }

    if (image_urls && image_urls.trim() !== '') {
        const urls = image_urls.split(',').map(u => u.trim()).filter(u => u !== '');
        imgList = imgList.concat(urls);
    }

    if (imgList.length === 0) {
        imgList = ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
    }

    let sizeList = [];
    if (sizes) {
        sizeList = Array.isArray(sizes) ? sizes : [sizes];
    } else {
        sizeList = ["S", "M", "L", "XL", "XXL"];
    }

    db.products.push({ id: Date.now(), name, price: Number(price), category, sizes: sizeList, images: imgList });
    writeDB(db);
    res.redirect('/admin?pass=fitverse123');
});

app.post('/admin/product/delete', (req, res) => {
    const db = readDB();
    db.products = db.products.filter(p => p.id !== Number(req.body.id));
    writeDB(db);
    res.redirect('/admin?pass=fitverse123');
});

app.listen(PORT, () => console.log(`FITVERSE Size & Cart System Running on http://localhost:${PORT}`));