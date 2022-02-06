FROM php:7.4-cli-bullseye
COPY . /usr/projects/chs
WORKDIR /usr/projects/chs
CMD ./_run_public.sh