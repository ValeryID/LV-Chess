set APP_ENV=win
php artisan db:wipe
php artisan migrate
php artisan db:seed
pause