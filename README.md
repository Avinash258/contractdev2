# VaultMesh — GraphQL + gRPC contract testing

**Project folder**

```
C:\Project\contractTestingGraphQl
```

Start the app here, leave it running, then run tests against it.

## 1. Start the application

Double-click `START.bat`, or:

```bash
cd C:\Project\contractTestingGraphQl
npm install
npm start
```

Leave that window open.

| Surface | URL |
|---------|-----|
| Website | http://localhost:4000 |
| GraphQL | `POST http://localhost:4000/graphql` |
| gRPC | `localhost:50051` |

Login: `demo@fintech.com` / `demo123`

## 2. Run tests against that running app

Double-click `RUN-TESTS.bat` in the **same folder**, or:

```bash
cd C:\Project\contractTestingGraphQl
npm test
```

`npm test` does **not** start or stop the app. If VaultMesh is down, tests fail and tell you to run `START.bat`.

Design: [`docs/VAULTMESH_DESIGN.md`](docs/VAULTMESH_DESIGN.md)
