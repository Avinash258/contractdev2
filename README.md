# Contract Testing Framework (`contractdev2`)

Consumer-driven **contract testing** for GraphQL + gRPC style services â€” broker-style verification and CI-oriented gates.

> Package name: `contract-testing-graphql` Â· [Portfolio](https://avinash258.github.io/Protfolio/)

## Overview

Proof-of-concept and reference setup for service-boundary verification: consumers publish expectations, providers verify against them, and failures surface before UI suites run. Includes Pact-style flows, sample schemas, and a small UI for exploration.

## Features

- Consumer and provider contract test scripts
- GraphQL schema + gRPC / protobuf samples under `proto/`
- Published pact artifacts under `pacts/`
- Jest-based runners with dedicated contract scripts
- Docs and start helpers for local demos

## Stack

- JavaScript Â· Node.js
- Jest Â· Babel
- Pact / contract checks
- GraphQL Â· gRPC samples

## Getting started

```bash
npm install
npm start          # run local app helpers (see START.bat on Windows)
npm test
npm run test:contract
npm run test:consumer
npm run test:against
```

## Project layout

```
src/      application / provider code
tests/    consumer & contract suites
pacts/    generated pact files
proto/    gRPC definitions
ui/       lightweight UI
docs/     walkthrough notes
```

## Author

**Avinash Sharma** â€” QA Automation Architect / Lead SDET  
[GitHub](https://github.com/Avinash258) Â· [LinkedIn](https://www.linkedin.com/in/p-avinash-sharma-8b0203b9/) Â· [Portfolio](https://avinash258.github.io/Protfolio/)
