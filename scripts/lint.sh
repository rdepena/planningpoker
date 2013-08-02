#!/bin/bash

echo ""
echo "Starting linting file" $1
echo "-------------------------------------------------------------------"

nodemon --watch ../ --exec "jslint ../$1"
