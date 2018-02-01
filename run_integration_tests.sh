#!/usr/bin/env bash

node server/server.js&
npm run test:integration
sleep 2
kill %1
exit $?
