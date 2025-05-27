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

## Tech Stack

- Node.js (>= v22.0.0)

- PostgreSQL (Database)

- Docker & Docker Compose (Containerization)

- Swagger (API Documentation)

- Grafana Loki (Log Monitoring)

## Configuration

The application uses environment variables for configuration. Before running, copy .env.example to .env and set the required values:

```bash
.env
```

Ensure .env contains the following:

```bash
# API CONFIG
API_NAME=master # Default API name
API_DOCS=1 # Enable API Documentation (for production set to 0)
API_PORT=8080 # Change with your port

# DATABASE CONFIG
DB_TYPE=postgres # Default database
DB_HOST=postgres # Change with IP / Docker Service
DB_PORT=5432 # Change with your database port
DB_USER=postgres # Default database user
DB_PASS=123 # Change with your database password
DB_NAME=db_master # Default database name

# LOKI CONFIG
LOKI_URL=http://loki:3100 # Change with your IP / Docker Service
LOKI_USER=admin # Change with LOKI user
LOKI_PASS=admin # Change with LOKI password

# JWT CONFIG
# openssl rand -base64 32
JWT_SECRET=secret # Change with openssl
JWT_EXPIRES_IN=1d

# ENCRYPTION CONFIG
# openssl rand -base64 24
CRYPTO_SECRET=secret # Change with openssl
```

## Development

To run the service locally, you can either use Docker or run it manually.

#### Running without Docker

Ensure you have Node.js installed, then:

```bash
npm install
npm run start:dev
```

## Deployment

#### Deployment Branches

There are one deployment branches:

- main

#### Deploy to Production

```bash
makefile deploy
```

## API Documentation

Swagger documentation is available at:

```bash
http://localhost:8080/api/docs
```

You can use this endpoint to explore and test the available API routes.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
