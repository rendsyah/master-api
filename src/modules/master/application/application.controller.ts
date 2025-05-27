import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApplicationService } from './application.service';

@Controller({
  path: 'master',
  version: '1',
})
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('/application')
  @ApiOperation({ summary: 'Get application' })
  async getApplication(): Promise<Response.Application> {
    return await this.applicationService.getApplication();
  }
}
