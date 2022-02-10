export APP_ENV=docker
php artisan db:wipe
php artisan migrate
php artisan db:seed