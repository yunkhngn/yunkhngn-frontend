import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class MediaController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    getSignature(folder?: string, format?: string, publicId?: string): {
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
    };
    getImages(cursor?: string): Promise<any>;
    deleteImage(publicId: string): Promise<any>;
}
