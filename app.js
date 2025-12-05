// CivilCity Airdrop Logic - Full Integrated Version
// Developed by Tabriz University Civil Engineering Students

document.addEventListener('DOMContentLoaded', () => {
    
    // --- متغیرهای اصلی ---
    let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
    let energy = localStorage.getItem('energy') ? parseInt(localStorage.getItem('energy')) : 1000;
    const maxEnergy = 1000;
    let level = 1;
    let pph = localStorage.getItem('pph') ? parseInt(localStorage.getItem('pph')) : 0; // Profit Per Hour
    let lastSaveTime = localStorage.getItem('lastSaveTime') ? parseInt(localStorage.getItem('lastSaveTime')) : Date.now();

    // --- دیتابیس آیتم‌های بازار ---
        // --- دیتابیس آیتم‌های بازار (توسعه یافته) ---
    const marketItems = [
        // بخش 1: نیروی انسانی و ابزار دستی
        { id: 'm1', name: 'دانشجوی ترم یک', profit: 50, basePrice: 500, icon: 'fa-user-graduate', level: 0 },
        { id: 'm2', name: 'کارگر ساده', profit: 120, basePrice: 1000, icon: 'fa-user', level: 0 },
        { id: 'm3', name: 'فرغون', profit: 300, basePrice: 2500, icon: 'fa-shopping-cart', level: 0 },
        { id: 'm4', name: 'متر لیزری', profit: 500, basePrice: 5000, icon: 'fa-ruler', level: 0 },
        { id: 'm5', name: 'تراز لیزری', profit: 800, basePrice: 9000, icon: 'fa-crosshairs', level: 0 },
        
        // بخش 2: ماشین‌آلات
        { id: 'm6', name: 'دریل هیلتی', profit: 1200, basePrice: 15000, icon: 'fa-hammer', level: 0 },
        { id: 'm7', name: 'موتور جوش', profit: 2000, basePrice: 25000, icon: 'fa-bolt', level: 0 },
        { id: 'm8', name: 'دوربین توتال', profit: 3500, basePrice: 40000, icon: 'fa-camera', level: 0 },
        { id: 'm9', name: 'بابکت', profit: 5000, basePrice: 70000, icon: 'fa-snowplow', level: 0 },
        { id: 'm10', name: 'کامیون کمپرسی', profit: 7500, basePrice: 120000, icon: 'fa-truck', level: 0 },

        // بخش 3: ماشین‌آلات سنگین
        { id: 'm11', name: 'تراک میکسر', profit: 10000, basePrice: 200000, icon: 'fa-truck-monster', level: 0 },
        { id: 'm12', name: 'پمپ دکل', profit: 14000, basePrice: 350000, icon: 'fa-industry', level: 0 },
        { id: 'm13', name: 'تاور کرین', profit: 20000, basePrice: 600000, icon: 'fa-building', level: 0 },
        { id: 'm14', name: 'لودر کاترپیلار', profit: 30000, basePrice: 1000000, icon: 'fa-tractor', level: 0 },

        // بخش 4: شرکت داری
        { id: 'm15', name: 'دفتر فنی', profit: 50000, basePrice: 2500000, icon: 'fa-laptop-house', level: 0 },
        { id: 'm16', name: 'آزمایشگاه بتن', profit: 80000, basePrice: 5000000, icon: 'fa-flask', level: 0 },
        { id: 'm17', name: 'کارخانه شن و ماسه', profit: 150000, basePrice: 10000000, icon: 'fa-mountain', level: 0 },
        { id: 'm18', name: 'پتروشیمی', profit: 300000, basePrice: 50000000, icon: 'fa-oil-can', level: 0 },
        { id: 'm19', name: 'برج‌سازی دبی', profit: 600000, basePrice: 200000000, icon: 'fa-city', level: 0 },
        { id: 'm20', name: 'وزارت راه', profit: 1000000, basePrice: 1000000000, icon: 'fa-globe', level: 0 }
    ];


    // --- المان‌های DOM ---
    const balanceEl = document.getElementById('balance');
    const energyEl = document.getElementById('energy-text');
    const energyFill = document.getElementById('energy-fill');
    const pphEl = document.getElementById('pph-value');
    const toastEl = document.getElementById('toast');
    
    // --- راه‌اندازی اولیه ---
    init();

    function init() {
        // 1. حذف لودینگ
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            checkOfflineEarnings(); // بررسی درآمد زمان غیبت
        }, 2500);

        // 2. لود کردن لول آیتم‌های بازار
        marketItems.forEach(item => {
            const savedLvl = localStorage.getItem(`item_lvl_${item.id}`);
            if(savedLvl) item.level = parseInt(savedLvl);
        });

        // 3. بروزرسانی UI اولیه
        updateUI();
        renderMarket();

        // 4. شروع لوپ‌ها
        startEnergyRegen();
        startPassiveIncome();
        
        // 5. لیسنر کلیک اصلی
        document.getElementById('coin-btn').addEventListener('touchstart', handleTap);
        document.getElementById('coin-btn').addEventListener('click', handleTap); // Fallback for desktop
    }

    // --- توابع UI و ذخیره‌سازی ---
        function updateUI() {
        balanceEl.innerText = balance.toLocaleString();
        energyEl.innerText = `${Math.floor(energy)} / ${maxEnergy}`;
        energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
        pphEl.innerText = pph.toLocaleString();
        
        updateRank(); // <--- این خط جدید است
    }

    function saveData() {
        localStorage.setItem('balance', balance);
        localStorage.setItem('energy', energy);
        localStorage.setItem('pph', pph);
        localStorage.setItem('lastSaveTime', Date.now());
    }

    function showToast(msg) {
        toastEl.innerText = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2000);
    }

    // --- لاجیک کلیک (Mining) ---
    function handleTap(e) {
        e.preventDefault(); // جلوگیری از زوم دبل کلیک
        if (energy >= 1) {
            const tapPower = 1 + Math.floor(pph / 10000); // قدرت کلیک کمی با pph زیاد میشه
            balance += tapPower;
            energy -= 1;
            updateUI();
            
            // ویبره کوچک
            if(navigator.vibrate) navigator.vibrate(10); 
            
            // انیمیشن شناور (Floating Text) - ساده شده
            const rect = e.target.getBoundingClientRect();
            showFloatingText(rect.left + rect.width/2, rect.top, `+${tapPower}`);
        }
    }
    
    function showFloatingText(x, y, text) {
        const el = document.createElement('div');
        el.innerText = text;
        el.style.position = 'fixed';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = '#fff';
        el.style.fontWeight = 'bold';
        el.style.pointerEvents = 'none';
        el.style.transition = 'all 0.5s ease-out';
        document.body.appendChild(el);
        
        setTimeout(() => {
            el.style.transform = 'translateY(-50px)';
            el.style.opacity = '0';
        }, 10);
        
        setTimeout(() => el.remove(), 500);
    }

    // --- سیستم انرژی و سود خودکار ---
    function startEnergyRegen() {
        setInterval(() => {
            if (energy < maxEnergy) {
                energy += 1;
                updateUI();
            }
        }, 1000);
    }

    function startPassiveIncome() {
        // پرداخت سود هر 3 ثانیه
        setInterval(() => {
            if (pph > 0) {
                const profitPerSec = pph / 3600;
                balance += (profitPerSec * 3); // چون 3 ثانیه صبر کردیم
                updateUI();
                saveData(); // سیو مداوم برای جلوگیری از پریدن دیتا
            }
        }, 3000);
    }

    // --- سیستم بازار (Market System) ---
    function renderMarket() {
        const grid = document.getElementById('market-grid');
        grid.innerHTML = '';

        marketItems.forEach(item => {
            // فرمول قیمت: BasePrice * (1.6 ^ Level)
            let price = Math.floor(item.basePrice * Math.pow(1.6, item.level));
            let canBuy = balance >= price;
            
            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <div class="m-icon"><i class="fas ${item.icon}"></i></div>
                <div class="m-info">
                    <h4>${item.name}</h4>
                    <p>سود: +${item.profit}/ساعت</p>
                    <span class="m-lvl">لول: ${item.level}</span>
                </div>
                <button class="m-buy-btn ${canBuy ? 'active' : ''}" onclick="window.buyItem('${item.id}')">
                    <span class="price-tag">${formatNum(price)}</span>
                    <span class="coin-label">سکه</span>
                </button>
            `;
            grid.appendChild(card);
        });
    }

    // تابع گلوبال برای دکمه خرید
    window.buyItem = function(id) {
        const item = marketItems.find(i => i.id === id);
        if(!item) return;

        let price = Math.floor(item.basePrice * Math.pow(1.6, item.level));

        if (balance >= price) {
            balance -= price;
            item.level++;
            pph += item.profit;
            
            // ذخیره تکی آیتم
            localStorage.setItem(`item_lvl_${item.id}`, item.level);
            
            updateUI();
            saveData();
            renderMarket(); // رندر دوباره برای آپدیت قیمت‌ها
            showToast(`${item.name} ارتقا یافت!`);
            if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            showToast('سکه کافی نیست!');
        }
    };

    function formatNum(num) {
        if(num >= 1000000) return (num/1000000).toFixed(1) + 'M';
        if(num >= 1000) return (num/1000).toFixed(1) + 'K';
        return num;
    }

    // --- سیستم آفلاین (Offline Earnings) ---
    function checkOfflineEarnings() {
        const now = Date.now();
        const diffSeconds = (now - lastSaveTime) / 1000;
        
        // اگر بیشتر از 60 ثانیه نبودن و pph دارند
        if (diffSeconds > 60 && pph > 0) {
            // حداکثر سود برای 3 ساعت (10800 ثانیه)
            const effectiveTime = Math.min(diffSeconds, 10800); 
            const earned = Math.floor((pph / 3600) * effectiveTime);
            
            if (earned > 0) {
                document.getElementById('offline-amount').innerText = `+${earned.toLocaleString()}`;
                document.getElementById('offline-modal').style.display = 'flex';
                
                // تابع دریافت (داخل مودال)
                window.claimOffline = function() {
                    balance += earned;
                    updateUI();
                    saveData();
                    document.getElementById('offline-modal').style.display = 'none';
                };
            }
        }
    }

    // --- ناوبری (Navigation) ---
    window.switchTab = function(tabId) {
        // مخفی کردن همه ویوها
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        // نمایش ویوی انتخاب شده
        document.getElementById(`${tabId}-view`).classList.add('active');
        
        // آپدیت اکتیو بودن دکمه‌ها
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        // پیدا کردن دکمه مربوطه (ساده‌سازی شده با ایندکس)
        const navMap = { 'home': 0, 'market': 1, 'tools': 2, 'earn': 3 };
        document.querySelectorAll('.nav-item')[navMap[tabId]].classList.add('active');
    };

    // --- ابزارها و تسک‌ها (Placeholder Logic) ---
    window.openTool = function(type) {
        const modal = document.getElementById('tool-modal');
        modal.style.display = 'flex';
        document.getElementById('modal-title').innerText = 'محاسبه حجم بتن';
    };

    window.closeModal = function() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    };

    window.calculateConcrete = function() {
        const l = parseFloat(document.getElementById('inp-l').value);
        const w = parseFloat(document.getElementById('inp-w').value);
        const h = parseFloat(document.getElementById('inp-h').value);
        if(l && w && h) {
            document.getElementById('calc-result').innerHTML = 
                `<div style="margin-top:10px; color:#f1c40f;">حجم: ${(l*w*h).toFixed(2)} متر مکعب</div>`;
        }
    };
    
    window.completeTask = function(btn, reward) {
        if(btn.disabled) return;
        btn.innerText = 'در حال بررسی...';
        setTimeout(() => {
            balance += reward;
            updateUI();
            saveData();
            btn.innerText = 'انجام شد';
            btn.disabled = true;
            btn.style.background = '#2ecc71';
            showToast(`+${reward} سکه دریافت شد`);
        }, 2000);
    };
});
    // تعریف لول‌های کاربری (Rank)
    const userRanks = [
        { name: 'ترم یکی', min: 0 },
        { name: 'نقشه‌بردار', min: 5000 },
        { name: 'سرپرست کارگاه', min: 25000 },
        { name: 'مهندس ناظر', min: 100000 },
        { name: 'پیمانکار جزء', min: 500000 },
        { name: 'پیمانکار کل', min: 2000000 },
        { name: 'انبوه ساز', min: 10000000 },
        { name: 'سلطان بتن', min: 50000000 },
        { name: 'وزیر مسکن', min: 200000000 }
    ];

    // تابع آپدیت لول (این را در updateUI صدا می‌زنیم)
    function updateRank() {
        let currentRankName = userRanks[0].name;
        let currentRankIdx = 1; // برای نمایش Lv.1

        for (let i = 0; i < userRanks.length; i++) {
            if (balance >= userRanks[i].min) {
                currentRankName = userRanks[i].name;
                currentRankIdx = i + 1;
            } else {
                break; 
            }
        }
        
        document.getElementById('username').innerText = currentRankName;
        document.getElementById('level-value').innerText = currentRankIdx;
        
        // آپدیت پروگرس بار (اختیاری اما جذاب)
        // می‌توانیم رنگ دور دکمه سکه را بر اساس لول عوض کنیم
    }
