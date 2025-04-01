#!/usr/bin/env bash

curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install nodejs -y
npm config set registry https://registry.npmmirror.com
npm i -g yarn
npm i -g pm2