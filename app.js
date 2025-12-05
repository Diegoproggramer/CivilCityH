document.addEventListener('DOMContentLoaded', () => {
    // --- متغیرهای اصلی ---
    let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
    let energy = 1000;
    const maxEnergy = 1000;

    // المنت‌ها
    const balanceEl = document.getElementById('balance');
    const energyValEl = document.getElementById('energy-val');
    const energyFillEl = document.getElementById('energy-fill');
    const splashScreen = document.getElementById('splash-screen');
    
    // --- شروع برنامه ---
    
    // بروزرسانی اولیه موجودی
    updateUI();

    // حذف اسپلش اسکرین
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // --- سیستم کلیک و انرژی ---
    const clickBtn = document.getElementById('click-btn');
    clickBtn.addEventListener('click', (e) => {
        if (energy > 0) {
            // افزایش سکه
            balance++;
            energy--;
            updateUI();
            saveData();
            
            // انیمیشن عدد
            showFloatingText(e.clientX, e.clientY, '+1');
            
            // ویبره
            if(navigator.vibrate) navigator.vibrate(10);
        } else {
            showToast('انرژی تمام شده!');
        }
    });

    // پر شدن خودکار انرژی
    setInterval(() => {
        if (energy < maxEnergy) {
            energy++;
            updateUI();
        }
    }, 1000);

    // --- توابع کمکی ---
    function updateUI() {
        balanceEl.innerText = balance.toLocaleString();
        energyValEl.innerText = `${energy}/${maxEnergy}`;
        energyFillEl.style.width = `${(energy / maxEnergy) * 100}%`;
    }

    function saveData() {
        localStorage.setItem('balance', balance);
    }

    function showFloatingText(x, y, text) {
        const el = document.createElement('div');
        el.innerText = text;
        el.style.position = 'fixed';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = '#fff';
        el.style.pointerEvents = 'none';
        el.style.animation = 'floatUp 1s ease-out';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    // --- سیستم نویگیشن (تب‌ها) ---
    window.switchTab = function(tabName) {
        // مخفی کردن همه ویوها
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
        // غیرفعال کردن همه دکمه‌های پایین
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        // نمایش ویو انتخاب شده
        const target = document.getElementById(tabName + '-view');
        if(target) target.style.display = tabName === 'home' ? 'flex' : 'block';
        
        // فعال کردن دکمه مربوطه
        event.currentTarget.classList.add('active');
    };

    // --- سیستم تسک‌ها (Earn) ---
    window.completeTask = function(element, reward) {
        if(element.classList.contains('completed')) return;
        
        element.classList.add('completed');
        element.querySelector('.task-btn').innerText = 'انجام شد';
        
        balance += reward;
        updateUI();
        saveData();
        showToast(`تبریک! ${reward.toLocaleString()} سکه دریافت کردید.`);
        
        // ویبره طولانی تر
        if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };

    // --- سیستم ابزارها (Tools Modal) ---
    const modal = document.getElementById('tool-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalResult = document.getElementById('modal-result');

    window.openTool = function(toolType) {
        modal.style.display = 'flex';
        modalResult.style.display = 'none';
        
        if (toolType === 'concrete') {
            modalTitle.innerText = 'محاسبه حجم بتن';
            modalBody.innerHTML = `
                <p>ابعاد را به متر وارد کنید:</p>
                <input type="number" id="c-len" placeholder="طول (m)">
                <input type="number" id="c-wid" placeholder="عرض (m)">
                <input type="number" id="c-hei" placeholder="ارتفاع/ضخامت (m)">
                <button onclick="calculateConcrete()">محاسبه</button>
            `;
        } else if (toolType === 'steel') {
            modalTitle.innerText = 'محاسبه وزن میلگرد';
            modalBody.innerHTML = `
                <p>مشخصات میلگرد:</p>
                <input type="number" id="s-dia" placeholder="قطر (mm)">
                <input type="number" id="s-len" placeholder="طول کل (m)">
                <button onclick="calculateSteel()">محاسبه</button>
            `;
        }
    };

    window.closeModal = function() {
        modal.style.display = 'none';
    };

    // --- منطق محاسبات ابزارها ---
    window.calculateConcrete = function() {
        const l = parseFloat(document.getElementById('c-len').value);
        const w = parseFloat(document.getElementById('c-wid').value);
        const h = parseFloat(document.getElementById('c-hei').value);
        
        if(l && w && h) {
            const vol = l * w * h;
            const cement = vol * 350; // فرض ۳۵۰ کیلو سیمان در هر متر مکعب
            
            modalResult.style.display = 'block';
            modalResult.innerHTML = `
                حجم بتن: ${vol.toFixed(2)} متر مکعب<br>
                سیمان تقریبی: ${cement.toFixed(0)} کیلوگرم
            `;
        } else {
            showToast('لطفا همه اعداد را وارد کنید');
        }
    };

    window.calculateSteel = function() {
        const d = parseFloat(document.getElementById('s-dia').value);
        const l = parseFloat(document.getElementById('s-len').value);
        
        if(d && l) {
            // فرمول: (D^2 / 162) * L
            const weight = ((d * d) / 162) * l;
            
            modalResult.style.display = 'block';
            modalResult.innerHTML = `
                وزن میلگرد: ${weight.toFixed(2)} کیلوگرم
            `;
        } else {
            showToast('لطفا همه اعداد را وارد کنید');
        }
    };

    window.copyInviteLink = function() {
        const link = "https://t.me/CivilCityBot?start=12345"; // لینک نمونه
        navigator.clipboard.writeText(link).then(() => {
            showToast('لینک کپی شد!');
        });
    };

    // --- سیستم نوتیفیکیشن ---
    window.showToast = function(message) {
        const toast = document.getElementById("toast");
        toast.className = "toast show";
        toast.innerText = message;
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
    };
});
