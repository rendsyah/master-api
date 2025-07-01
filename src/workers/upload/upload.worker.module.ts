import { Module } from '@nestjs/common';

import { UploadWorkerService } from './upload.worker.service';

@Module({
  providers: [UploadWorkerService],
  exports: [UploadWorkerService],
})
export class UploadWorkerModule {}
