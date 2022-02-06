start http://localhost:8000
set APP_ENV=win
start php artisan websockets:serve --port=8001
php artisan serve --host 0.0.0.0
pause