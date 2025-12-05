document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Telegram Web App ---
    const tg = window.Telegram.WebApp;
    tg.expand(); // Expand the web app to full screen

    // --- DOM Elements ---
    const balanceEl = document.getElementById('balance');
    const pphEl = document.getElementById('pph-value');
    const coinButton = document.getElementById('coin-button');
    const energyEl = document.getElementById('energy');
    const energyFill = document.querySelector('.energy-bar-fill');
    const marketList = document.getElementById('market-list');
    const taskList = document.getElementById('task-list');

    // --- Game State Variables ---
    let balance = 0;
    let pph = 0; // Profit Per Hour
    let energy = 1000;
    const maxEnergy = 1000;
    const tapValue = 1; // Coins per tap

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

    const tasks = [
        { id: 't1', name: 'عضویت در کانال تلگرام', reward: 5000, completed: false, icon: 'fab fa-telegram' },
        { id: 't2', name: 'دنبال کردن در اینستاگرام', reward: 5000, completed: false, icon: 'fab fa-instagram' },
        { id: 't3', name: 'دعوت از ۳ دوست', reward: 25000, completed: false, icon: 'fa-user-friends' },
    ];
    
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


    // --- Core Functions ---
    function hapticFeedback() {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
    
    function calculatePrice(item) {
        return Math.floor(item.basePrice * Math.pow(1.6, item.level));
    }

    function recalculatePPH() {
        pph = marketItems.reduce((total, item) => {
            return total + (item.profit * item.level);
        }, 0);
    }
    
    function updateRank() {
        let currentRankName = userRanks[0].name;
        let currentRankIdx = 1;

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
    }

    function updateUI() {
        balanceEl.innerText = balance.toLocaleString();
        energyEl.innerText = `${Math.floor(energy)} / ${maxEnergy}`;
        energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
        pphEl.innerText = pph.toLocaleString();
        updateRank(); // آپدیت رنک کاربر
    }

    // --- Data Persistence (Save/Load) ---
    function saveData() {
        const gameState = {
            balance: balance,
            pph: pph,
            energy: energy,
            marketLevels: marketItems.map(item => ({ id: item.id, level: item.level })),
            taskStatus: tasks.map(task => ({id: task.id, completed: task.completed})),
            lastSaveTime: new Date().getTime()
        };
        localStorage.setItem('civilAirdropState', JSON.stringify(gameState));
    }

    function loadData() {
        const savedState = localStorage.getItem('civilAirdropState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            balance = gameState.balance || 0;
            energy = gameState.energy !== undefined ? gameState.energy : maxEnergy;
            
            if (gameState.marketLevels) {
                gameState.marketLevels.forEach(savedItem => {
                    const item = marketItems.find(i => i.id === savedItem.id);
                    if (item) {
                        item.level = savedItem.level;
                    }
                });
            }
            if (gameState.taskStatus) {
                gameState.taskStatus.forEach(savedTask => {
                   const task = tasks.find(t => t.id === savedTask.id);
                   if(task) task.completed = savedTask.completed;
                });
            }

            recalculatePPH();
            calculateOfflineEarnings(gameState.lastSaveTime);
        }
        populateMarket();
        populateTasks();
        updateUI();
    }
    
    function calculateOfflineEarnings(lastSaveTime) {
        if (!lastSaveTime) return;

        const currentTime = new Date().getTime();
        const timeDiffSeconds = Math.floor((currentTime - lastSaveTime) / 1000);
        
        // Max 3 hours of offline earning
        const offlineSeconds = Math.min(timeDiffSeconds, 3 * 3600); 
        
        if (offlineSeconds > 10) { // Only show if more than 10 seconds offline
            const offlineEarnings = Math.floor((pph / 3600) * offlineSeconds);
            balance += offlineEarnings;
            
            document.getElementById('offline-earnings').innerText = `+${offlineEarnings.toLocaleString()}`;
            document.getElementById('offline-earning-modal').style.display = 'flex';
        }
    }


    // --- Event Handlers & Dynamic Population ---
    coinButton.addEventListener('click', (e) => {
        if (energy >= tapValue) {
            balance += tapValue;
            energy -= tapValue;
            updateUI();
            hapticFeedback();

            // Create and animate floating number
            const floatingText = document.createElement('span');
            floatingText.className = 'floating-text';
            floatingText.innerText = `+${tapValue}`;
            
            const rect = coinButton.getBoundingClientRect();
            // Position randomly around the click
            const x = e.clientX - rect.left + (Math.random() * 40 - 20);
            const y = e.clientY - rect.top - 30;
            
            floatingText.style.left = `${x}px`;
            floatingText.style.top = `${y}px`;
            
            coinButton.parentElement.appendChild(floatingText);

            setTimeout(() => {
                floatingText.remove();
            }, 1000);
        }
    });

    function populateMarket() {
        marketList.innerHTML = '';
        marketItems.forEach(item => {
            const price = calculatePrice(item);
            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <div class="card-icon"><i class="fas ${item.icon}"></i></div>
                <div class="card-details">
                    <h4>${item.name}</h4>
                    <p>سود: ${item.profit.toLocaleString()} / ساعت</p>
                    <p>قیمت: <span class="price-tag">${price.toLocaleString()}</span></p>
                </div>
                <div class="card-level">Lv. ${item.level}</div>
            `;
            card.onclick = () => openItemModal(item);
            marketList.appendChild(card);
        });
    }

    function populateTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-card ${task.completed ? 'completed' : ''}`;
            taskEl.innerHTML = `
                <i class="${task.icon}"></i>
                <span>${task.name}</span>
                <span class="task-reward">+${task.reward.toLocaleString()}</span>
            `;
            if (!task.completed) {
                taskEl.onclick = () => completeTask(task.id);
            }
            taskList.appendChild(taskEl);
        });
    }
    
    function completeTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            balance += task.reward;
            hapticFeedback();
            populateTasks();
            updateUI();
        }
    }


    // --- Modal Management ---
    window.openItemModal = (item) => {
        const modal = document.getElementById('item-modal');
        const body = document.getElementById('item-modal-body');
        const price = calculatePrice(item);

        body.innerHTML = `
            <i class="fas ${item.icon} modal-icon"></i>
            <h2>${item.name}</h2>
            <p>سطح فعلی: ${item.level}</p>
            <p>سود در ساعت: ${item.profit.toLocaleString()}</p>
            <hr>
            <h4>ارتقا به سطح ${item.level + 1}</h4>
            <p>هزینه ارتقا: <span class="price-tag">${price.toLocaleString()}</span></p>
            <button id="buy-btn" class="modal-button ${balance < price ? 'disabled' : ''}" onclick="buyItem('${item.id}')">خرید</button>
        `;
        modal.style.display = 'flex';
    };

    window.buyItem = (itemId) => {
        const item = marketItems.find(i => i.id === itemId);
        if (!item) return;

        const price = calculatePrice(item);
        if (balance >= price) {
            balance -= price;
            item.level++;
            recalculatePPH();
            populateMarket();
            updateUI();
            closeModal('item-modal');
            hapticFeedback();
        } else {
            alert("موجودی کافی نیست!");
        }
    };
    
    // --- سیستم ابزارها (پیشرفته) ---
    window.openTool = function(type) {
        const modal = document.getElementById('tool-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        modal.style.display = 'flex';
        
        if (type === 'concrete') {
            title.innerText = 'محاسبه حجم بتن';
            body.innerHTML = `
                <div class="calc-form">
                    <input type="number" id="c-l" placeholder="طول (متر)">
                    <input type="number" id="c-w" placeholder="عرض (متر)">
                    <input type="number" id="c-h" placeholder="ضخامت (متر)">
                    <button onclick="calcConcreteAction()">محاسبه</button>
                    <div id="calc-res"></div>
                </div>`;
        } else if (type === 'rebar') {
            title.innerText = 'محاسبه وزن میلگرد';
            body.innerHTML = `
                <div class="calc-form">
                    <input type="number" id="r-d" placeholder="نمره میلگرد (مثلا 16)">
                    <input type="number" id="r-l" placeholder="طول کل (متر)">
                    <button onclick="calcRebarAction()">محاسبه</button>
                    <div id="calc-res"></div>
                </div>`;
        } else if (type === 'brick') {
            title.innerText = 'تعداد آجر دیوار';
            body.innerHTML = `
                <div class="calc-form">
                    <input type="number" id="b-l" placeholder="طول دیوار (متر)">
                    <input type="number" id="b-h" placeholder="ارتفاع دیوار (متر)">
                    <p style="font-size:0.7rem; color:#aaa;">دیوار ۲۰ سانتی فرض شده</p>
                    <button onclick="calcBrickAction()">محاسبه</button>
                    <div id="calc-res"></div>
                </div>`;
        } else if (type === 'slope') {
            title.innerText = 'محاسبه شیب رمپ';
            body.innerHTML = `
                <div class="calc-form">
                    <input type="number" id="s-h" placeholder="اختلاف ارتفاع (متر)">
                    <input type="number" id="s-l" placeholder="طول افقی (متر)">
                    <button onclick="calcSlopeAction()">محاسبه</button>
                    <div id="calc-res"></div>
                </div>`;
        }
    };

    // توابع محاسباتی
    window.calcConcreteAction = function() {
        const l = document.getElementById('c-l').value, w = document.getElementById('c-w').value, h = document.getElementById('c-h').value;
        if(l&&w&&h) showResult(l*w*h, 'متر مکعب');
    };
    window.calcRebarAction = function() {
        const d = document.getElementById('r-d').value, l = document.getElementById('r-l').value;
        if(d&&l) showResult(((d*d)/162)*l, 'کیلوگرم');
    };
    window.calcBrickAction = function() {
        const l = document.getElementById('b-l').value, h = document.getElementById('b-h').value;
        if(l&&h) showResult(l*h*100, 'عدد آجر');
    };
    window.calcSlopeAction = function() {
        const h = document.getElementById('s-h').value, l = document.getElementById('s-l').value;
        if(h&&l) showResult((h/l)*100, 'درصد');
    };

    function showResult(val, unit) {
        document.getElementById('calc-res').innerHTML = 
            `<div style="margin-top:15px; padding:10px; background:#333; border-radius:5px; color:#f1c40f; font-weight:bold;">
                نتیجه: ${val.toFixed(2)} ${unit}
            </div>`;
    }

    window.closeModal = (modalId) => {
        document.getElementById(modalId).style.display = 'none';
    };


    // --- SPA Navigation ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetViewId = btn.getAttribute('data-view');
            
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(targetViewId).classList.add('active');
            
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });


    // --- Game Loop and Intervals ---
    // Passive Income
    setInterval(() => {
        const profitPerSecond = pph / 3600;
        balance += profitPerSecond * 3; // Update every 3 seconds
        updateUI();
    }, 3000);

    // Energy Regeneration
    setInterval(() => {
        if (energy < maxEnergy) {
            energy = Math.min(maxEnergy, energy + 2); // Regenerate 2 energy per second
            updateUI();
        }
    }, 1000);

    // Auto-save progress
    setInterval(saveData, 10000); // Save every 10 seconds

    // --- App Initialization ---
    // Hide splash screen and show app after a delay
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        loadData(); // Load data after showing the app
    }, 2000);
});
