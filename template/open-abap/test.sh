#!/bin/bash

set -e
set -o pipefail

# Install FaaS cli if not installed yet
if [ ! -f  /usr/local/bin/faas-cli ]; then
    curl -sSLf https://cli.openfaas.com | sudo sh
fi

# Integrate the template and the function folder
faas-cli build --shrinkwrap

cd build
cd $(ls)
npm i

if [ -z $1 ]; then
    cp -R ../../test . # default (locally): copy tests from non-shrinkwrapped folder
elif [ $1 -eq '.' ]; then
# no need to copy anything
    echo 'Executing tests from local directory'
else
    cp -R $1 .
fi

npm test