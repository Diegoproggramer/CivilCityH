document.addEventListener('DOMContentLoaded', () => {
    // Initialize Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.expand();

    // ===== NEW: Splash Screen Logic =====
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const bottomNav = document.querySelector('.bottom-nav');

    setTimeout(() => {
        splashScreen.style.opacity = '0';
        appContainer.style.visibility = 'visible';
        bottomNav.style.visibility = 'visible';
        // Remove splash screen from DOM after transition to improve performance
        setTimeout(() => splashScreen.remove(), 500); 
    }, 3000); // 3 seconds delay


    // Game state object
    let state = {
        score: 0,
        energy: 1000,
        maxEnergy: 1000,
        rechargeRate: 1,
        multitapLevel: 1,
        energyLimitLevel: 1,
        rechargeLevel: 1,
        lastLoginDate: null // NEW: For daily reward
    };

    // DOM Elements (same as before)
    const scoreCounter = document.getElementById('score-counter');
    // ... all other DOM elements ...

    // ===== NEW: Toast Notification Function =====
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    // ===== NEW: Daily Reward Logic =====
    const dailyRewardModal = document.getElementById('daily-reward-modal');
    const claimDailyRewardBtn = document.getElementById('claim-daily-reward-btn');

    function checkDailyReward() {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        if (state.lastLoginDate !== today) {
            dailyRewardModal.style.display = 'flex';
            state.lastLoginDate = today;
            state.score += 5000;
            saveState();
            updateUI();
        }
    }

    claimDailyRewardBtn.addEventListener('click', () => {
        dailyRewardModal.style.display = 'none';
        showToast('+5000 CVC پاداش روزانه دریافت شد!', 'success');
        // Vibrate on claim
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    });


    function saveState() { /* ... same as before ... */ }

    function loadState() {
        const savedState = localStorage.getItem('civilCoinState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
        // ... set username ...
        
        // NEW: Check for daily reward after loading state
        checkDailyReward();
    }
    
    function updateUI() { /* ... same as before ... */ }

    coinTapper.addEventListener('click', (e) => {
        // ... logic for score and energy ...
        // ... logic for floating number ...
        
        // ===== NEW: Haptic Feedback on Tap =====
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light'); // 'light', 'medium', 'heavy'
        }
        
        updateUI();
    });

    // ... Energy regeneration loop ...
    // ... Page Navigation logic ...
    // ... TradingView and Calculator logic ...

    // ===== UPDATED: Boosts Logic with Toasts and Haptics =====

    document.getElementById('boost-multitap').addEventListener('click', () => {
        const cost = getBoostCost('multitap');
        if (state.score >= cost) {
            state.score -= cost;
            state.multitapLevel++;
            updateUI();
            showToast('سطح پُتک فولادی افزایش یافت!', 'success');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        } else {
            showToast('سکه کافی نیست!', 'error');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        }
    });

    document.getElementById('boost-energy-limit').addEventListener('click', () => {
        const cost = getBoostCost('energyLimit');
        if (state.score >= cost) {
            state.score -= cost;
            state.energyLimitLevel++;
            state.maxEnergy += 500;
            updateUI();
            showToast('ظرفیت نیروگاه افزایش یافت!', 'success');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        } else {
            showToast('سکه کافی نیست!', 'error');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        }
    });
    
    document.getElementById('boost-recharge-speed').addEventListener('click', () => {
        const cost = getBoostCost('recharge');
        if (state.score >= cost) {
            state.score -= cost;
            state.rechargeLevel++;
            state.rechargeRate++;
            updateUI();
            showToast('سرعت شارژر توربو افزایش یافت!', 'success');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        } else {
            showToast('سکه کافی نیست!', 'error');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        }
    });


    // === INITIALIZATION ===
    loadState();
    updateUI();
});
