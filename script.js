/**
 * TimeFlow Premium - Core Logic (Universal Version)
 * Mengelola deteksi waktu, sistem operasi, browser, 
 * dan manajemen World Clock dengan dukungan multi-halaman.
 */

// 1. Konfigurasi 6 Kota Default untuk World Clock
let monitoredCities = [
    { name: "New York", tz: "America/New_York" },
    { name: "Cairo", tz: "Africa/Cairo" },
    { name: "London", tz: "Europe/London" },
    { name: "Tokyo", tz: "Asia/Tokyo" },
    { name: "Los Angeles", tz: "America/Los_Angeles" },
    { name: "Sydney", tz: "Australia/Sydney" }
];

document.addEventListener('DOMContentLoaded', () => {
    initDiagnostics();
    initFullCitySelector(); // Menggunakan daftar timezone lengkap
    updateAllClocks();
    setInterval(updateAllClocks, 1000);
});

/**
 * Helper untuk mengisi teks hanya jika elemen ada (Mencegah Error)
 */
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/**
 * Inisialisasi Data Diagnostik (Device, OS, Browser)
 */
function initDiagnostics() {
    const ua = navigator.userAgent;
    
    // 1. Time & Region Data
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = (offset / -60);
    const offsetStr = `UTC ${offsetHours >= 0 ? '+' : ''}${offsetHours}:00`;
    
    // Update data diagnostik (Hanya jika elemen ada di halaman tersebut)
    safeSetText('val-tz', tz);
    safeSetText('val-offset', offsetStr);
    safeSetText('val-region', navigator.language || 'Unknown');
    
    // Update Hero Section (Ada di index & postingan)
    const heroTz = document.getElementById('hero-tz');
    if (heroTz && heroTz.textContent.includes("Detecting")) {
        heroTz.textContent = tz.replace('_', ' ');
    }
    safeSetText('hero-offset', `Local Offset: ${offsetStr}`);

    // 2. Device & OS
    let os = "Unknown OS";
    if (ua.indexOf("Win") != -1) os = "Windows";
    else if (ua.indexOf("Mac") != -1) os = "MacOS";
    else if (ua.indexOf("Linux") != -1) os = "Linux";
    else if (ua.indexOf("Android") != -1) os = "Android";
    else if (ua.indexOf("like Mac") != -1) os = "iOS";

    safeSetText('val-os', os);
    safeSetText('val-devicetype', /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop");
    safeSetText('val-lang', navigator.languages[0]);

    // 3. Browser & Display
    let browser = "Unknown";
    if (ua.indexOf("Chrome") != -1) browser = "Google Chrome";
    else if (ua.indexOf("Safari") != -1) browser = "Safari";
    else if (ua.indexOf("Firefox") != -1) browser = "Firefox";
    else if (ua.indexOf("Edge") != -1) browser = "Microsoft Edge";

    safeSetText('val-browser', browser);
    safeSetText('val-res', `${window.screen.width} x ${window.screen.height}`);
    
    const updateViewport = () => {
        safeSetText('val-view', `${window.innerWidth} x ${window.innerHeight}`);
    };
    window.onresize = updateViewport;
    updateViewport();
}

/**
 * Mengelola Dropdown Pemilih Kota
 */
function initFullCitySelector() {
    const selector = document.getElementById('city-selector');
    if (!selector) return; // Keluar jika tidak ada di halaman
    
    const allTimeZones = Intl.supportedValuesOf('timeZone');

    allTimeZones.forEach(tz => {
        const opt = document.createElement('option');
        opt.value = tz;
        const cityName = tz.split('/').pop().replace(/_/g, ' ');
        opt.textContent = `${cityName} (${tz})`;
        selector.appendChild(opt);
    });

    selector.addEventListener('change', (e) => {
        if (!e.target.value) return;
        const tz = e.target.value;
        const name = tz.split('/').pop().replace(/_/g, ' ');
        
        if (!monitoredCities.some(c => c.tz === tz)) {
            monitoredCities.push({ name, tz });
            renderClockGrid();
        }
        e.target.value = ""; 
    });
}

/**
 * Fungsi Utama Update Waktu (Loop setiap detik)
 */
function updateAllClocks() {
    const now = new Date();

    // 1. Update Hero Clock (Local)
    const localTimeOptions = { 
        hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' 
    };
    const timeParts = now.toLocaleTimeString('en-US', localTimeOptions).split(' ');
    
    safeSetText('hero-hms', timeParts[0]);
    safeSetText('hero-ampm', timeParts[1]);
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    safeSetText('hero-date', now.toLocaleDateString('en-US', dateOptions));

    // 2. Update World Clock Grid (Hanya jika elemen grid ada)
    if (document.getElementById('clock-grid')) {
        renderClockGrid();
    }
}

/**
 * Me-render kartu jam dunia ke dalam grid
 */
function renderClockGrid() {
    const grid = document.getElementById('clock-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; 

    monitoredCities.forEach((city, index) => {
        const cityTime = new Date().toLocaleTimeString('en-US', {
            timeZone: city.tz,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const [time, ampm] = cityTime.split(' ');

        const card = document.createElement('div');
        card.className = 'clock-card';
        card.innerHTML = `
            <div class="city-info">
                <h4>${city.name}</h4>
                <p>${city.tz}</p>
            </div>
            <div class="clock-time-group">
                <div class="time-display">
                    <span>${time}</span>
                    <small style="font-size: 0.7em; margin-left: 5px; opacity: 0.7; font-family: 'Inter', sans-serif;">${ampm}</small>
                </div>
                <button class="remove-btn" onclick="removeCity(${index})">×</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Menghapus kota dari daftar monitor
 */
window.removeCity = function(index) {
    monitoredCities.splice(index, 1);
    renderClockGrid();
};
// 1. Menonaktifkan Klik Kanan (Context Menu)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

// 2. Menonaktifkan "Select All" dan Seleksi Teks
document.addEventListener('keydown', function(e) {
    // Menghalangi Ctrl+A atau Command+A
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 65) {
        e.preventDefault();
    }
    
    // 3. Menghalangi "View Source" (Ctrl+U)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault();
    }

    // 4. Menghalangi Inspect Element (F12, Ctrl+Shift+I, Ctrl+Shift+J)
    if (e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))) {
        e.preventDefault();
    }
}, false);

// 5. Tambahan CSS via JavaScript untuk mematikan seleksi teks secara visual
document.documentElement.style.userSelect = 'none';
document.documentElement.style.webkitUserSelect = 'none';
document.documentElement.style.msUserSelect = 'none';
document.documentElement.style.mozUserSelect = 'none';
