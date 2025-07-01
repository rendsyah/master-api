// workers/Upload/Upload.worker.service.ts
import { Injectable } from '@nestjs/common';
import { Piscina } from 'piscina';
import path from 'path';

import { UploadWorkerRequest, UploadWorkerTaskMap } from './upload.worker.types';

@Injectable()
export class UploadWorkerService {
  private pool: Piscina;

  constructor() {
    this.pool = new Piscina({
      filename: path.resolve(__dirname, './upload.worker.js'),
      maxThreads: 2,
    });
  }

  /**
   * Handle status upload worker service
   * @returns
   */
  status() {
    return {
      queueSize: this.pool.queueSize,
      completed: this.pool.completed,
    };
  }

  /**
   * Handle run upload worker service
   * @param request
   * @returns
   */
  run<T extends keyof UploadWorkerTaskMap>(request: UploadWorkerRequest<T>) {
    return this.pool.run(request);
  }
}
