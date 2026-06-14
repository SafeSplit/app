#!/bin/sh
# SafeSplit app container entrypoint: install deps, migrate, then run Vite + Laravel.
set -e

cd /var/www/html

echo "==> composer install"
composer install --no-interaction --prefer-dist

echo "==> npm install"
npm install

# Wait for the database, then run migrations.
echo "==> waiting for database ($DB_HOST:$DB_PORT)"
until php -r "exit(@fsockopen(getenv('DB_HOST'), (int)getenv('DB_PORT')) ? 0 : 1);" 2>/dev/null; do
    sleep 2
done

echo "==> php artisan migrate"
php artisan migrate --force

# Vite dev server in the background, Laravel server in the foreground.
echo "==> starting Vite + Laravel"
npm run dev -- --host 0.0.0.0 --port 49105 &
exec php artisan serve --host=0.0.0.0 --port=8000
