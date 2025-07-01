import { Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { ApplicationResponse } from './application.types';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectConnection()
    private readonly model: Knex,
  ) {}

  /**
   * Handle get application service
   * @returns
   */
  async getApplication(): Promise<ApplicationResponse> {
    const getApplication = await this.model('master_application')
      .select('id', 'name', 'version')
      .first();

    if (!getApplication) {
      throw new NotFoundException('Application not found');
    }

    return {
      id: getApplication.id,
      name: getApplication.name,
      version: getApplication.version,
    };
  }
}
