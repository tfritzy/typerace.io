#!/bin/sh
set -eu

mkdir -p .sim-dist
npx esbuild scripts/cosmic-defense-sim.ts --bundle --platform=node --format=esm --outfile=.sim-dist/cosmic-defense-sim.js
node .sim-dist/cosmic-defense-sim.js "$@"
