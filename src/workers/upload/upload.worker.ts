import fs from 'fs';
import sharp from 'sharp';

import { logger } from 'src/commons/logger';

import { sleep } from '../utils';
import { UploadWorkerRequest, UploadWorkerTask, WorkerProcessing } from './upload.worker.types';

const imageProcessing = async (data: WorkerProcessing) => {
  const { buffer, original_name, filename, dest, retries = 3 } = data;

  const req = {
    original_name,
    filename,
    dest,
    retries,
  };

  const startTime = Date.now();

  try {
    await sharp(buffer)
      .resize(800, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(dest);

    const responseTime = Date.now() - startTime;

    logger.info('Image processing success', {
      labels: { service: 'upload-worker' },
      req,
      res: {
        success: true,
        responseTime,
      },
    });
  } catch (err) {
    if (retries > 0) {
      await sleep(1000);
      await imageProcessing({
        buffer,
        original_name,
        filename,
        dest,
        retries: retries - 1,
      });
    } else {
      logger.error('Image processing failed', {
        labels: { service: 'upload-worker' },
        req,
        stack: err.stack,
        stackError: err,
      });
      throw err;
    }
  }
};

const fileProcessing = async (data: WorkerProcessing) => {
  const { buffer, original_name, filename, dest, retries = 3 } = data;

  const req = {
    original_name,
    filename,
    dest,
    retries,
  };

  const startTime = Date.now();

  try {
    await fs.promises.writeFile(dest, buffer);

    const responseTime = Date.now() - startTime;

    logger.info('File processing success', {
      labels: { service: 'upload-worker-service' },
      req,
      res: {
        success: true,
        responseTime,
      },
    });
  } catch (err) {
    if (retries > 0) {
      await sleep(1000);
      await fileProcessing({
        buffer,
        original_name,
        filename,
        dest,
        retries: retries - 1,
      });
    } else {
      logger.error('File processing failed', {
        labels: { service: 'upload-worker-service' },
        req,
        stack: err.stack,
        stackError: err,
      });
      throw err;
    }
  }
};

const tasks: UploadWorkerTask = {
  'image.processing': imageProcessing,
  'file.processing': fileProcessing,
};

export default async (input: UploadWorkerRequest) => {
  const task = tasks[input.task];

  if (!task) {
    throw new Error('Invalid task');
  }

  return task(input.data);
};
