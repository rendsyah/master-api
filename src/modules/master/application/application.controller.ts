import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApplicationService } from './application.service';
import { ApplicationResponse } from './application.types';

@Controller({
  path: 'master',
  version: '1',
})
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('/application')
  @ApiOperation({ summary: 'Get application' })
  async getApplication(): Promise<ApplicationResponse> {
    return await this.applicationService.getApplication();
  }
}
