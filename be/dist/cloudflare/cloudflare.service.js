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
var CloudflareService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const settings_service_1 = require("../settings/settings.service");
let CloudflareService = CloudflareService_1 = class CloudflareService {
    constructor(configService, settingsService) {
        this.configService = configService;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(CloudflareService_1.name);
    }
    async getAnalytics(period = '24h') {
        const zoneId = (await this.settingsService.getDecryptedSetting('cloudflare_zone_id')) ||
            this.configService.get('CLOUDFLARE_ZONE_ID');
        const apiToken = (await this.settingsService.getDecryptedSetting('cloudflare_api_token')) || this.configService.get('CLOUDFLARE_API_TOKEN');
        if (!zoneId || !apiToken) {
            this.logger.warn('Cloudflare credentials not configured');
            return null;
        }
        const now = new Date();
        const since = new Date();
        switch (period) {
            case '24h':
                since.setDate(now.getDate() - 1);
                break;
            case '7d':
                since.setDate(now.getDate() - 7);
                break;
            case '30d':
                since.setDate(now.getDate() - 30);
                break;
        }
        const query = `
      query GetZoneAnalytics($zoneTag: string, $since: Time, $until: Time) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequests1hGroups(
              limit: 1000,
              filter: { datetime_geq: $since, datetime_leq: $until }
              orderBy: [datetime_ASC]
            ) {
              dimensions {
                datetime
              }
              sum {
                requests
                bytes
                pageViews
                threats
              }
            }
          }
        }
      }
    `;
        try {
            const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        zoneTag: zoneId,
                        since: since.toISOString(),
                        until: now.toISOString(),
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Cloudflare API error: ${response.statusText}`);
            }
            const result = await response.json();
            if (result.errors) {
                this.logger.error('Cloudflare GraphQL errors', result.errors);
                throw new Error('Failed to fetch Cloudflare analytics');
            }
            const data = result.data.viewer.zones[0].httpRequests1hGroups;
            const processedData = data.map((item) => ({
                time: item.dimensions.datetime,
                requests: item.sum.requests,
                bytes: item.sum.bytes,
                pageViews: item.sum.pageViews,
                threats: item.sum.threats,
            }));
            const totals = processedData.reduce((acc, curr) => ({
                requests: acc.requests + curr.requests,
                bytes: acc.bytes + curr.bytes,
                pageViews: acc.pageViews + curr.pageViews,
                threats: acc.threats + curr.threats,
            }), { requests: 0, bytes: 0, pageViews: 0, threats: 0 });
            return {
                chartData: processedData,
                totals,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch analytics', error);
            throw error;
        }
    }
};
exports.CloudflareService = CloudflareService;
exports.CloudflareService = CloudflareService = CloudflareService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        settings_service_1.SettingsService])
], CloudflareService);
//# sourceMappingURL=cloudflare.service.js.map