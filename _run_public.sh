#!/bin/bash
php artisan websockets:serve &
php artisan serve --host 0.0.0.0