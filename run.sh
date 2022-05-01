#!/bin/bash
export APP_ENV=docker
service postgresql start
nginx -g 'daemon off;' &
php-fpm &

php artisan db:wipe
php artisan migrate
php artisan db:seed

php artisan schedule:work &
php artisan websockets:serve --port=8001