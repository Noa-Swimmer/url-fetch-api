<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

 # URL Fetch API

Small NestJS service that accepts URLs for background fetching and exposes results.

## Features

- `POST /fetch` — submit an array of HTTP/HTTPS URLs to be fetched later (validated with DTOs).
- `GET /fetch` — list submitted URLs and their current status and metadata.
- Swagger UI available at `/api` (see setup).

## Getting started

```bash
npm install
# ensure runtime deps are installed (if not already):
npm install axios class-validator class-transformer @nestjs/swagger swagger-ui-express
npm run start
```

Open the Swagger UI: http://localhost:3000/api

## Endpoints — examples

### POST /fetch

Request body example:

```json
{ "urls": ["https://example.com", "https://httpbin.org/redirect/1"] }
```

Curl example:

```bash
curl -X POST http://localhost:3000/fetch \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com","https://httpbin.org/redirect/1"]}'
```

### GET /fetch

Returns an array of items with fields: `url`, `finalUrl?`, `status`, `httpStatusCode?`, `content?`, `error?`.

Curl example:

```bash
curl http://localhost:3000/fetch
```

## Browser Console examples

```javascript
// POST
fetch('http://localhost:3000/fetch', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ urls: ['https://example.com'] })
}).then(r => r.json()).then(console.log).catch(console.error);

// GET
fetch('http://localhost:3000/fetch').then(r => r.json()).then(console.log);
```

## Notes

- The service stores data in-memory (process lifetime). No persistence yet.
- Fetching runs in background after enqueue; POST returns immediately with a summary.
- The fetch feature is encapsulated in `src/fetch/` as a `FetchModule`.

## Next steps (optional)

- Add persistence (database) to survive restarts.
- Add e2e tests covering POST/GET and fetch processing.
- Add a small HTML test page or manual trigger endpoint for demos.
