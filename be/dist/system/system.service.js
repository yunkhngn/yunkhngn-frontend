"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const si = require("systeminformation");
let SystemService = class SystemService {
    async getStats() {
        try {
            const [cpu, mem, osInfo, currentLoad, fsSize] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.osInfo(),
                si.currentLoad(),
                si.fsSize(),
            ]);
            const time = si.time();
            return {
                cpu,
                mem,
                osInfo,
                currentLoad,
                fsSize,
                time,
            };
        }
        catch (error) {
            console.error('Error fetching system stats:', error);
            throw error;
        }
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)()
], SystemService);
//# sourceMappingURL=system.service.js.map