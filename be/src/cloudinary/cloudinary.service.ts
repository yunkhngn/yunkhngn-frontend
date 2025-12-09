import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'blog-portfolio' },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  generateUploadSignature(params: Record<string, any>) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { ...params, timestamp },
      process.env.CLOUDINARY_API_SECRET,
    );
    return { signature, timestamp };
  }

  async getImages(next_cursor?: string) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'blog-portfolio', // filter by folder
        max_results: 50,
        next_cursor,
        direction: 'desc',
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }
  }

  async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}
