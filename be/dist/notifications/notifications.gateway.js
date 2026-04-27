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
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let NotificationsGateway = class NotificationsGateway {
    constructor() {
        this.logger = new common_1.Logger('NotificationsGateway');
        this.adminSocketId = null;
    }
    afterInit() {
        this.logger.log('Init');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        if (client.id === this.adminSocketId) {
            this.adminSocketId = null;
            this.server.emit('admin-status', { online: false });
            this.logger.log('Admin disconnected');
        }
    }
    handleAdminIdentity(client) {
        this.adminSocketId = client.id;
        this.server.emit('admin-status', { online: true });
        this.logger.log(`Admin identified: ${client.id}`);
    }
    handleCheckAdminStatus(client) {
        client.emit('admin-status', { online: !!this.adminSocketId });
    }
    sendNotification(notification) {
        this.server.emit('newNotification', notification);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('identity-admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleAdminIdentity", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('check-admin-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleCheckAdminStatus", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map