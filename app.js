// Game State
let gameState = {
    balance: 0,
    pph: 0, // Profit Per Hour
    clickValue: 1,
    energy: 500,
    maxEnergy: 500,
    level: 1,
    lastLogin: Date.now(),
    inventory: {}, // Bought items
    dailyReward: {
        lastClaim: 0,
        streak: 0
    },
    completedTasks: [] // Added for task tracking
};

// Constants
const LEVELS = [
    { name: "کارگر ساده", min: 0 },
    { name: "سرکارگر", min: 5000 },
    { name: "مهندس ناظر", min: 25000 },
    { name: "مهندس ارشد", min: 100000 },
    { name: "مدیر پروژه", min: 500000 },
    { name: "وزیر مسکن", min: 2000000 }
];

// Market Items Data (20 Items)
const MARKET_ITEMS = [
    { id: 'brick', name: 'آجر', cost: 100, profit: 10, icon: 'fa-cube' },
    { id: 'cement', name: 'سیمان', cost: 500, profit: 55, icon: 'fa-archive' },
    { id: 'sand', name: 'masseh', cost: 200, profit: 20, icon: 'fa-mountain' },
    { id: 'gravel', name: 'شن', cost: 200, profit: 20, icon: 'fa-shapes' },
    { id: 'shovel', name: 'بیل', cost: 50, profit: 5, icon: 'fa-hammer' },
    { id: 'wheelbarrow', name: 'فرغون', cost: 700, profit: 75, icon: 'fa-shopping-cart' },
    { id: 'helmet', name: 'کلاه ایمنی', cost: 1000, profit: 110, icon: 'fa-hard-hat' },
    { id: 'vest', name: 'جلیقه کار', cost: 800, profit: 85, icon: 'fa-tshirt' },
    { id: 'boots', name: 'پوتین', cost: 600, profit: 60, icon: 'fa-shoe-prints' },
    { id: 'pickaxe', name: 'کلنگ', cost: 400, profit: 40, icon: 'fa-tools' },
    { id: 'mixer', name: 'میکسر بتن', cost: 5000, profit: 600, icon: 'fa-truck-monster' },
    { id: 'truck', name: 'کامیون', cost: 10000, profit: 1200, icon: 'fa-truck' },
    { id: 'crane', name: 'جرثقیل', cost: 50000, profit: 6500, icon: 'fa-chess-rook' },
    { id: 'bulldozer', name: 'بولدوزر', cost: 30000, profit: 3500, icon: 'fa-snowplow' },
    { id: 'roller', name: 'غلتک', cost: 25000, profit: 3000, icon: 'fa-road' },
    { id: 'steel_beam', name: 'تیرآهن', cost: 2000, profit: 220, icon: 'fa-bars' },
    { id: 'scaffold', name: 'داربست', cost: 1500, profit: 160, icon: 'fa-dungeon' },
    { id: 'generator', name: 'ژنراتور', cost: 8000, profit: 900, icon: 'fa-charging-station' },
    { id: 'theodolite', name: 'دوربین نقشه‌برداری', cost: 12000, profit: 1400, icon: 'fa-camera' },
    { id: 'blueprint', name: 'نقشه ساختمان', cost: 6000, profit: 700, icon: 'fa-map' }
];

// Tasks Data
const TASKS = [
    { id: 'tg_join', title: 'عضویت در تلگرام', reward: 5000, icon: 'telegram', link: 'https://t.me/civil_city' },
    { id: 'x_follow', title: 'فالو در X (توییتر)', reward: 5000, icon: 'twitter', link: 'https://x.com/civil_city' },
    { id: 'yt_sub', title: 'سابسکرایب یوتیوب', reward: 10000, icon: 'youtube', link: 'https://youtube.com' },
    { id: 'ig_follow', title: 'فالو اینستاگرام', reward: 5000, icon: 'instagram', link: 'https://instagram.com' },
    { id: 'invite_3', title: 'دعوت از ۳ دوست', reward: 25000, icon: 'friends', link: '#' },
    { id: 'visit_site', title: 'بازدید از سایت', reward: 2000, icon: 'website', link: 'https://google.com' }
];

// Total Supply for CVC
const TOTAL_SUPPLY = 100000000000; // 100 Billion

// Load Game
function loadGame() {
    const saved = localStorage.getItem('civilCitySave');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
    }
    updateUI();
    initMarket();
    initTasks();
    checkDailyReward();
    startTimers();
}

// Save Game
function saveGame() {
    localStorage.setItem('civilCitySave', JSON.stringify(gameState));
}

// Update UI
function updateUI() {
    document.getElementById('balance').innerText = Math.floor(gameState.balance).toLocaleString();
    document.getElementById('profit-per-hour').innerText = `${gameState.pph.toLocaleString()} سکه/ساعت`;
    
    // Level Logic
    let currentRank = LEVELS[0].name;
    for (let l of LEVELS) {
        if (gameState.balance >= l.min) currentRank = l.name;
    }
    document.getElementById('user-rank').innerText = currentRank;

    // Energy
    document.getElementById('energy-text').innerText = `${Math.floor(gameState.energy)} / ${gameState.maxEnergy}`;
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    document.getElementById('energy-fill').style.width = `${energyPercent}%`;
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`content-${sectionId}`).classList.add('active');
    
    // Find nav item to highlight
    const navItems = document.querySelectorAll('.nav-item');
    if(sectionId === 'main') navItems[0].classList.add('active');
    if(sectionId === 'market') navItems[1].classList.add('active');
    if(sectionId === 'earn') navItems[2].classList.add('active');
    if(sectionId === 'tools') navItems[3].classList.add('active');
    if(sectionId === 'airdrop') navItems[4].classList.add('active');
}

// Click Logic
document.getElementById('click-btn').addEventListener('click', (e) => {
    if (gameState.energy >= 1) {
        gameState.balance += gameState.clickValue;
        gameState.energy -= 1;
        
        // Floating Text
        const rect = e.target.getBoundingClientRect();
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.innerText = `+${gameState.clickValue}`;
        floatText.style.left = `${e.clientX - 20}px`;
        floatText.style.top = `${e.clientY - 50}px`;
        document.body.appendChild(floatText);
        setTimeout(() => floatText.remove(), 1000);

        updateUI();
        saveGame();
    }
});

// Market Logic
function initMarket() {
    const container = document.getElementById('market-items');
    container.innerHTML = '';
    
    MARKET_ITEMS.forEach(item => {
        const level = gameState.inventory[item.id] || 0;
        // Cost formula: Base * (1.15 ^ level)
        const currentCost = Math.floor(item.cost * Math.pow(1.15, level));
        
        const div = document.createElement('div');
        div.className = 'market-item';
        div.innerHTML = `
            <div class="item-header">
                <i class="fas ${item.icon} item-icon"></i>
                <div>
                    <h4>${item.name}</h4>
                    <span class="item-price">لول: ${level}</span>
                </div>
            </div>
            <div class="item-profit">+${item.profit} PPH</div>
            <button class="buy-btn" onclick="buyItem('${item.id}')">
                خرید (${currentCost.toLocaleString()})
            </button>
        `;
        container.appendChild(div);
    });
}

function buyItem(itemId) {
    const item = MARKET_ITEMS.find(i => i.id === itemId);
    const level = gameState.inventory[itemId] || 0;
    const cost = Math.floor(item.cost * Math.pow(1.15, level));

    if (gameState.balance >= cost) {
        gameState.balance -= cost;
        gameState.pph += item.profit;
        gameState.inventory[itemId] = level + 1;
        
        updateUI();
        initMarket(); // Refresh prices
        saveGame();
    } else {
        alert('سکه کافی نیست!');
    }
}

// Earn Tasks Logic
function initTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';

    TASKS.forEach(task => {
        const isCompleted = gameState.completedTasks.includes(task.id);
        let btnHtml = '';

        if (isCompleted) {
            btnHtml = `<button class="task-btn completed"><i class="fas fa-check"></i></button>`;
        } else {
            // If user clicked "Start", allow "Claim" after delay, else show "Start"
            // Currently simplistic: Click -> Wait -> Claim
            btnHtml = `<button id="btn-${task.id}" class="task-btn" onclick="handleTask('${task.id}')">انجام</button>`;
        }

        const div = document.createElement('div');
        div.className = 'task-card';
        div.innerHTML = `
            <div class="task-info">
                <i class="fab fa-${task.icon} task-icon ${task.icon}"></i>
                <div class="task-text">
                    <h4>${task.title}</h4>
                    <p>+${task.reward.toLocaleString()}</p>
                </div>
            </div>
            ${btnHtml}
        `;
        list.appendChild(div);
    });
}

function handleTask(taskId) {
    const task = TASKS.find(t => t.id === taskId);
    const btn = document.getElementById(`btn-${taskId}`);
    
    if (btn.innerText === 'انجام') {
        // Step 1: Open Link
        window.open(task.link, '_blank');
        
        // Step 2: Simulate Check Delay
        btn.innerText = 'چک کردن...';
        btn.style.opacity = '0.7';
        
        setTimeout(() => {
            btn.innerText = 'دریافت';
            btn.classList.add('claim-ready');
            btn.style.opacity = '1';
        }, 5000); // 5 seconds delay
    } else if (btn.innerText === 'دریافت') {
        // Step 3: Claim Reward
        gameState.balance += task.reward;
        gameState.completedTasks.push(taskId);
        updateUI();
        saveGame();
        initTasks(); // Re-render to show checkmark
    }
}

// Daily Reward Logic
function checkDailyReward() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const timeDiff = now - gameState.dailyReward.lastClaim;
    const card = document.querySelector('.daily-reward-card');
    const timerText = document.getElementById('daily-reward-timer');

    if (timeDiff > oneDay) {
        // Available
        card.classList.remove('disabled');
        timerText.innerText = "برای دریافت ضربه بزنید";
    } else {
        // Not Available
        card.classList.add('disabled');
        const remaining = oneDay - timeDiff;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        timerText.innerText = `${hours} ساعت و ${mins} دقیقه مانده`;
    }
}

function claimDailyReward() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - gameState.dailyReward.lastClaim > oneDay) {
        gameState.balance += 1000; // Base reward
        gameState.dailyReward.lastClaim = now;
        gameState.dailyReward.streak += 1;
        updateUI();
        saveGame();
        checkDailyReward();
        alert("جایزه روزانه 1000 سکه دریافت شد!");
    }
}

// --- NEW TOOLS LOGIC ---

// 1. Open Specific Tool
function openTool(toolId) {
    // Hide Menu
    document.getElementById('tools-menu-view').style.display = 'none';
    
    // Show Detail View Wrapper
    document.getElementById('tool-detail-view').style.display = 'block';
    
    // Hide all calculators first
    document.querySelectorAll('.tool-calculator').forEach(el => el.classList.remove('active'));
    
    // Show selected calculator
    document.getElementById(`tool-${toolId}`).classList.add('active');

    // Set Title
    const titles = {
        'concrete': 'محاسبه حجم بتن',
        'steel': 'محاسبه وزن میلگرد',
        'unit': 'تبدیل واحد',
        'slope': 'محاسبه شیب',
        'asphalt': 'محاسبه آسفالت',
        'pipe': 'محاسبه دبی لوله'
    };
    document.getElementById('active-tool-title').innerText = titles[toolId];
}

// 2. Back to Menu
function closeTool() {
    document.getElementById('tool-detail-view').style.display = 'none';
    document.getElementById('tools-menu-view').style.display = 'block';
}

// 3. Calculation Functions (Preserved Logic)
function calcConcrete() {
    const l = parseFloat(document.getElementById('c-len').value);
    const w = parseFloat(document.getElementById('c-wid').value);
    const h = parseFloat(document.getElementById('c-hei').value);
    if(l && w && h) {
        document.getElementById('res-concrete').innerText = (l*w*h).toFixed(2) + " متر مکعب";
    }
}

function calcSteel() {
    const d = parseFloat(document.getElementById('s-dia').value);
    const l = parseFloat(document.getElementById('s-len').value);
    if(d && l) {
        // (D^2 / 162) * L
        const w = ((d*d)/162) * l;
        document.getElementById('res-steel').innerText = w.toFixed(2) + " کیلوگرم";
    }
}

function calcUnit() {
    const val = parseFloat(document.getElementById('u-val').value);
    const type = document.getElementById('u-type').value;
    if(!isNaN(val)) {
        if(type === 'm2f') document.getElementById('res-unit').innerText = (val * 3.28084).toFixed(2) + " فوت";
        else document.getElementById('res-unit').innerText = (val / 3.28084).toFixed(2) + " متر";
    }
}

function calcSlope() {
    const h = parseFloat(document.getElementById('sl-h').value);
    const l = parseFloat(document.getElementById('sl-l').value);
    if(h && l) {
        const p = (h/l)*100;
        document.getElementById('res-slope').innerText = p.toFixed(2) + "%";
    }
}

function calcAsphalt() {
    const l = parseFloat(document.getElementById('a-len').value);
    const w = parseFloat(document.getElementById('a-wid').value);
    const t = parseFloat(document.getElementById('a-thick').value) / 100; // cm to m
    const d = parseFloat(document.getElementById('a-den').value);

    if (l && w && t && d) {
        const volume = l * w * t;
        const weight = volume * d;
        document.getElementById('res-asphalt').innerText = weight.toFixed(2) + " تن";
    }
}

function calcPipe() {
    const d = parseFloat(document.getElementById('p-dia').value) / 1000; // mm to m
    const v = parseFloat(document.getElementById('p-vel').value);

    if (d && v) {
        // Area = pi * r^2 = pi * (d/2)^2
        const area = Math.PI * Math.pow(d / 2, 2);
        const discharge = area * v; // m3/s
        const dischargeLit = discharge * 1000; // Lit/s
        document.getElementById('res-pipe').innerText = dischargeLit.toFixed(2) + " لیتر/ثانیه";
    }
}

// Timers (PPH & Energy)
function startTimers() {
    // PPH every 1 sec (1/3600 of hourly profit)
    setInterval(() => {
        if(gameState.pph > 0) {
            gameState.balance += gameState.pph / 3600;
            updateUI();
            saveGame();
        }
    }, 1000);

    // Energy Regen
    setInterval(() => {
        if(gameState.energy < gameState.maxEnergy) {
            gameState.energy += 1; // 1 energy per sec
            updateUI();
        }
    }, 1000);
    
    // Airdrop Countdown
    setInterval(() => {
        const targetDate = new Date('2025-12-30T00:00:00'); 
        const now = new Date();
        const diff = targetDate - now;
        
        if(diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            document.getElementById('timer').innerText = `${days}:${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

// Initialize
window.onload = loadGame;
