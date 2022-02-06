FROM php:7.4-cli-bullseye
COPY . /usr/projects/chs
WORKDIR /usr/projects/chs
EXPOSE 8000/tcp 8001/tcp
CMD ./_run.sh