document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let balance = 0;
    let energy = 1000;
    const maxEnergy = 1000;
    let pph = 0; // Profit Per Hour
    let lastTimestamp = new Date().getTime();

    // --- DOM Elements ---
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const balanceEl = document.getElementById('balance');
    const energyEl = document.getElementById('energy');
    const energyBarFillEl = document.querySelector('.energy-bar-fill');
    const pphEl = document.getElementById('pph');
    const rankNameEl = document.getElementById('rank-name');
    const rankLevelEl = document.getElementById('rank-level');
    const coinButton = document.getElementById('coin-button');
    const marketContainer = document.getElementById('market-items-container');

    // --- Ranks ---
    const ranks = [
        { name: "ترم یکی", min: 0 }, { name: "کارآموز", min: 50000 },
        { name: "کمک مهندس", min: 250000 }, { name: "مهندس اجرایی", min: 1000000 },
        { name: "سرپرست کارگاه", min: 5000000 }, { name: "مدیر پروژه", min: 25000000 },
        { name: "مدیرعامل", min: 100000000 }, { name: "انبوه ساز", min: 500000000 },
        { name: "مافیای مسکن", min: 2000000000 }, { name: "وزیر مسکن", min: 10000000000 }
    ];

    // --- Market Items ---
    const marketItems = [
        { id: 1, name: "کلاه ایمنی", icon: "fa-hard-hat", basePrice: 50, pph: 5, level: 0 },
        { id: 2, name: "بیل", icon: "fa-person-digging", basePrice: 200, pph: 15, level: 0 },
        { id: 3, name: "فرغون", icon: "fa-cart-flatbed", basePrice: 1000, pph: 50, level: 0 },
        { id: 4, name: "میکسر بتن", icon: "fa-blender", basePrice: 5000, pph: 200, level: 0 },
        { id: 5, name: "داربست", icon: "fa-network-wired", basePrice: 20000, pph: 750, level: 0 },
        { id: 6, name: "جرثقیل", icon: "fa-truck-pickup", basePrice: 100000, pph: 3000, level: 0 },
        { id: 7, name: "نقشه معماری", icon: "fa-ruler-combined", basePrice: 400000, pph: 10000, level: 0 },
        { id: 8, name: "تیم کارگری", icon: "fa-users", basePrice: 1500000, pph: 35000, level: 0 },
        { id: 9, name: "مهندس ناظر", icon: "fa-user-tie", basePrice: 5000000, pph: 100000, level: 0 },
        { id: 10, name: "پروانه ساخت", icon: "fa-file-signature", basePrice: 20000000, pph: 350000, level: 0 },
        { id: 11, name: "تراکتور", icon: "fa-tractor", basePrice: 50000000, pph: 700000, level: 0 },
        { id: 12, name: "زمین", icon: "fa-map", basePrice: 150000000, pph: 1800000, level: 0 },
        { id: 13, name: "مجتمع مسکونی", icon: "fa-building", basePrice: 500000000, pph: 5000000, level: 0 },
        { id: 14, name: "کارخانه سیمان", icon: "fa-industry", basePrice: 1200000000, pph: 11000000, level: 0 },
        { id: 15, "name": "شرکت پیمانکاری", "icon": "fa-briefcase", "basePrice": 3000000000, "pph": 25000000, "level": 0 },
        { id: 16, "name": "برج تجاری", "icon": "fa-city", "basePrice": 7500000000, "pph": 60000000, "level": 0 },
        { id: 17, "name": "مالکیت معدن", "icon": "fa-gem", "basePrice": 18000000000, "pph": 130000000, "level": 0 },
        { id: 18, "name": "پروژه سدسازی", "icon": "fa-water", "basePrice": 40000000000, "pph": 280000000, "level": 0 },
        { id: 19, "name": "قرارداد مترو", "icon": "fa-train-subway", "basePrice": 100000000000, "pph": 650000000, "level": 0 },
        { id: 20, "name": "کلان‌شهر", "icon": "fa-satellite", "basePrice": 250000000000, "pph": 1500000000, "level": 0 }
    ];

    // --- Core Functions ---
    const hapticFeedback = () => {
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const updateUI = () => {
        balanceEl.innerText = Math.floor(balance).toLocaleString();
        energyEl.innerText = `${energy} / ${maxEnergy}`;
        energyBarFillEl.style.width = `${(energy / maxEnergy) * 100}%`;
        pphEl.innerText = pph.toLocaleString();

        const currentRank = [...ranks].reverse().find(r => balance >= r.min);
        if (currentRank) {
            rankNameEl.innerText = currentRank.name;
            rankLevelEl.innerText = `Lv. ${ranks.indexOf(currentRank) + 1}`;
        }
    };

    const showFloatingText = (text, x, y) => {
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.innerText = text;
        document.body.appendChild(floatText);
        floatText.style.left = `${x}px`;
        floatText.style.top = `${y}px`;
        setTimeout(() => floatText.remove(), 1500);
    };

    // --- Event Listeners and Game Logic ---
    coinButton.addEventListener('click', (e) => {
        if (energy > 0) {
            const tapValue = 1;
            balance += tapValue;
            energy -= tapValue;
            updateUI();
            hapticFeedback();
            
            const rect = coinButton.getBoundingClientRect();
            const x = e.clientX || rect.left + rect.width / 2;
            const y = e.clientY || rect.top + rect.height / 2;
            showFloatingText(`+${tapValue}`, x, y);
        }
    });

    window.switchView = (viewId, button) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    };

    window.closeModal = (modalId) => {
        document.getElementById(modalId).style.display = 'none';
    };

    // --- Market Logic ---
    const populateMarket = () => {
        marketContainer.innerHTML = '';
        marketItems.forEach(item => {
            const price = Math.floor(item.basePrice * Math.pow(1.6, item.level));
            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <i class="fas ${item.icon} market-icon"></i>
                <div class="market-name">${item.name}</div>
                <div class="market-level">Lv. ${item.level} | +${item.pph.toLocaleString()} PPH</div>
                <div class="market-price">
                    <i class="fas fa-coins"></i> ${price.toLocaleString()}
                </div>
            `;
            if (balance < price) {
                card.classList.add('disabled');
            }
            card.onclick = () => buyMarketItem(item.id);
            marketContainer.appendChild(card);
        });
    };

    window.buyMarketItem = (itemId) => {
        const item = marketItems.find(i => i.id === itemId);
        const price = Math.floor(item.basePrice * Math.pow(1.6, item.level));
        if (balance >= price) {
            balance -= price;
            item.level++;
            pph += item.pph;
            hapticFeedback();
            populateMarket(); // Refresh market view
            updateUI();
        }
    };

    // --- Passive Income & Energy Regeneration ---
    setInterval(() => {
        if (energy < maxEnergy) {
            energy = Math.min(maxEnergy, energy + 2); // Regen 2 energy per second
            updateUI();
        }
    }, 1000);
    
    setInterval(() => { // Passive income calculation
        const now = new Date().getTime();
        const elapsedSeconds = (now - lastTimestamp) / 1000;
        balance += (pph / 3600) * elapsedSeconds;
        lastTimestamp = now;
        updateUI();
        // Since this runs often, we can refresh market state here too
        if (document.getElementById('market-view').classList.contains('active')) {
             populateMarket();
        }
    }, 5000); // Update every 5 seconds

    // --- Offline Earnings ---
    const calculateOfflineEarnings = () => {
        const lastVisit = localStorage.getItem('civilCityLastVisit');
        const now = new Date().getTime();
        // const storedState = JSON.parse(localStorage.getItem('civilCityState')); // Will be used later
        
        // For now, let's use placeholder values for PPH from previous session
        const storedPPH = parseInt(localStorage.getItem('civilCityPPH') || '0');

        if (lastVisit && storedPPH > 0) {
            let offlineSeconds = (now - parseInt(lastVisit)) / 1000;
            offlineSeconds = Math.min(offlineSeconds, 3 * 60 * 60); // Max 3 hours offline earnings
            
            const earned = Math.floor((storedPPH / 3600) * offlineSeconds);
            if (earned > 0) {
                balance += earned;
                document.getElementById('offline-earnings').innerText = earned.toLocaleString();
                document.getElementById('offline-modal').style.display = 'flex';
            }
        }
        
        // Let's use simple local storage for PPH and last visit for now
        pph = storedPPH; // Load PPH
        lastTimestamp = now;
        window.onbeforeunload = () => {
            localStorage.setItem('civilCityLastVisit', new Date().getTime());
            localStorage.setItem('civilCityPPH', pph);
        };
    };

    // --- Engineering Tools Logic ---
    window.calculateConcrete = () => {
        const l = parseFloat(document.getElementById('concrete-length').value) || 0;
        const w = parseFloat(document.getElementById('concrete-width').value) || 0;
        const h = parseFloat(document.getElementById('concrete-height').value) || 0;
        document.getElementById('concrete-result').innerText = (l * w * h).toFixed(2);
    };
    window.calculateRebar = () => {
        const d = parseFloat(document.getElementById('rebar-diameter').value) || 0;
        const l = parseFloat(document.getElementById('rebar-length').value) || 0;
        const weight = (d * d * l * 0.00617).toFixed(2);
        document.getElementById('rebar-result').innerText = weight;
    };
    window.calculateBricks = () => {
        const area = parseFloat(document.getElementById('brick-area').value) || 0;
        document.getElementById('brick-result').innerText = Math.ceil(area * 70);
    };
    window.calculateSlope = () => {
        const rise = parseFloat(document.getElementById('slope-rise').value) || 0;
        const run = parseFloat(document.getElementById('slope-run').value) || 0;
        if (run === 0) {
            document.getElementById('slope-result').innerText = 'N/A';
            return;
        }
        document.getElementById('slope-result').innerText = ((rise / run) * 100).toFixed(1);
    };

    // --- Daily Reward System ---
    const dailyRewards = [500, 1000, 2500, 5000, 15000, 50000, 100000];
    let lastDailyTime = 0; // Simplified for this session, should be stored
    let currentDayStreak = 0; // Simplified for this session, should be stored

    window.openDailyReward = function() {
        const modal = document.getElementById('daily-modal');
        const grid = document.getElementById('daily-grid');
        const claimBtn = document.getElementById('claim-daily-btn');
        
        modal.style.display = 'flex';
        grid.innerHTML = '';

        const now = new Date().getTime();
        const canClaim = (lastDailyTime === 0) || (now - lastDailyTime > (24 * 60 * 60 * 1000));
        
        dailyRewards.forEach((amount, index) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            
            if (index < currentDayStreak) {
                dayCard.classList.add('claimed');
                dayCard.innerHTML = `<i class="fas fa-check"></i><div class="day-reward">روز ${index+1}</div>`;
            } else if (index === currentDayStreak && canClaim) {
                dayCard.classList.add('active');
                dayCard.innerHTML = `<i class="fas fa-coins"></i><div class="day-reward">${amount.toLocaleString()}</div>`;
            } else {
                 dayCard.innerHTML = `<i class="fas fa-lock"></i><div class="day-reward">${(index === currentDayStreak) ? amount.toLocaleString() : `روز ${index+1}`}</div>`;
            }
            grid.appendChild(dayCard);
        });

        if (canClaim) {
            claimBtn.disabled = false;
            claimBtn.innerText = "دریافت جایزه";
            claimBtn.style.background = "#f1c40f";
        } else {
            claimBtn.disabled = true;
            claimBtn.innerText = "فردا برگردید";
            claimBtn.style.background = "#555";
        }
    };

    window.claimDailyReward = function() {
        const now = new Date().getTime();
        const canClaim = (lastDailyTime === 0) || (now - lastDailyTime > (24 * 60 * 60 * 1000));
        
        if (canClaim) {
            const rewardAmount = dailyRewards[currentDayStreak];
            balance += rewardAmount;
            lastDailyTime = now;
            currentDayStreak = (currentDayStreak + 1); // We won't reset for now to make it more rewarding
            if (currentDayStreak >= dailyRewards.length) currentDayStreak = dailyRewards.length - 1; // Stay on last day
            
            updateUI();
            hapticFeedback();
            closeModal('daily-modal');
            
            alert(`تبریک! شما ${rewardAmount.toLocaleString()} سکه دریافت کردید.`);
        }
    };

    window.openFriendsModal = function() {
        document.getElementById('friends-modal').style.display = 'flex';
    };

    // --- Initial Load ---
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'flex';
        // calculateOfflineEarnings(); // Disabled for now to prevent confusion
        populateMarket();
        updateUI();
    }, 1500);
});
