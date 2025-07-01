import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export const multerOptions = (mimes: string[], maxSize: number = 5): MulterOptions => {
  return {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!mimes.includes(file.mimetype)) {
        return cb(
          new BadRequestException(`Invalid extension, allowed (${mimes.join(', ')})`),
          false,
        );
      }
      cb(null, true);
    },
    limits: {
      fileSize: maxSize * 1024 * 1024,
    },
  };
};
