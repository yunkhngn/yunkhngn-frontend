import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
    generateUploadSignature(params: Record<string, any>): {
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
    };
    getImages(next_cursor?: string): Promise<any>;
    deleteImage(publicId: string): Promise<any>;
}
