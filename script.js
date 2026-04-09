document.addEventListener('DOMContentLoaded', () => {
    // PWA（スタンドアロンまたはフルスクリーンモード）で起動しているか判定
    function isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.matchMedia('(display-mode: fullscreen)').matches ||
               window.navigator.standalone;
    }

    // 画面サイズに合わせてストレッチ（拡縮）させる処理
    const mainElement = document.querySelector('main');
    function updateScale() {
        if (!mainElement) return;
        
        // window.innerWidth よりも documentElement.clientWidth の方が
        // モバイルブラウザのアドレスバー等の影響を受けにくく正確な場合があります
        const viewWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewHeight = document.documentElement.clientHeight || window.innerHeight;

        if (viewWidth === 0 || viewHeight === 0) return;

        const scaleX = viewWidth / 2400;
        const scaleY = viewHeight / 1080;
        mainElement.style.transform = `scale(${scaleX}, ${scaleY})`;
    }

    // スケーリングの多段実行（起動時の安定化）
    updateScale();
    setTimeout(updateScale, 300); // 300ms後に再計算
    setTimeout(updateScale, 1000); // 1秒後にも念押しで再計算
    window.addEventListener('load', updateScale);
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    function getClock() {
        try {
            const clockElem = document.getElementById('clock');
            const dateElem = document.getElementById('date');
            const yearElem = document.getElementById('year');
            const eraElem = document.getElementById('era');

            if (!clockElem || !dateElem) return;

            const now = new Date();
            clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const yearStr = now.getFullYear();
            let eraStr = "";
            try {
                // Intl がサポートされていない環境向けのフォールバック
                eraStr = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric' }).format(now);
            } catch (e) {
                eraStr = "西暦" + yearStr + "年"; 
            }
            
            if (yearElem) yearElem.textContent = yearStr;
            if (eraElem) eraElem.textContent = eraStr;

            const MM = String(now.getMonth() + 1).padStart(2, '0');
            const DD = String(now.getDate()).padStart(2, '0');
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            const w = weekdays[now.getDay()];
            dateElem.textContent = `${MM}/${DD} ${w}`;
        } catch (err) {
            console.error("getClock Error:", err);
        }
    }
    getClock(); // 初回実行
    setInterval(getClock, 33000); // ユーザー設定の更新間隔

    if (mainElement) {
        mainElement.addEventListener('click', () => {
            // すでに PWA（フルスクリーン）として起動している場合は、
            // requestFullscreen を呼び出すと競合してブラックアウトするためスキップする
            if (isPWA()) {
                console.log("PWA mode: Skip requestFullscreen to avoid blackout.");
                return;
            }

            const body = document.body;
            try {
                if (body.requestFullscreen) {
                    body.requestFullscreen();
                } else if (body.webkitRequestFullscreen) {
                    body.webkitRequestFullscreen();
                } else if (body.mozRequestFullScreen) {
                    body.mozRequestFullScreen();
                } else if (body.msRequestFullscreen) {
                    body.msRequestFullscreen();
                }
            } catch (e) {
                console.error("Fullscreen Error:", e);
            }
        });
    }

    function getWeather() {
        const apiKey = 'a891eb341dae437fba441934252204';
        const location = 'Sapporo';
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&lang=ja`;

        const weatherElem = document.getElementById('weather');
        if (!weatherElem) return;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const weatherDescription = data.current.condition.text;
                const tempC = data.current.temp_c;
                const humidity = data.current.humidity;
                weatherElem.textContent = `${weatherDescription}  ${tempC}°C  ${humidity}%`;
            })
            .catch(error => {
                console.error('天気データの取得失敗:', error);
            });
    }
    getWeather(); // 初回実行
    setInterval(getWeather, 1000 * 60 * 30); // 30分ごとに更新
});
