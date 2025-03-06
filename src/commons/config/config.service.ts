import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get NODE_ENV(): string {
    return this.configService.getOrThrow('NODE_ENV', { infer: true });
  }

  get API_NAME(): string {
    return this.configService.getOrThrow('API_NAME', { infer: true });
  }

  get API_DOCS(): number {
    return this.configService.getOrThrow('API_DOCS', { infer: true });
  }

  get API_PORT(): number {
    return this.configService.getOrThrow('API_PORT', { infer: true });
  }

  get DB_TYPE(): string {
    return this.configService.getOrThrow('DB_TYPE', { infer: true });
  }

  get DB_HOST(): string {
    return this.configService.getOrThrow('DB_HOST', { infer: true });
  }

  get DB_PORT(): number {
    return this.configService.getOrThrow('DB_PORT', { infer: true });
  }

  get DB_USER(): string {
    return this.configService.getOrThrow('DB_USER', { infer: true });
  }

  get DB_PASS(): string {
    return this.configService.getOrThrow('DB_PASS', { infer: true });
  }

  get DB_NAME(): string {
    return this.configService.getOrThrow('DB_NAME', { infer: true });
  }

  get LOKI_URL(): string {
    return this.configService.getOrThrow('LOKI_URL', { infer: true });
  }

  get JWT_SECRET(): string {
    return this.configService.getOrThrow('JWT_SECRET', { infer: true });
  }

  get JWT_EXPIRES_IN(): string {
    return this.configService.getOrThrow('JWT_EXPIRES_IN', { infer: true });
  }

  get CRYPTO_SECRET(): string {
    return this.configService.getOrThrow('CRYPTO_SECRET', { infer: true });
  }
}
