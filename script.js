document.addEventListener('DOMContentLoaded', () => {
    // --- 状態管理 (localStorage) ---
    const STORAGE_KEYS = {
        API_KEY: 'clockck_api_key',
        LOCATION: 'clockck_location',
        DISPLAY_TYPE: 'clockck_display_type',
        THEME: 'clockck_theme',
        WEATHER_CACHE: 'clockck_weather_cache',
        WEATHER_CACHE_TIME: 'clockck_weather_cache_time'
    };

    const getStore = (key) => {
        const val = localStorage.getItem(key);
        if (val) return val;
        // デフォルト値
        if (key === STORAGE_KEYS.API_KEY) return 'a891eb341dae437fba441934252204';
        if (key === STORAGE_KEYS.LOCATION) return 'Sapporo';
        return '';
    };
    const setStore = (key, val) => localStorage.setItem(key, val);

    // --- PWA判定 ---
    function isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            window.navigator.standalone;
    }

    // --- スケーリング処理 ---
    const mainElement = document.querySelector('main');
    function updateScale() {
        if (!mainElement) return;
        const viewWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewHeight = document.documentElement.clientHeight || window.innerHeight;
        if (viewWidth === 0 || viewHeight === 0) return;

        let baseWidth, baseHeight;
        if (viewHeight > viewWidth) {
            baseWidth = 1080; baseHeight = 2400;
        } else {
            baseWidth = 2400; baseHeight = 1080;
        }

        const scaleX = viewWidth / baseWidth;
        const scaleY = viewHeight / baseHeight;
        mainElement.style.transform = `scale(${scaleX}, ${scaleY})`;
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    setTimeout(updateScale, 300);

    // --- 照度センサー ---
    if ('AmbientLightSensor' in window) {
        try {
            const sensor = new AmbientLightSensor();
            sensor.addEventListener('reading', () => {
                sensor.illuminance < 10 ? document.body.classList.add('dim') : document.body.classList.remove('dim');
            });
            sensor.start();
        } catch (err) { console.warn('Ambient Light Sensor 起動失敗:', err); }
    }

    // --- 設定モーダル / フォーム制御 ---
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close-top');
    const settingsSave = document.getElementById('settings-save');
    
    const inputApiKey = document.getElementById('set-api-key');
    const inputLocation = document.getElementById('set-location');
    const selectDisplayType = document.getElementById('set-display-type');
    const selectTheme = document.getElementById('set-theme');

    const applyTheme = () => {
        const theme = getStore(STORAGE_KEYS.THEME) || 'default';
        document.body.classList.remove('theme-vitamin');
        if (theme === 'vitamin') {
            document.body.classList.add('theme-vitamin');
        }
    };

    const loadSettings = () => {
        inputApiKey.value = getStore(STORAGE_KEYS.API_KEY);
        inputLocation.value = getStore(STORAGE_KEYS.LOCATION);
        selectDisplayType.value = getStore(STORAGE_KEYS.DISPLAY_TYPE) || 'lcd';
        selectTheme.value = getStore(STORAGE_KEYS.THEME) || 'default';
    };

    const openSettings = () => {
        loadSettings();
        settingsModal.style.display = 'block';
        settingsModal.scrollTop = 0;
    };

    const closeSettings = () => {
        settingsModal.style.display = 'none';
    };

    settingsBtn.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsSave.addEventListener('click', () => {
        setStore(STORAGE_KEYS.API_KEY, inputApiKey.value);
        setStore(STORAGE_KEYS.LOCATION, inputLocation.value);
        setStore(STORAGE_KEYS.DISPLAY_TYPE, selectDisplayType.value);
        setStore(STORAGE_KEYS.THEME, selectTheme.value);
        closeSettings();
        getWeather(true); // 強制更新
        applyDisplayTypeEffect();
        applyTheme();
    });

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }

    // --- OLED 焼き付き防止 (Pixel Shifting) ---
    let oledInterval = null;
    function applyDisplayTypeEffect() {
        const type = getStore(STORAGE_KEYS.DISPLAY_TYPE);
        const datetimeArea = document.getElementById('datetime-area');
        if (!datetimeArea) return;

        if (oledInterval) clearInterval(oledInterval);
        
        if (type === 'oled') {
            oledInterval = setInterval(() => {
                const offsetX = Math.floor(Math.random() * 21) - 10; // -10 ~ 10px
                const offsetY = Math.floor(Math.random() * 21) - 10;
                datetimeArea.style.transition = 'transform 2s ease-in-out';
                datetimeArea.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }, 60000); // 1分ごとに移動
        } else {
            datetimeArea.style.transform = 'translate(0, 0)';
        }
    }
    applyDisplayTypeEffect();

    // --- Screen Wake Lock ---
    let wakeLock = null;
    const requestWakeLock = async () => {
        if (wakeLock !== null || !('wakeLock' in navigator)) return;
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => { wakeLock = null; });
        } catch (err) { console.error(err); }
    };
    const releaseWakeLock = async () => {
        if (wakeLock !== null) { await wakeLock.release(); wakeLock = null; }
    };

    document.addEventListener('fullscreenchange', () => {
        document.fullscreenElement ? requestWakeLock() : (!isPWA() && releaseWakeLock());
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && (isPWA() || document.fullscreenElement)) requestWakeLock();
    });
    if (isPWA()) requestWakeLock();

    // --- 初期テーマ適用 ---
    applyTheme();

    // --- 時計更新 ---
    function updateClock() {
        const hourElem = document.getElementById('hour');
        const minuteElem = document.getElementById('minute');
        const secondsElem = document.getElementById('seconds');
        const dateElem = document.getElementById('date');
        const yearElem = document.getElementById('year');
        const eraElem = document.getElementById('era');
        const monthEnElem = document.getElementById('month-en');
        const dayEnElem = document.getElementById('day-en');
        if (!hourElem || !minuteElem) return;

        const now = new Date();
        hourElem.textContent = String(now.getHours()).padStart(2, '0');
        minuteElem.textContent = String(now.getMinutes()).padStart(2, '0');
        if (secondsElem) secondsElem.textContent = String(now.getSeconds()).padStart(2, '0');
        
        try {
            const yearStr = now.getFullYear();
            const eraPart = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric' }).format(now);
            if (yearElem) yearElem.textContent = yearStr;
            if (eraElem) eraElem.textContent = eraPart;
        } catch (e) { /* fallback */ }

        if (monthEnElem) monthEnElem.textContent = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        if (dayEnElem) dayEnElem.textContent = now.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

        const MM = String(now.getMonth() + 1).padStart(2, '0');
        const DD = String(now.getDate()).padStart(2, '0');
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        dateElem.textContent = `${MM}/${DD} ${weekdays[now.getDay()]}`;
    }
    setInterval(updateClock, 1000); // インジケーターがあるので1秒毎に更新
    updateClock();

    // --- 天気取得 (キャッシュ対応) ---
    async function getWeather(force = false) {
        const apiKey = getStore(STORAGE_KEYS.API_KEY);
        const location = getStore(STORAGE_KEYS.LOCATION);
        const weatherElem = document.getElementById('weather');
        if (!weatherElem) return;

        if (!apiKey || !location) {
            weatherElem.textContent = 'APIキー未設定';
            return;
        }

        const now = Date.now();
        const lastFetch = parseInt(getStore(STORAGE_KEYS.WEATHER_CACHE_TIME) || '0');
        const cacheData = getStore(STORAGE_KEYS.WEATHER_CACHE);

        // キャッシュ有効チェック (30分 = 1800000ms)
        if (!force && cacheData && (now - lastFetch < 1800000)) {
            weatherElem.textContent = cacheData;
            return;
        }

        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&lang=ja`;
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const condText = data.current.condition.text;
            let icon = '';
            if (condText.includes('雨')) icon = '☂';
            else if (condText.includes('晴')) icon = '☀';
            else if (condText.includes('曇') || condText.includes('雲')) icon = '☁';
            else if (condText.includes('雪') || condText.includes('氷') || condText.includes('霙')) icon = '❄';
            else if (condText.includes('雷')) icon = '⚡';
            else if (condText.includes('霧') || condText.includes('霞')) icon = '🌫';

            const text = `${icon}${condText}  🌡${data.current.temp_c}°C  💧${data.current.humidity}%`;
            
            weatherElem.textContent = text;
            setStore(STORAGE_KEYS.WEATHER_CACHE, text);
            setStore(STORAGE_KEYS.WEATHER_CACHE_TIME, now.toString());
        } catch (e) {
            console.error(e);
            weatherElem.textContent = cacheData || '----';
        }
    }

    // --- 初期誘導 ---
    if (!getStore(STORAGE_KEYS.API_KEY)) {
        setTimeout(openSettings, 1000);
    } else {
        getWeather();
    }
    setInterval(() => getWeather(), 1800000);

    // --- フルスクリーン ---
    const fullScrBtn = document.getElementById('full-scr-btn');
    if (isPWA()) {
        document.getElementById('full-scr').style.display = 'none';
    } else if (fullScrBtn) {
        fullScrBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
            } else {
                document.body.requestFullscreen ? document.body.requestFullscreen() : document.body.webkitRequestFullscreen();
            }
        });
    }
});
