@echo off
chcp 65001 >nul
echo [アクセス用URLのリスト]
echo 以下のどれかのURLにスマートフォン等からアクセスしてください：
powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4).IPAddress | Where-Object { $_ -ne '127.0.0.1' } | ForEach-Object { 'http://' + $_ + ':8000' }"
echo.
echo サーバーを待機中です...
python -m http.server 8000
pause
