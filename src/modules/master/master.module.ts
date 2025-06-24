import { Global, Module } from '@nestjs/common';

import { ApplicationModule } from './application/application.module';

@Global()
@Module({
  imports: [ApplicationModule],
})
export class MasterModule {}
