#!/usr/bin/env sh

pnpm tsc --build

if [ -d .git ];
then
    pnpm husky install
fi
