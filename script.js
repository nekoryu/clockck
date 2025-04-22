$(function () {
    function getClock() {
        let clock = $("#clock");
        let date = $("#date");
        let time = new Date();
        clock.text(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        date.text(time.toLocaleDateString([], { month: '2-digit', day: '2-digit', weekday: 'short' }));
    }
    getClock(); // 初回実行
    let interval = 1000; // 1 second
    setInterval(getClock, interval);

    $('#full-scr-btn').on('click', function (e) {
        document.body.requestFullscreen();
    });

    function getWeather() {
        // **注意点:** 実際の使用では、APIキーをクライアントサイドのJavaScriptに直接書くのは避けるべきです。
        // サーバーサイドの処理を介するか、環境変数など安全な方法で管理することを強く推奨します。
        const apiKey = 'a891eb341dae437fba441934252204'; // ★ここに取得したWeatherAPI.comのAPIキーを設定してください★
        const location = 'Sapporo'; // '43.033427017611174, 141.4291066307619'; // ★取得したい場所を設定してください（例: London, New York, 〒100-0001, 緯度経度）★

        // 現在の天気予報を取得するAPIエンドポイント
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&lang=ja`; // lang=jaで日本語表示も可能（対応している場合）

        fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                // エラーレスポンスの場合（例: APIキーが無効、場所が見つからないなど）
                // WeatherAPI.comはエラーの詳細をJSONで返すことが多いです
                return response.json().then(err => { throw new Error(`HTTP error! status: ${response.status}, Code: ${err.error.code}, Message: ${err.error.message}`); });
            }
            return response.json();
        })
        .then(data => {
            // 例: 天気、気温、湿度などを表示
            const weatherDescription = data.current.condition.text; // 天気の詳細
            const tempC = data.current.temp_c; // 気温（摂氏）
            const tempF = data.current.temp_f; // 気温（華氏）
            const humidity = data.current.humidity; // 湿度
            const placeName = data.location.name; // 場所の名前

            let weather = $("#weather");
            weather.text(`${weatherDescription}  ${tempC}°C  ${humidity}%`);
            // let weatherPlaceName = $("#weather-placeName");
            // weatherPlaceName.text(`${placeName}`);

            // ★ここに取得したデータをHTML要素に表示するなどの処理を追加できます★
            // 例: document.getElementById('weather-info').innerText = `${placeName}: ${weatherDescription}, 気温: ${tempC}°C`;

        })
        .catch(error => {
            // エラーハンドリング
            console.error('天気データの取得中にエラーが発生しました:', error);
            // エラーメッセージをユーザーに表示するなどの処理
        });
    }
    getWeather(); // 初回実行
    setInterval(getWeather, 1000 * 60 * 30); // 30分ごとに更新
});
