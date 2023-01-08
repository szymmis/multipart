#!/usr/bin/env bash
yarn test && yarn build && yarn bump $1 && npm publish
