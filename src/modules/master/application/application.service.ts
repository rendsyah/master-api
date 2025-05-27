import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MasterApplication } from 'src/datasources/entities';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(MasterApplication)
    private readonly MasterApplicationRepository: Repository<MasterApplication>,
  ) {}

  async getApplication(): Promise<Response.Application> {
    const getApplication: Response.Application =
      await this.MasterApplicationRepository.createQueryBuilder('application')
        .select([
          'application.id AS id',
          'application.name AS name',
          'application.version AS version',
        ])
        .getRawOne();

    if (!getApplication) {
      throw new NotFoundException('Application not found');
    }

    return getApplication;
  }
}
