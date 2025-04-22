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

        // XMLHttpRequest オブジェクトを作成
        const xhr = new XMLHttpRequest();

        // リクエストの設定
        xhr.open('GET', apiUrl, true); // メソッド, URL, 非同期フラグ

        // レスポンスを受け取ったときの処理
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                // リクエストが成功した場合
                try {
                    const data = JSON.parse(xhr.responseText); // レスポンス文字列をJSONにパース

                    console.log('天気データ:', data);

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

                } catch (e) {
                    console.error('天気データのパース中にエラーが発生しました:', e);
                }
            } else {
                // エラーレスポンスの場合（例: 401 Unauthorized, 403 Forbidden, 400 Bad Request など）
                let errorMessage = `HTTP error! status: ${xhr.status}`;
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    if (errorData && errorData.error) {
                        errorMessage += `, Code: ${errorData.error.code}, Message: ${errorData.error.message}`;
                    }
                } catch(e) {
                    // レスポンスがJSONでない場合のエラーは無視
                }
                console.error('天気データの取得中にエラーが発生しました:', errorMessage);
                // エラーメッセージをユーザーに表示するなどの処理
            }
        };
        
        // リクエスト中のエラー処理（ネットワークエラーなど）
        xhr.onerror = function() {
            console.error('ネットワークエラーが発生しました。');
            // ネットワークエラーメッセージをユーザーに表示するなどの処理
        };
        
        // リクエストを送信
        xhr.send();
    }
    getWeather(); // 初回実行
    setInterval(getWeather, 1000 * 60 * 30); // 30分ごとに更新
});
