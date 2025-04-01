#!/usr/bin/env bash

yarn build
cp run.sh ./dist
cp package.json ./dist
cp yarn.lock ./dist