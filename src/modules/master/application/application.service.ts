import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MasterApplication } from 'src/datasources/entities';

import { ApplicationResponse } from './application.types';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(MasterApplication)
    private readonly MasterApplicationRepository: Repository<MasterApplication>,
  ) {}

  /**
   * Handle get application service
   * @returns
   */
  async getApplication(): Promise<ApplicationResponse> {
    const getApplication = await this.MasterApplicationRepository.createQueryBuilder('application')
      .select([
        'application.id AS id',
        'application.name AS name',
        'application.version AS version',
      ])
      .getRawOne();

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
