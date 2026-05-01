/**
 * TimeFlow Premium - Core Logic
 * Mengelola deteksi waktu, sistem operasi, browser, 
 * dan manajemen World Clock.
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
 * Inisialisasi Data Diagnostik (Device, OS, Browser)
 */
function initDiagnostics() {
    const ua = navigator.userAgent;
    
    // 1. Time & Region
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = (offset / -60);
    
    document.getElementById('val-tz').textContent = tz;
    document.getElementById('val-offset').textContent = `UTC ${offsetHours >= 0 ? '+' : ''}${offsetHours}:00`;
    document.getElementById('val-region').textContent = navigator.language || 'Unknown';
    document.getElementById('hero-tz').textContent = tz.replace('_', ' ');
    document.getElementById('hero-offset').textContent = `Local Offset: UTC ${offsetHours >= 0 ? '+' : ''}${offsetHours}:00`;

    // 2. Device & OS
    let os = "Unknown OS";
    if (ua.indexOf("Win") != -1) os = "Windows";
    if (ua.indexOf("Mac") != -1) os = "MacOS";
    if (ua.indexOf("Linux") != -1) os = "Linux";
    if (ua.indexOf("Android") != -1) os = "Android";
    if (ua.indexOf("like Mac") != -1) os = "iOS";

    document.getElementById('val-os').textContent = os;
    document.getElementById('val-devicetype').textContent = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
    document.getElementById('val-lang').textContent = navigator.languages[0];

    // 3. Browser & Display
    let browser = "Unknown";
    if (ua.indexOf("Chrome") != -1) browser = "Google Chrome";
    else if (ua.indexOf("Safari") != -1) browser = "Safari";
    else if (ua.indexOf("Firefox") != -1) browser = "Firefox";
    else if (ua.indexOf("Edge") != -1) browser = "Microsoft Edge";

    document.getElementById('val-browser').textContent = browser;
    document.getElementById('val-res').textContent = `${window.screen.width} x ${window.screen.height}`;
    
    const updateViewport = () => {
        document.getElementById('val-view').textContent = `${window.innerWidth} x ${window.innerHeight}`;
    };
    window.onresize = updateViewport;
    updateViewport();
}

/**
 * Mengelola Dropdown Pemilih Kota dengan daftar zona waktu lengkap
 * (Africa/Abidjan hingga Pacific/Wallis)
 */
function initFullCitySelector() {
    const selector = document.getElementById('city-selector');
    
    // Mengambil daftar zona waktu standar dari API Intl
    const allTimeZones = Intl.supportedValuesOf('timeZone');

    allTimeZones.forEach(tz => {
        const opt = document.createElement('option');
        opt.value = tz;
        
        // Mempercantik tampilan nama kota (misal: "Asia/Jakarta" -> "Jakarta")
        const cityName = tz.split('/').pop().replace(/_/g, ' ');
        opt.textContent = `${cityName} (${tz})`;
        selector.appendChild(opt);
    });

    selector.addEventListener('change', (e) => {
        if (!e.target.value) return;
        const tz = e.target.value;
        const name = tz.split('/').pop().replace(/_/g, ' ');
        
        // Cek jika sudah ada agar tidak duplikat
        if (!monitoredCities.some(c => c.tz === tz)) {
            monitoredCities.push({ name, tz });
            renderClockGrid();
        }
        e.target.value = ""; // Reset dropdown
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
    
    const heroHms = document.getElementById('hero-hms');
    const heroAmpm = document.getElementById('hero-ampm');
    const heroDate = document.getElementById('hero-date');

    if (heroHms) heroHms.textContent = timeParts[0];
    if (heroAmpm) heroAmpm.textContent = timeParts[1];
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (heroDate) heroDate.textContent = now.toLocaleDateString('en-US', dateOptions);

    // 2. Update World Clock Grid
    renderClockGrid();
}

/**
 * Me-render kartu jam dunia ke dalam grid
 * Perbaikan: Struktur HTML memastikan tombol X sejajar horizontal dengan jam
 */
function renderClockGrid() {
    const grid = document.getElementById('clock-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; // Clear grid

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