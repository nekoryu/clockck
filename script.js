// 実機デバッグ用：エラーを画面に表示する
window.onerror = function (msg, url, line, col, error) {
    const debugDiv = document.getElementById('debug-log');
    if (debugDiv) {
        debugDiv.style.display = 'block';
        debugDiv.innerHTML += `<div>ERROR: ${msg}<br>at ${line}:${col}</div>`;
    }
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    // 画面中央にデバッグログ用エリアを一時作成（不要になればCSSで消せます）
    const debugLog = document.createElement('div');
    debugLog.id = 'debug-log';
    debugLog.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; background:rgba(255,0,0,0.8); color:white; font-size:12px; z-index:10000; display:none; max-height:200px; overflow:auto; padding:10px; font-family:monospace;';
    document.body.appendChild(debugLog);

    // 画面サイズに合わせてストレッチ（拡縮）させる処理
    const mainElement = document.querySelector('main');
    function updateScale() {
        if (!mainElement) return;
        const scaleX = window.innerWidth / 2400;
        const scaleY = window.innerHeight / 1080;
        mainElement.style.transform = `scale(${scaleX}, ${scaleY})`;
    }
    updateScale();
    window.addEventListener('resize', updateScale);

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
            const debugDiv = document.getElementById('debug-log');
            if (debugDiv) {
                debugDiv.style.display = 'block';
                debugDiv.innerHTML += `<div>getClock Error: ${err.message}</div>`;
            }
        }
    }
    getClock(); // 初回実行
    setInterval(getClock, 33000); // 33秒ごとに更新

    if (mainElement) {
        mainElement.addEventListener('click', () => {
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
                // 天気情報が取れなくても時計は動かすべきなので、静かにエラーを出すだけにする
            });
    }
    getWeather(); // 初回実行
    setInterval(getWeather, 1000 * 60 * 30); // 30分ごとに更新
});
