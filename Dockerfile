FROM php:7.4-fpm-bullseye
RUN mkdir /var/run/php

RUN apt update && apt install -y nginx postgresql libpq-dev && \
docker-php-ext-install pdo_pgsql

USER postgres
RUN service postgresql start && \
psql --command 'CREATE USER "www-data" PASSWORD '"'"'123321'"'"';' && \
psql --command 'CREATE DATABASE lvdb OWNER "www-data";'
USER root

COPY ./.docker /
COPY --chown=www-data:www-data . /usr/projects/chs

WORKDIR /usr/projects/chs
EXPOSE 8000/tcp 8001/tcp
CMD ./_run.sh