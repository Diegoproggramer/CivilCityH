let balance = 0;
let energy = 1000;
let maxEnergy = 1000;
let energyRechargeRate = 1;

const balanceDisplay = document.getElementById('balance');
const energyDisplay = document.getElementById('energy');
const energyMaxDisplay = document.getElementById('max-energy');
const energyFill = document.getElementById('energy-fill');
const splashScreen = document.getElementById('splash-screen');
const coinBtn = document.getElementById('coin-btn');
const toast = document.getElementById('toast');
const modal = document.getElementById('tool-modal');

// شروع برنامه
window.addEventListener('DOMContentLoaded', () => {
    const savedBalance = localStorage.getItem('civilBalance');
    const savedEnergy = localStorage.getItem('civilEnergy');
    const lastLogin = localStorage.getItem('lastLoginTime');

    if (savedBalance) balance = parseInt(savedBalance);
    if (savedEnergy) energy = parseInt(savedEnergy);

    if (lastLogin) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - parseInt(lastLogin)) / 1000);
        const gainedEnergy = diffSeconds * energyRechargeRate;
        energy = Math.min(energy + gainedEnergy, maxEnergy);
    }

    updateUI();

    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display = 'none'; }, 500);
    }, 2500);

    setInterval(rechargeEnergy, 1000);
});

// کلیک سکه
if(coinBtn) {
    coinBtn.addEventListener('click', (e) => {
        if (energy > 0) {
            balance += 1;
            energy -= 1;
            if (navigator.vibrate) navigator.vibrate(10);
            showFloatingText(e.clientX, e.clientY);
            
            const rect = coinBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            coinBtn.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) scale(0.95)`;
            setTimeout(() => { coinBtn.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'; }, 100);

            updateUI();
            saveData();
        } else {
            showToast("انرژی کافی نیست!");
        }
    });
}

function rechargeEnergy() {
    if (energy < maxEnergy) {
        energy += energyRechargeRate;
        if (energy > maxEnergy) energy = maxEnergy;
        updateUI();
        saveData();
    }
}

function showFloatingText(x, y) {
    const floatEl = document.createElement('div');
    floatEl.innerText = '+1';
    floatEl.className = 'floating-number';
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    document.body.appendChild(floatEl);
    setTimeout(() => { floatEl.remove(); }, 1000);
}

function updateUI() {
    if(balanceDisplay) balanceDisplay.innerText = balance.toLocaleString();
    if(energyDisplay) energyDisplay.innerText = Math.floor(energy);
    if(energyMaxDisplay) energyMaxDisplay.innerText = maxEnergy;
    if(energyFill) {
        const percentage = (energy / maxEnergy) * 100;
        energyFill.style.width = `${percentage}%`;
    }
}

function saveData() {
    localStorage.setItem('civilBalance', balance);
    localStorage.setItem('civilEnergy', energy);
    localStorage.setItem('lastLoginTime', Date.now());
}

// Navigation System
window.switchTab = function(tabName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none'; // Force hide
    });
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    const activeView = document.getElementById(tabName + '-view');
    if(activeView) {
        activeView.style.display = (tabName === 'main') ? 'flex' : 'block';
        setTimeout(() => activeView.classList.add('active'), 10);
    }
    
    // Update active icon
    const navs = document.querySelectorAll('.nav-item');
    if(tabName === 'main') navs[0].classList.add('active');
    if(tabName === 'tools') navs[1].classList.add('active');
    if(tabName === 'boost') navs[2].classList.add('active');
    if(tabName === 'friends') navs[3].classList.add('active');
}

function showToast(message) {
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

window.buyBoost = function(type) {
    if (type === 'multitap' && balance >= 500) {
        balance -= 500;
        showToast("بوست خریداری شد!");
        updateUI();
    } else {
        showToast("سکه کافی ندارید!");
    }
}

// --- TOOLS LOGIC ---

window.openTool = function(toolType) {
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    modal.style.display = "flex";

    if(toolType === 'concrete') {
        modalTitle.innerText = "محاسبه حجم بتن ستون";
        modalBody.innerHTML = `
            <div class="form-group">
                <label>طول (متر):</label>
                <input type="number" id="c-length" placeholder="مثلا 0.4">
            </div>
            <div class="form-group">
                <label>عرض (متر):</label>
                <input type="number" id="c-width" placeholder="مثلا 0.4">
            </div>
            <div class="form-group">
                <label>ارتفاع (متر):</label>
                <input type="number" id="c-height" placeholder="مثلا 3">
            </div>
            <button onclick="calculateConcrete()">محاسبه</button>
            <div id="c-result" class="result-box" style="display:none"></div>
        `;
    } else if(toolType === 'steel') {
        modalTitle.innerText = "محاسبه وزن میلگرد";
        modalBody.innerHTML = `
            <div class="form-group">
                <label>قطر میلگرد (mm):</label>
                <select id="s-dia">
                    <option value="8">8</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                </select>
            </div>
            <div class="form-group">
                <label>طول کل (متر):</label>
                <input type="number" id="s-length" placeholder="مثلا 12">
            </div>
            <button onclick="calculateSteel()">محاسبه وزن</button>
            <div id="s-result" class="result-box" style="display:none"></div>
        `;
    } else {
        modalTitle.innerText = "در حال ساخت";
        modalBody.innerHTML = "<p>این ابزار به زودی اضافه می‌شود...</p>";
    }
}

window.closeModal = function() {
    modal.style.display = "none";
}

// توابع محاسباتی واقعی
window.calculateConcrete = function() {
    const l = parseFloat(document.getElementById('c-length').value);
    const w = parseFloat(document.getElementById('c-width').value);
    const h = parseFloat(document.getElementById('c-height').value);
    
    if(l && w && h) {
        const vol = (l * w * h).toFixed(3);
        const cement = (vol * 350).toFixed(0); // فرض ۳۵۰ کیلو در متر مکعب
        document.getElementById('c-result').style.display = 'block';
        document.getElementById('c-result').innerHTML = `حجم: ${vol} m³<br>سیمان مورد نیاز: حدود ${cement} kg`;
    }
}

window.calculateSteel = function() {
    const d = parseFloat(document.getElementById('s-dia').value);
    const l = parseFloat(document.getElementById('s-length').value);
    
    if(d && l) {
        // فرمول: (D^2 / 162) * L
        const weight = ((d * d / 162) * l).toFixed(2);
        document.getElementById('s-result').style.display = 'block';
        document.getElementById('s-result').innerText = `وزن کل: ${weight} کیلوگرم`;
    }
}

// بستن مودال با کلیک بیرون آن
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
