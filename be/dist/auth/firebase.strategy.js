"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_http_bearer_1 = require("passport-http-bearer");
const admin = require("firebase-admin");
const user_service_1 = require("../user/user.service");
let FirebaseStrategy = class FirebaseStrategy extends (0, passport_1.PassportStrategy)(passport_http_bearer_1.Strategy, 'firebase') {
    constructor(userService) {
        super();
        this.userService = userService;
    }
    async validate(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = await this.userService.createOrUpdate(decodedToken.uid, decodedToken.email, decodedToken.picture, decodedToken.name);
            return {
                ...decodedToken,
                role: user.role,
                isAdmin: user.role === 'ADMIN',
            };
        }
        catch (error) {
            console.error('Firebase token verification failed:', error);
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    console.log('Token payload (aud/iss):', {
                        aud: payload.aud,
                        iss: payload.iss,
                    });
                }
            }
            catch (e) {
                console.error('Failed to decode token for debugging:', e);
            }
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.FirebaseStrategy = FirebaseStrategy;
exports.FirebaseStrategy = FirebaseStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], FirebaseStrategy);
//# sourceMappingURL=firebase.strategy.js.map