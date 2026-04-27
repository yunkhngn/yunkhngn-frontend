"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let CloudinaryService = class CloudinaryService {
    async uploadImage(file) {
        return new Promise((resolve, reject) => {
            const upload = cloudinary_1.v2.uploader.upload_stream({ folder: 'blog-portfolio' }, (error, result) => {
                if (error)
                    return reject(new Error(error.message));
                resolve(result);
            });
            stream_1.Readable.from(file.buffer).pipe(upload);
        });
    }
    generateUploadSignature(params) {
        const config = cloudinary_1.v2.config();
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary_1.v2.utils.api_sign_request({ ...params, timestamp }, config.api_secret);
        return {
            signature,
            timestamp,
            cloudName: config.cloud_name,
            apiKey: config.api_key,
        };
    }
    async getImages(next_cursor) {
        try {
            const result = await cloudinary_1.v2.api.resources({
                type: 'upload',
                prefix: 'blog-portfolio',
                max_results: 50,
                next_cursor,
                direction: 'desc',
            });
            return result;
        }
        catch (error) {
            throw new Error(`Failed to fetch images: ${error.message}`);
        }
    }
    async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map