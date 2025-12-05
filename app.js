document.addEventListener('DOMContentLoaded', () => {
    // Game State
    let gameState = {
        balance: 0,
        energy: 1000,
        maxEnergy: 1000,
        energyPerClick: 1,
        energyRecoveryRate: 1, // per second
        pph: 0, // Profit Per Hour
        rank: 1,
        lastOnline: new Date().getTime(),
        dailyReward: {
            lastClaimedDay: -1,
            streak: 0
        },
        marketItems: {}, // level of each item
        completedTasks: [] // Array of task IDs
    };

    const CIVIL_TOKEN_SUPPLY = 100000000000;
    const AIRDROP_END_DATE = new Date('2026-03-21T00:00:00'); // Persian New Year!

    // DOM Elements
    const balanceEl = document.getElementById('balance');
    const energyEl = document.getElementById('energy');
    const maxEnergyEl = document.getElementById('max-energy');
    const clickerBtn = document.getElementById('clicker-btn');
    const pphValueEl = document.getElementById('pph-value');
    const rankNameEl = document.getElementById('rank-name');

    // Views
    const views = document.querySelectorAll('.view');
    const navItems = document.querySelectorAll('.nav-item');

    // Modals
    const dailyRewardModal = document.getElementById('daily-reward-modal');
    const inviteModal = document.getElementById('invite-modal');
    const dailyRewardBtn = document.getElementById('daily-reward-btn');
    const inviteBtn = document.getElementById('invite-btn');
    const claimDailyRewardBtn = document.getElementById('claim-daily-reward-btn');
    const calendarGrid = document.querySelector('.calendar-grid');

    // Market & Tasks
    const marketItemsContainer = document.getElementById('market-items');
    const tasksContainer = document.getElementById('tasks-list');

    // Airdrop
    const countdownEl = document.getElementById('airdrop-countdown');
    const estimatedAirdropEl = document.getElementById('estimated-airdrop');

    const RANKS = [
        { level: 1, name: "ترم یکی", threshold: 0 },
        { level: 2, name: "مهندس تازه‌کار", threshold: 5000 },
        { level: 3, name: "کمک مهندس", threshold: 25000 },
        { level: 4, name: "مهندس", threshold: 100000 },
        { level: 5, name: "مهندس ارشد", threshold: 500000 },
        { level: 6, name: "سرپرست کارگاه", threshold: 2000000 },
        { level: 7, name: "رئیس کارگاه", threshold: 10000000 },
        { level: 8, name: "پیمانکار", threshold: 50000000 },
        { level: 9, name: "سازنده برج", threshold: 250000000 },
        { level: 10, name: "وزیر مسکن", threshold: 1000000000 },
    ];

    const MARKET_STRUCTURE = [
        { id: 'helmet', name: 'کلاه ایمنی', basePrice: 50, pph: 1, icon: 'fa-hard-hat' },
        { id: 'vest', name: 'جلیقه', basePrice: 200, pph: 3, icon: 'fa-tshirt' },
        { id: 'trolley', name: 'فرغون', basePrice: 1000, pph: 10, icon: 'fa-dolly' },
        { id: 'mixer', name: 'میکسر بتن', basePrice: 5000, pph: 40, icon: 'fa-truck-monster' },
        { id: 'dumper', name: 'دامپر', basePrice: 20000, pph: 150, icon: 'fa-truck-pickup' },
        { id: 'truck', name: 'کامیون', basePrice: 100000, pph: 500, icon: 'fa-truck' },
        { id: 'blueprint', name: 'نقشه معماری', basePrice: 400000, pph: 1500, icon: 'fa-ruler-combined' },
        { id: 'supervisor', name: 'تیم کارگری', basePrice: 1500000, pph: 5000, icon: 'fa-users' },
        { id: 'architect', name: 'مهندس ناظر', basePrice: 5000000, pph: 15000, icon: 'fa-user-tie' },
        { id: 'license', name: 'پروانه ساخت', basePrice: 12000000, pph: 35000, icon: 'fa-file-signature' },
        { id: 'crane', name: 'جرثقیل', basePrice: 30000000, pph: 80000, icon: 'fa-crane' },
        { id: 'excavator', name: 'بیل مکانیکی', basePrice: 75000000, pph: 180000, icon: 'fa-tractor' },
        { id: 'land', name: 'خرید زمین', basePrice: 200000000, pph: 400000, icon: 'fa-map-marked-alt' },
        { id: 'scaffolding', name: 'داربست', basePrice: 500000000, pph: 900000, icon: 'fa-border-all' },
        { id: 'concrete_pump', name: 'پمپ بتن', basePrice: 1200000000, pph: 2000000, icon: 'fa-pump-soap' },
        { id: 'asphalt_paver', name: 'دستگاه آسفالت', basePrice: 3000000000, pph: 4500000, icon: 'fa-road' },
        { id: 'office', name: 'دفتر فنی', basePrice: 7000000000, pph: 10000000, icon: 'fa-building' },
        { id: 'consulting_firm', name: 'شرکت مشاور', basePrice: 15000000000, pph: 20000000, icon: 'fa-sitemap' },
        { id: 'city_contract', name: 'قرارداد شهری', basePrice: 35000000000, pph: 45000000, icon: 'fa-city' },
        { id: 'megaproject', name: 'مگا پروژه', basePrice: 100000000000, pph: 100000000, icon: 'fa-landmark' }
    ];
    
    const TASKS = [
        { id: 'join_tg', title: 'عضویت در کانال تلگرام', reward: 5000, icon: 'fa-telegram', url: 'https://telegram.org' },
        { id: 'follow_x', title: 'فالو کردن در توییتر (X)', reward: 5000, icon: 'fa-twitter', url: 'https://twitter.com' },
        { id: 'sub_yt', title: 'سابسکرایب یوتیوب', reward: 10000, icon: 'fa-youtube', url: 'https://youtube.com' },
        { id: 'follow_insta', title: 'فالو کردن اینستاگرام', reward: 5000, icon: 'fa-instagram', url: 'https://instagram.com' },
        { id: 'invite_3', title: 'دعوت از ۳ دوست', reward: 25000, icon: 'fa-user-plus', url: '#' },
        { id: 'visit_site', title: 'بازدید از سایت عمران', reward: 2000, icon: 'fa-globe', url: 'https://google.com' }
    ];

    const DAILY_REWARDS = [500, 1000, 2000, 4000, 8000, 16000, 32000];

    // --- Initialization ---
    function init() {
        loadGameState();
        
        // Splash screen logic
        const splashScreen = document.getElementById('splash-screen');
        const gameContent = document.getElementById('game-content');
        const progress = document.querySelector('.progress');
        
        let width = 0;
        const interval = setInterval(() => {
            width += 25;
            progress.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    splashScreen.classList.add('hidden');
                    gameContent.classList.remove('hidden');
                    
                    // Start game loops after splash screen
                    setInterval(energyRecovery, 1000);
                    setInterval(passiveIncome, 1000);
                    setInterval(saveGameState, 5000);
                    
                    // Initial UI setup
                    renderMarket();
                    renderTasks();
                    renderDailyRewardCalendar();
                    updateUI();
                    updateAirdropCountdown();
                }, 500);
            }
        }, 500);
    }
    
    // --- Core Game Logic ---
    clickerBtn.addEventListener('click', () => {
        if (gameState.energy >= gameState.energyPerClick) {
            gameState.balance += gameState.energyPerClick;
            gameState.energy -= gameState.energyPerClick;
            updateUI();
            createFloatingText(`+${gameState.energyPerClick}`);
        }
    });

    function energyRecovery() {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + gameState.energyRecoveryRate);
            updateUI();
        }
    }

    function passiveIncome() {
        const incomePerSecond = gameState.pph / 3600;
        gameState.balance += incomePerSecond;
        updateUI();
    }
    
    // --- UI Update and Rendering ---
    function updateUI() {
        balanceEl.textContent = formatNumber(Math.floor(gameState.balance));
        energyEl.textContent = Math.floor(gameState.energy);
        maxEnergyEl.textContent = gameState.maxEnergy;
        pphValueEl.textContent = formatNumber(gameState.pph);
        
        updateRank();
        updateMarketItems();
        updateDailyRewardStatus();
        updateAirdropView();
    }

    function updateRank() {
        const currentRank = RANKS.slice().reverse().find(r => gameState.balance >= r.threshold);
        if (currentRank && currentRank.level !== gameState.rank) {
            gameState.rank = currentRank.level;
        }
        rankNameEl.textContent = `${currentRank.name} (Lv. ${currentRank.level})`;
    }
    
    function createFloatingText(text) {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.className = 'floating-text';
        
        const mainView = document.getElementById('main-view');
        mainView.appendChild(floatingText);
        
        const x = Math.random() * 80 + 10; 
        const y = Math.random() * 20 + 40; 
        floatingText.style.left = `${x}%`;
        floatingText.style.top = `${y}%`;
        
        setTimeout(() => {
            floatingText.remove();
        }, 2000);
    }
    
    // --- View Navigation ---
    window.showView = (viewId) => {
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');

        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = Array.from(navItems).find(item => item.getAttribute('onclick').includes(viewId));
        if(activeNavItem) activeNavItem.classList.add('active');
        
        if (viewId === 'market-view') updateMarketItems();
        if (viewId === 'airdrop-view') updateAirdropView();
        if (viewId === 'earn-view') renderTasks();
    }
    
    // --- Market Logic ---
    function renderMarket() {
        marketItemsContainer.innerHTML = '';
        MARKET_STRUCTURE.forEach(item => {
            if (!gameState.marketItems[item.id]) {
                gameState.marketItems[item.id] = 0;
            }
            
            const itemEl = document.createElement('div');
            itemEl.className = 'market-item';
            itemEl.id = `market-item-${item.id}`;
            itemEl.innerHTML = `
                <i class="fas ${item.icon}"></i>
                <div class="item-info">
                    <p>${item.name}</p>
                    <p>(Lv. <span id="level-${item.id}">0</span>) | +<span id="pph-${item.id}">${item.pph}</span> PPH</p>
                </div>
                <div class="item-price">
                    <i class="fas fa-coins"></i>
                    <span id="price-${item.id}">${formatNumber(item.basePrice)}</span>
                </div>
            `;
            itemEl.addEventListener('click', () => buyMarketItem(item.id));
            marketItemsContainer.appendChild(itemEl);
        });
        updateMarketItems();
    }
    
    function buyMarketItem(itemId) {
        const item = MARKET_STRUCTURE.find(i => i.id === itemId);
        const currentLevel = gameState.marketItems[itemId];
        const price = Math.floor(item.basePrice * Math.pow(1.15, currentLevel));
        
        if (gameState.balance >= price) {
            gameState.balance -= price;
            gameState.marketItems[itemId]++;
            gameState.pph += item.pph;
            updateUI();
        }
    }
    
    function updateMarketItems() {
        MARKET_STRUCTURE.forEach(item => {
            const currentLevel = gameState.marketItems[item.id] || 0;
            const price = Math.floor(item.basePrice * Math.pow(1.15, currentLevel));
            
            document.getElementById(`level-${item.id}`).textContent = currentLevel;
            document.getElementById(`price-${item.id}`).textContent = formatNumber(price);
            
            const itemEl = document.getElementById(`market-item-${item.id}`);
            if (gameState.balance < price) {
                itemEl.classList.add('disabled');
            } else {
                itemEl.classList.remove('disabled');
            }
        });
    }

    // --- Earn (Tasks) Logic ---
    function renderTasks() {
        tasksContainer.innerHTML = '';
        TASKS.forEach(task => {
            const isCompleted = gameState.completedTasks.includes(task.id);
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            
            let btnState = 'start';
            let btnText = 'انجام';
            if (isCompleted) {
                btnState = 'done';
                btnText = 'تکمیل';
            }

            taskEl.innerHTML = `
                <div class="task-item-icon"><i class="fab ${task.icon}"></i></div>
                <div class="task-info">
                    <span class="task-title">${task.title}</span>
                    <span class="task-reward">+${formatNumber(task.reward)} <i class="fas fa-coins"></i></span>
                </div>
                <button class="task-btn ${btnState}" id="btn-${task.id}" ${isCompleted ? 'disabled' : ''}>
                    ${btnText}
                </button>
            `;
            
            // Only add listener if not completed
            if (!isCompleted) {
                const btn = taskEl.querySelector('.task-btn');
                btn.addEventListener('click', () => handleTaskAction(task, btn));
            }
            
            tasksContainer.appendChild(taskEl);
        });
    }

    function handleTaskAction(task, btn) {
        if (btn.classList.contains('start')) {
            // Step 1: Open Link
            if(task.url !== '#') window.open(task.url, '_blank');
            
            // Simulate waiting time
            btn.textContent = 'بررسی...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.classList.remove('start');
                btn.classList.add('claim');
                btn.textContent = 'دریافت';
                btn.disabled = false;
            }, 3000); // 3 seconds delay
            
        } else if (btn.classList.contains('claim')) {
            // Step 2: Claim Reward
            gameState.balance += task.reward;
            gameState.completedTasks.push(task.id);
            
            btn.classList.remove('claim');
            btn.classList.add('done');
            btn.textContent = 'تکمیل';
            btn.disabled = true;
            
            updateUI();
            
            // Show toast or effect
            const originalText = btn.textContent;
            createFloatingText(`+${task.reward}`);
        }
    }

    // --- Daily Reward Logic ---
    function renderDailyRewardCalendar() {
        calendarGrid.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.id = `day-${i}`;
            dayEl.innerHTML = `
                <span class="day-number">روز ${i + 1}</span>
                <span class="day-reward">+${formatNumber(DAILY_REWARDS[i])}</span>
            `;
            calendarGrid.appendChild(dayEl);
        }
        updateDailyRewardStatus();
    }

    function updateDailyRewardStatus() {
        const today = new Date().getDay(); 
        const streak = gameState.dailyReward.streak;

        for (let i = 0; i < 7; i++) {
            const dayEl = document.getElementById(`day-${i}`);
            dayEl.classList.remove('claimed', 'available');
            if (i < streak) {
                dayEl.classList.add('claimed');
            }
        }

        if (gameState.dailyReward.lastClaimedDay !== today && streak < 7) {
            claimDailyRewardBtn.disabled = false;
            document.getElementById(`day-${streak}`).classList.add('available');
        } else {
            claimDailyRewardBtn.disabled = true;
        }
    }

    claimDailyRewardBtn.addEventListener('click', () => {
        const today = new Date().getDay();
        if (gameState.dailyReward.lastClaimedDay !== today) {
            const reward = DAILY_REWARDS[gameState.dailyReward.streak];
            gameState.balance += reward;
            gameState.dailyReward.lastClaimedDay = today;
            gameState.dailyReward.streak++;
            closeModal('daily-reward-modal');
            updateUI();
        }
    });

    dailyRewardBtn.addEventListener('click', () => {
        updateDailyRewardStatus();
        dailyRewardModal.classList.remove('hidden');
    });

    // --- Modal Logic ---
    window.closeModal = (modalId) => {
        document.getElementById(modalId).classList.add('hidden');
    }

    inviteBtn.addEventListener('click', () => inviteModal.classList.remove('hidden'));
    
    window.copyInviteLink = () => {
        const linkInput = document.getElementById('invite-link');
        linkInput.select();
        linkInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        
        const feedback = document.getElementById('copy-feedback');
        feedback.textContent = 'کپی شد!';
        setTimeout(() => { feedback.textContent = ''; }, 2000);
    }

    // --- Tools Logic ---
    window.calculateConcrete = () => {
        const l = parseFloat(document.getElementById('concrete-length').value) || 0;
        const w = parseFloat(document.getElementById('concrete-width').value) || 0;
        const h = parseFloat(document.getElementById('concrete-height').value) || 0;
        document.getElementById('concrete-result').textContent = (l * w * h).toFixed(2);
    }
    
    window.calculateRebar = () => {
        const d = parseFloat(document.getElementById('rebar-diameter').value) || 0;
        const l = parseFloat(document.getElementById('rebar-length').value) || 0;
        const weight = (d * d * l * 0.00617).toFixed(2); 
        document.getElementById('rebar-result').textContent = weight;
    }

    window.calculateBricks = () => {
        const area = parseFloat(document.getElementById('wall-area').value) || 0;
        document.getElementById('bricks-result').textContent = Math.ceil(area * 70); 
    }
    
    window.calculateSlope = () => {
        const rise = parseFloat(document.getElementById('slope-rise').value) || 0;
        const run = parseFloat(document.getElementById('slope-run').value) || 0;
        if(run === 0) {
            document.getElementById('slope-result').textContent = "نامحدود";
            return;
        }
        document.getElementById('slope-result').textContent = ((rise / run) * 100).toFixed(1);
    }
    
    window.calculateAsphalt = () => {
        const length = parseFloat(document.getElementById('asphalt-length').value) || 0;
        const width = parseFloat(document.getElementById('asphalt-width').value) || 0;
        const thicknessCm = parseFloat(document.getElementById('asphalt-thickness').value) || 0;
        const density = 2.4; 
        const volumeM3 = length * width * (thicknessCm / 100);
        const weightTon = volumeM3 * density;
        document.getElementById('asphalt-result').textContent = weightTon.toFixed(2);
    }

    window.calculateFlowRate = () => {
        const diameterCm = parseFloat(document.getElementById('pipe-diameter').value) || 0;
        const velocity = parseFloat(document.getElementById('pipe-velocity').value) || 0;
        const radiusM = (diameterCm / 2) / 100;
        const areaM2 = Math.PI * Math.pow(radiusM, 2);
        const flowRateM3s = areaM2 * velocity;
        const flowRateLps = flowRateM3s * 1000; 
        document.getElementById('flowrate-result').textContent = flowRateLps.toFixed(2);
    }

    // --- Airdrop Logic ---
    function updateAirdropCountdown() {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = AIRDROP_END_DATE - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownEl.textContent = "ایردراپ انجام شد!";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }
    
    function updateAirdropView() {
        const estimatedAirdrop = gameState.balance * 0.05;
        estimatedAirdropEl.textContent = formatNumber(Math.floor(estimatedAirdrop));
    }

    // --- Data Persistence ---
    function saveGameState() {
        try {
            localStorage.setItem('civilCityGameState', JSON.stringify(gameState));
        } catch (e) {
            console.error("Could not save game state:", e);
        }
    }

    function loadGameState() {
        const savedState = localStorage.getItem('civilCityGameState');
        if (savedState) {
            const loadedState = JSON.parse(savedState);
            Object.assign(gameState, loadedState);
            
            // Ensure completedTasks exists (for users upgrading from older version)
            if(!gameState.completedTasks) gameState.completedTasks = [];
        }
        gameState.lastOnline = new Date().getTime();
    }
    
    function formatNumber(num) {
        if (num < 1000) return num;
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(3) + 'B';
        return (num / 1000000000000).toFixed(4) + 'T';
    }

    init();
});
