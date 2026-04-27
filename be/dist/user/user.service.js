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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const admin = require("firebase-admin");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUid(uid) {
        return this.prisma.user.findUnique({
            where: { uid },
        });
    }
    async findAll() {
        return this.prisma.user.findMany();
    }
    async create(email, password, name, role = 'ADMIN') {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
        return this.prisma.user.create({
            data: {
                uid: userRecord.uid,
                email,
                name,
                role,
            },
        });
    }
    async update(uid, data) {
        if (data.password || data.name) {
            await admin.auth().updateUser(uid, {
                password: data.password,
                displayName: data.name,
            });
        }
        return this.prisma.user.update({
            where: { uid },
            data: {
                name: data.name,
                role: data.role,
            },
        });
    }
    async delete(uid) {
        await admin.auth().deleteUser(uid);
        return this.prisma.user.delete({
            where: { uid },
        });
    }
    async createOrUpdate(uid, email, avatarUrl, name) {
        const userEmail = email || `anonymous-${uid}@yunkhngn.local`;
        return this.prisma.user.upsert({
            where: { uid },
            update: {
                email: userEmail,
                avatarUrl,
                name,
            },
            create: {
                uid,
                email: userEmail,
                avatarUrl,
                name,
                role: 'USER',
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map