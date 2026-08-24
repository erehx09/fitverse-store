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
    <body class="transition-colors duration-300 relative">

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
                <a href="https://wa.me/88${c.whatsapp_number}" target="_blank" class="bg-[#0071e3] text-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition rounded-full">${c.nav_support || 'Concierge'}</a>
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

        <!-- Checkout Modal -->
        <div id="checkoutModal" class="fixed inset-0 bg-black/80 hidden z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div class="modal-box border p-6 sm:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onclick="closeModal()" class="absolute top-5 right-6 text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                <h3 class="modal-title text-xl sm:text-2xl font-bold uppercase tracking-tight mb-1">${c.checkout_title}</h3>
                
                <!-- Modal Product Gallery -->
                <div class="mb-4">
                    <img id="modalMainImg" src="" class="w-full h-64 object-cover rounded-2xl border border-gray-800">
                    <div id="modalThumbnails" class="flex space-x-2 mt-3 overflow-x-auto pb-2"></div>
                </div>

                <p id="p_display" class="text-xs sm:text-sm font-medium mb-6 text-gray-400 border-b border-gray-700 pb-3"></p>
                
                <form action="/order" method="POST" class="space-y-4">
                    <input type="hidden" id="p_name" name="product_name">
                    <input type="hidden" id="p_price" name="total_price">
                    
                    <div>
                        <label class="input-label block text-[10px] uppercase tracking-widest mb-1">Full Legal Name</label>
                        <input type="text" name="customer_name" placeholder="Name" required class="input-box w-full p-3.5 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                    </div>

                    <div>
                        <label class="input-label block text-[10px] uppercase tracking-widest mb-1">Phone Number (11 Digits Only)</label>
                        <input type="text" name="phone" placeholder="017XXXXXXXX" maxlength="11" required oninput="this.value = this.value.replace(/[^0-9]/g, '');" class="input-box w-full p-3.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-mono">
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="input-label block text-[10px] uppercase tracking-widest mb-1">Division</label>
                            <select id="divisionSelect" onchange="updateDistricts()" required class="input-box w-full p-3.5 rounded-xl text-xs focus:outline-none focus:border-blue-500">
                                <option value="">Division</option>
                                <option value="Sylhet Division">Sylhet</option>
                                <option value="Dhaka Division">Dhaka</option>
                                <option value="Chittagong Division">Chittagong</option>
                                <option value="Rajshahi Division">Rajshahi</option>
                                <option value="Khulna Division">Khulna</option>
                                <option value="Barishal Division">Barishal</option>
                                <option value="Rangpur Division">Rangpur</option>
                                <option value="Mymensingh Division">Mymensingh</option>
                            </select>
                        </div>
                        <div>
                            <label class="input-label block text-[10px] uppercase tracking-widest mb-1">District</label>
                            <select id="districtSelect" required class="input-box w-full p-3.5 rounded-xl text-xs focus:outline-none focus:border-blue-500">
                                <option value="">District</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="input-label block text-[10px] uppercase tracking-widest mb-1">Street / Thana / House / Area Details</label>
                        <textarea id="fullAddress" name="address" placeholder="Thana, House no, Road no, Area details" required class="input-box w-full p-3.5 rounded-xl text-sm focus:outline-none focus:border-blue-500" rows="2"></textarea>
                    </div>

                    <button type="submit" onclick="concatAddress()" class="w-full bg-[#0071e3] text-white font-bold uppercase py-4 text-xs tracking-widest hover:opacity-90 transition rounded-full">${c.checkout_button}</button>
                </form>
            </div>
        </div>

        <script>
            const allProducts = ${JSON.stringify(products)};
            const buyButtonText = "${c.buy_btn_text || 'Acquire'}";

            function renderProducts(items) {
                const grid = document.getElementById('productGrid');
                if(!items || items.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center py-16"><p class="text-gray-400 font-semibold text-sm uppercase tracking-widest">No items available in this collection yet.</p></div>';
                    return;
                }

                grid.innerHTML = items.map(p => {
                    const imgList = (p.images && p.images.length > 0) ? p.images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
                    const mainImg = imgList[0];
                    
                    const thumbs = imgList.map((img, i) => \`
                        <img src="\${img}" onclick="switchCardImage(\${p.id}, '\${img}')" class="w-12 h-12 object-cover rounded-lg border border-gray-700 cursor-pointer hover:border-blue-500 transition">
                    \`).join('');

                    return \`
                        <div class="product-card bg-[#161618] border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-500 hover:border-gray-500 shadow-2xl">
                            <div class="h-[320px] sm:h-[420px] overflow-hidden bg-black relative">
                                <img id="card-img-\${p.id}" src="\${mainImg}" class="h-full w-full object-cover group-hover:scale-105 transition duration-700">
                                <span class="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-gray-700 px-3.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-gray-200">\${p.category}</span>
                            </div>
                            <div class="p-5 sm:p-7">
                                <h3 class="product-title text-base sm:text-lg font-semibold tracking-tight uppercase">\${p.name}</h3>
                                
                                \${imgList.length > 1 ? \`<div class="flex space-x-2 mt-3">\${thumbs}</div>\` : ''}

                                <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                                    <span class="product-price text-lg sm:text-xl font-bold font-mono">BDT \${p.price}</span>
                                    <button onclick="orderModal(\${p.id})" class="buy-btn bg-white text-black px-5 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition rounded-full shadow-lg">\${buyButtonText}</button>
                                </div>
                            </div>
                        </div>
                    \`;
                }).join('');
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

            let currentVid = 0;
            const slides = document.querySelectorAll('.video-slide');
            if(slides.length > 1) {
                setInterval(() => {
                    slides[currentVid].style.opacity = '0';
                    currentVid = (currentVid + 1) % slides.length;
                    slides[currentVid].style.opacity = '0.5';
                }, 5000);
            }

            const bdData = {
                "Sylhet Division": ["Sylhet District", "Habiganj District", "Moulvibazar District", "Sunamganj District"],
                "Dhaka Division": ["Dhaka District", "Faridpur District", "Gazipur District", "Gopalganj District", "Kishoreganj District", "Madaripur District", "Manikganj District", "Munshiganj District", "Narayanganj District", "Narsingdi District", "Rajbari District", "Shariatpur District", "Tangail District"],
                "Chittagong Division": ["Chittagong District", "Cox's Bazar District", "Cumilla District", "Noakhali District", "Feni District", "Lakshmipur District", "Chandpur District", "Brahmanbaria District", "Khagrachhari District", "Rangamati District", "Bandarban District"],
                "Rajshahi Division": ["Rajshahi District", "Bogura District", "Joypurhat District", "Naogaon District", "Natore District", "Chapainawabganj District", "Pabna District", "Sirajganj District"],
                "Khulna Division": ["Khulna District", "Bagerhat District", "Chuadanga District", "Jashore District", "Jhenaidah District", "Kushtia District", "Magura District", "Meherpur District", "Narail District", "Satkhira District"],
                "Barishal Division": ["Barishal District", "Bhola District", "Barguna District", "Jhalokathi District", "Patuakhali District", "Pirojpur District"],
                "Rangpur Division": ["Rangpur District", "Dinajpur District", "Gaibandha District", "Kurigram District", "Lalmonirhat District", "Nilphamari District", "Panchagarh District", "Thakurgaon District"],
                "Mymensingh Division": ["Mymensingh District", "Jamalpur District", "Netrokona District", "Sherpur District"]
            };

            function updateDistricts() {
                const div = document.getElementById('divisionSelect').value;
                const distSelect = document.getElementById('districtSelect');
                distSelect.innerHTML = '<option value="">District</option>';

                if(bdData[div]) {
                    bdData[div].forEach(d => {
                        distSelect.innerHTML += '<option value="' + d + '">' + d + '</option>';
                    });
                }
            }

            function concatAddress() {
                const div = document.getElementById('divisionSelect').value;
                const dist = document.getElementById('districtSelect').value;
                const detail = document.getElementById('fullAddress').value;
                document.getElementById('fullAddress').value = div + ' -> ' + dist + ' -> ' + detail;
            }

            function orderModal(pid) {
                const p = allProducts.find(item => item.id === pid);
                if(!p) return;

                document.getElementById('p_name').value = p.name;
                document.getElementById('p_price').value = p.price;
                document.getElementById('p_display').innerText = p.name + ' — BDT ' + p.price;

                const imgList = (p.images && p.images.length > 0) ? p.images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
                const modalMain = document.getElementById('modalMainImg');
                modalMain.src = imgList[0];

                const thumbBox = document.getElementById('modalThumbnails');
                if(imgList.length > 1) {
                    thumbBox.innerHTML = imgList.map(img => \`
                        <img src="\${img}" onclick="document.getElementById('modalMainImg').src = '\${img}'" class="w-14 h-14 object-cover rounded-lg border border-gray-700 cursor-pointer hover:border-blue-500">
                    \`).join('');
                } else {
                    thumbBox.innerHTML = '';
                }

                document.getElementById('checkoutModal').classList.remove('hidden');
            }
            function closeModal() { document.getElementById('checkoutModal').classList.add('hidden'); }
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

    const categoryRows = categories.map(cat => `
        <div class="flex items-center justify-between bg-black p-3 rounded-xl border border-gray-800">
            <span class="font-bold text-xs text-white uppercase">${cat}</span>
            <form action="/admin/category/delete?pass=fitverse123" method="POST">
                <input type="hidden" name="category" value="${cat}">
                <button type="submit" class="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg">Remove</button>
            </form>
        </div>
    `).join('');

    const productManageRows = products.map(p => {
        const pImages = (p.images && p.images.length > 0) ? p.images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
        return `
        <div class="flex items-center justify-between bg-black p-3 rounded-xl border border-gray-800">
            <div class="flex items-center space-x-3">
                <img src="${pImages[0]}" class="w-10 h-10 object-cover rounded-lg">
                <div>
                    <p class="font-bold text-xs text-white">${p.name}</p>
                    <span class="text-[10px] text-gray-400">BDT ${p.price} | ${p.category} (${pImages.length} Images)</span>
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
                                <th class="p-4">Item</th>
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <h2 class="text-lg sm:text-xl font-bold uppercase text-white tracking-wider">Add Navigation Category</h2>
                    <form action="/admin/category/add?pass=fitverse123" method="POST" class="flex space-x-3 text-xs">
                        <input type="text" name="category" placeholder="Category Name" required class="flex-1 bg-black border border-gray-800 p-3.5 rounded-xl text-white">
                        <button type="submit" class="bg-[#0071e3] text-white font-bold uppercase px-6 py-3.5 rounded-xl hover:opacity-90">Add</button>
                    </form>
                </div>

                <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <h2 class="text-lg sm:text-xl font-bold uppercase text-white tracking-wider">Active Sidebar Categories</h2>
                    <div class="space-y-3 max-h-60 overflow-y-auto">
                        ${categoryRows}
                    </div>
                </div>
            </div>

            <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-4">
                <h2 class="text-lg sm:text-xl font-bold uppercase text-white tracking-wider">Dynamic Navigation & Button Text Editor</h2>
                <form action="/admin/content/update?pass=fitverse123" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                        <label class="block text-gray-400 mb-1">Brand Name Title</label>
                        <input type="text" name="brand_name" value="${c.brand_name || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Nav Home Text</label>
                        <input type="text" name="nav_home" value="${c.nav_home || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Nav Collection Text</label>
                        <input type="text" name="nav_collection" value="${c.nav_collection || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Nav Theme Text</label>
                        <input type="text" name="nav_theme" value="${c.nav_theme || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Nav Support Text</label>
                        <input type="text" name="nav_support" value="${c.nav_support || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Product Card Buy Button Text</label>
                        <input type="text" name="buy_btn_text" value="${c.buy_btn_text || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Hero Tagline</label>
                        <input type="text" name="hero_tagline" value="${c.hero_tagline || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Hero Main Heading</label>
                        <input type="text" name="hero_title" value="${c.hero_title || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Hero Subtitle</label>
                        <input type="text" name="hero_subtitle" value="${c.hero_subtitle || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Hero Button Text</label>
                        <input type="text" name="hero_button_text" value="${c.hero_button_text || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Section Badge</label>
                        <input type="text" name="section_badge" value="${c.section_badge || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div>
                        <label class="block text-gray-400 mb-1">Section Title</label>
                        <input type="text" name="section_title" value="${c.section_title || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-gray-400 mb-1">WhatsApp Support Phone</label>
                        <input type="text" name="whatsapp_number" value="${c.whatsapp_number || ''}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>

                    <div class="md:col-span-2 border border-gray-800 p-4 rounded-xl bg-black space-y-2">
                        <label class="block text-amber-400 font-bold mb-1">Upload New Hero Video (.mp4 File)</label>
                        <input type="file" name="video_file" accept="video/mp4" class="w-full text-gray-400">
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-gray-400 mb-1">OR Paste Background Video URL Links (Comma-separated .mp4)</label>
                        <input type="text" name="hero_videos" value="${(c.hero_videos || []).join(', ')}" class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                    </div>

                    <button type="submit" class="md:col-span-2 bg-[#0071e3] text-white font-bold uppercase py-4 rounded-full tracking-widest hover:opacity-90 transition">Save All Site Content & Upload Video</button>
                </form>
            </div>

            <!-- Multi Input Image Product Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-[#1c1c1e] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <h2 class="text-lg sm:text-xl font-bold uppercase text-gray-200 tracking-wider">Add Product (Separate Image Uploads)</h2>
                    <form action="/admin/product/add?pass=fitverse123" method="POST" enctype="multipart/form-data" class="space-y-3 text-xs">
                        <input type="text" name="name" placeholder="Product Title" required class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                        <input type="number" name="price" placeholder="Price (BDT)" required class="w-full bg-black border border-gray-800 p-3.5 rounded-xl">
                        <select name="category" required class="w-full bg-black border border-gray-800 p-3.5 rounded-xl text-white">
                            <option value="">Select Category</option>
                            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        
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

app.post('/admin/category/add', (req, res) => {
    const db = readDB();
    const newCat = req.body.category.trim();
    if (!db.categories) db.categories = [];
    if (newCat && !db.categories.includes(newCat)) {
        db.categories.push(newCat);
        writeDB(db);
    }
    res.redirect('/admin?pass=fitverse123');
});

app.post('/admin/category/delete', (req, res) => {
    const db = readDB();
    const catToDelete = req.body.category;
    if (db.categories) {
        db.categories = db.categories.filter(c => c !== catToDelete);
        writeDB(db);
    }
    res.redirect('/admin?pass=fitverse123');
});

app.post('/admin/content/update', upload.single('video_file'), (req, res) => {
    const db = readDB();
    const { brand_name, nav_home, nav_collection, nav_theme, nav_support, buy_btn_text, hero_tagline, hero_title, hero_subtitle, hero_button_text, section_badge, section_title, whatsapp_number, hero_videos } = req.body;
    
    db.site_content.brand_name = brand_name;
    db.site_content.nav_home = nav_home;
    db.site_content.nav_collection = nav_collection;
    db.site_content.nav_theme = nav_theme;
    db.site_content.nav_support = nav_support;
    db.site_content.buy_btn_text = buy_btn_text;
    db.site_content.hero_tagline = hero_tagline;
    db.site_content.hero_title = hero_title;
    db.site_content.hero_subtitle = hero_subtitle;
    db.site_content.hero_button_text = hero_button_text;
    db.site_content.section_badge = section_badge;
    db.site_content.section_title = section_title;
    db.site_content.whatsapp_number = whatsapp_number;

    let vList = hero_videos ? hero_videos.split(',').map(v => v.trim()).filter(v => v !== '') : [];

    if (req.file) {
        const uploadedVidPath = `/uploads/${req.file.filename}`;
        vList.unshift(uploadedVidPath);
    }

    db.site_content.hero_videos = vList;
    writeDB(db);
    res.redirect('/admin?pass=fitverse123');
});

// Multi-Image Upload API
app.post('/admin/product/add', upload.fields([
    { name: 'img_file_1', maxCount: 1 },
    { name: 'img_file_2', maxCount: 1 },
    { name: 'img_file_3', maxCount: 1 }
]), (req, res) => {
    const db = readDB();
    const { name, price, category, image_urls } = req.body;
    
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

    db.products.push({ id: Date.now(), name, price: Number(price), category, images: imgList });
    writeDB(db);
    res.redirect('/admin?pass=fitverse123');
});

app.post('/admin/product/delete', (req, res) => {
    const db = readDB();
    db.products = db.products.filter(p => p.id !== Number(req.body.id));
    writeDB(db);
    res.redirect('/admin?pass=fitverse123');
});

app.listen(PORT, () => console.log(`FITVERSE Multi-Image Fixed System Running on http://localhost:${PORT}`));