#!/bin/bash
export APP_ENV=docker
php artisan schedule:work &
php artisan websockets:serve --port=8001 &
php artisan serve --host 0.0.0.0