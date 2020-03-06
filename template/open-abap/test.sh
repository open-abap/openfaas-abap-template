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

cp -R ../../test .
npm test