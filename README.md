 # URL Fetch API

Small NestJS service that accepts URLs for background fetching and exposes results.

## Features

- `POST /fetch` — accepts { "urls": string[] } and validates URLs with class-validator.
- `GET /fetch` — returns an array of fetch items and their current status and metadata.
- Data is stored in-memory (no persistence). 
- Fetching runs in the background after enqueue.
- Swagger UI available at `/api` (see setup).

## Requirements
 - Node 18+ (recommended)
- npm

## Getting started

```bash
npm install
# install runtime deps if missing:
npm install axios class-validator class-transformer @nestjs/swagger swagger-ui-express
```
```bash
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
Response (example):
```json
{ "count": 2, "urls": ["https://example.com","https://httpbin.org/redirect/1"] }
```

### GET /fetch

Returns an array of items with fields: `url`, `finalUrl?`, `status`, `httpStatusCode?`, `content?`, `error?`.

Curl example:

```bash
curl http://localhost:3000/fetch
```
Response (example):
```json
[
  { "url": "https://example.com", "finalUrl": "https://example.com", "status": "completed", "httpStatusCode": 200, "content": "<html>..." },
  { "url": "http://no-such-host.example.invalid", "status": "failed", "error": "DNS lookup failed" }
]
```
## Testing
Run unit tests (Jest):
```bash
npm run test
```

## Project structure
```bash
src/
  fetch/
    fetch.module.ts
    fetch.controller.ts
    fetch.service.ts
    dto/create-fetch.dto.ts
    fetch.service.spec.ts
    fetch.controller.spec.ts
  app.module.ts
  main.ts
 ```
## Implementation Notes

- FetchService stores items in memory and processes pending items asynchronously
  with limited concurrency. Redirects are handled automatically via Axios
  (`maxRedirects`).
- getAll()` returns a copy of internal items to prevent external mutation.
- `processPending()` includes a processing guard to avoid overlapping executions
  when multiple enqueue requests are received.
- Error handling maps common network errors to friendly messages
  (e.g. `ENOTFOUND` → "DNS lookup failed").

## Next steps

- Add persistent storage (database).
- Add e2e tests covering POST/GET and fetch processing.
