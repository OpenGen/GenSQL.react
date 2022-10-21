#!/usr/bin/env sh

pnpm esbuild --bundle --format=esm src/main.ts --outdir=dist --sourcemap

if [ -d .git ];
then
    pnpm husky install
fi
