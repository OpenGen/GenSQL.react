#!/usr/bin/env sh

pnpm eslint \
    --ignore-path .gitignore \
    --ext .jsx \
    --ext .js \
    --ext .jsx \
    --ext .ts \
    --ext .tsx \
    .
