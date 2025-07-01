export type UploadWorkerTaskMap = {
  'image.processing': WorkerProcessing;
  'file.processing': WorkerProcessing;
};

export type UploadWorkerTask = {
  [K in keyof UploadWorkerTaskMap]: (data: UploadWorkerTaskMap[K]) => Promise<void>;
};

export type UploadWorkerRequest<T extends keyof UploadWorkerTaskMap = keyof UploadWorkerTaskMap> = {
  task: T;
  data: UploadWorkerTaskMap[T];
};

export type WorkerProcessing = {
  buffer: Buffer;
  original_name: string;
  filename: string;
  dest: string;
  retries?: number;
};
