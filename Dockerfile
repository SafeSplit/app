# SafeSplit — Laravel app (raw `php artisan serve` + Vite `npm run dev`, no Apache)
FROM php:8.3-cli

# System libs for the PHP extensions below
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libicu-dev \
    libonig-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libwebp-dev \
    libgmp-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions required by Laravel + MariaDB
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        gmp \
        intl \
        mbstring \
        mysqli \
        pdo \
        pdo_mysql \
        pcntl \
        zip

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/local/bin/composer

# Node.js 22 (Vite / React)
COPY --from=node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:22 /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Non-root user matching the host uid so the mounted volume keeps correct ownership
ARG uid=1000
ARG user=safesplit
RUN useradd -G www-data,root -u $uid -d /home/$user $user \
    && mkdir -p /home/$user/.composer /home/$user/.npm \
    && chown -R $user:$user /home/$user

WORKDIR /var/www/html

# 8000 = php artisan serve, 49105 = Vite dev server
EXPOSE 8000 49105

USER $user
