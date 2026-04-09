document.addEventListener('DOMContentLoaded', () => {
    // 画面サイズに合わせてストレッチ（拡縮）させる処理
    const mainElement = document.querySelector('main');
    function updateScale() {
        const scaleX = window.innerWidth / 2400;
        const scaleY = window.innerHeight / 1080;
        mainElement.style.transform = `scale(${scaleX}, ${scaleY})`;
    }
    updateScale();
    window.addEventListener('resize', updateScale);

    function getClock() {
        const clockElem = document.getElementById('clock');
        const dateElem = document.getElementById('date');
        const yearElem = document.getElementById('year');
        const eraElem = document.getElementById('era');

        const now = new Date();
        clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const yearStr = now.getFullYear();
        const eraStr = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric' }).format(now);
        yearElem.textContent = yearStr;
        eraElem.textContent = eraStr;

        const MM = String(now.getMonth() + 1).padStart(2, '0');
        const DD = String(now.getDate()).padStart(2, '0');
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const w = weekdays[now.getDay()];
        dateElem.textContent = `${MM}/${DD} ${w}`;
    }
    getClock(); // 初回実行
    setInterval(getClock, 10000); // 10秒ごとに更新

    mainElement.addEventListener('click', () => {
        const body = document.body;
        if (body.requestFullscreen) {
            body.requestFullscreen();
        } else if (body.webkitRequestFullscreen) {
            body.webkitRequestFullscreen();
        } else if (body.mozRequestFullScreen) {
            body.mozRequestFullScreen();
        } else if (body.msRequestFullscreen) {
            body.msRequestFullscreen();
        } else {
            console.error('フルスクリーンモードはこのブラウザでサポートされていません。');
        }
    });

    function getWeather() {
        const apiKey = 'a891eb341dae437fba441934252204';
        const location = 'Sapporo';
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&lang=ja`;

        const weatherElem = document.getElementById('weather');

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('天気データ:', data);
                const weatherDescription = data.current.condition.text;
                const tempC = data.current.temp_c;
                const humidity = data.current.humidity;
                weatherElem.textContent = `${weatherDescription}  ${tempC}°C  ${humidity}%`;
            })
            .catch(error => {
                console.error('天気データの取得失敗:', error);
                weatherElem.textContent = '天気データの取得中にエラーが発生しました';
            });
    }
    getWeather(); // 初回実行
    setInterval(getWeather, 1000 * 60 * 30); // 30分ごとに更新
});
