import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  /**
   * handle health service
   * @returns
   */
  health() {
    return {
      status: 'up',
    };
  }
}
