#!/usr/bin/env bash

Usage="Usage: run.sh -e [execute command]"
exeCmd=""

while getopts "e:" opt
do
  case $opt in
    e)
      exeCmd=$OPTARG
      ;;
    ?)
      echo $Usage
      exit 1
      ;;
  esac
done

shift $(($OPTIND - 1))
if [ -z "$exeCmd" ]; then
  echo $Usage
  exit 1
fi

cmd_start() {
  echo "executing command: start"
  yarn --production
  NODE_ENV=production pm2 start ./src/main.js --name apiservfst-prod -i 4
}

cmd_stop() {
  echo "executing command: stop"
  pm2 stop apiservfst-prod
}

cmd_restart() {
  echo "executing command: restart"
  pm2 restart apiservfst-prod
}

cmd_delete() {
  echo "executing command: delete"
  pm2 delete apiservfst-prod
}

cmd_logcat() {
  echo "executing command: logcat"
  pm2 logs apiservfst-prod
}

if [ "$exeCmd" = "start" ]; then
  cmd_start
elif [ "$exeCmd" = "stop" ]; then
  cmd_stop
elif [ "$exeCmd" = "restart" ]; then
  cmd_restart
elif [ "$exeCmd" = "delete" ]; then
  cmd_delete
elif [ "$exeCmd" = "logcat" ]; then
  cmd_logcat
else
  echo "unknown executing command: ${exeCmd}"
fi