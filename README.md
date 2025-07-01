<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

## Master API

Master API serves as a foundational template for building backend APIs. It provides a standardized and scalable structure to accelerate development and ensure best practices in API design and implementation.

---

## Tech Stack

- Node.js (>= v22.0.0)

- PostgreSQL (Database)

- Swagger (API Documentation)

- Grafana Loki (Log Monitoring)

- Jest (Unit Testing)

- K6 (Performance Testing)

---

## Configuration

The api uses environment variables for configuration. Before running, copy .env.example to .env and set the required values:

```bash
.env
```

`.env` example:

```dotenv
# API CONFIG
API_NAME=master-service
API_DOCS=1
API_SEED=1
API_PORT=8080

# DATABASE CONFIG
DB_TYPE=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=123
DB_NAME=db_master

# LOG CONFIG
LOG_LEVEL=info

# LOKI CONFIG
LOKI_URL=http://127.0.0.1:3100
LOKI_USER=admin
LOKI_PASS=admin

# JWT CONFIG
# openssl rand -base64 32
JWT_SECRET=secret
JWT_EXPIRES_IN=1d

# ENCRYPTION CONFIG
# openssl rand -base64 24
CRYPTO_SECRET=secret
```

---

## Development

### Setup

Make sure you have **Node.js** installed.

Install dependencies:

```bash
pnpm install
```

### Start the App

Run the app in development mode:

```bash
pnpm run start:dev
```

---

## Database Migration

### Generate a New Migration

```bash
pnpm run migration:generate
```

### Run Migrations

```bash
pnpm run migration:run
```

### Revert the Last Migration

```bash
pnpm run migration:revert
```

> Ensure your database is up and accessible before running migration commands.

---

## Seeding the Database

Seed the database with initial data:

```bash
pnpm run seed:run
```

> Make sure the database is running before seeding.

---

## Testing

Run all unit and integration tests:

```bash
pnpm run test
```

### Test Coverage

Generate a coverage report:

```bash
pnpm run test:cov
```

View the HTML report:

```bash
# Linux
xdg-open coverage/lcov-report/index.html
# Windows
start coverage/lcov-report/index.html
# macOS
open coverage/lcov-report/index.html
```

---

## Deployment

### Deployment Branches

- `main`

### Deploy to Production

```bash
make deploy
```

---

## API Documentation

Swagger documentation is available at:

```
http://localhost:8080/api/docs
```

You can use this UI to explore and test API endpoints.

---

## Support

NestJS is an MIT-licensed open source project. Support is always appreciated!

Learn more: [https://docs.nestjs.com/support](https://docs.nestjs.com/support)

---

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

---

## License

NestJS is [MIT licensed](LICENSE).
