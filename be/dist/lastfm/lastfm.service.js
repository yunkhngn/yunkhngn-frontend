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
var LastFmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastFmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const settings_service_1 = require("../settings/settings.service");
const axios_1 = require("axios");
let LastFmService = LastFmService_1 = class LastFmService {
    constructor(configService, settingsService) {
        this.configService = configService;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(LastFmService_1.name);
        this.baseUrl = 'https://ws.audioscrobbler.com/2.0/';
    }
    async onModuleInit() {
        const key = await this.getApiKey();
        const user = await this.getUsername();
        if (!key || !user) {
            this.logger.warn('Last.fm configuration missing. Widget will not work.');
        }
    }
    async getApiKey() {
        return ((await this.settingsService.getDecryptedSetting('lastfm_api_key')) ||
            this.configService.get('LASTFM_API_KEY'));
    }
    async getUsername() {
        return ((await this.settingsService.getDecryptedSetting('lastfm_username')) ||
            this.configService.get('LASTFM_USERNAME'));
    }
    async getRecentTrack() {
        const apiKey = await this.getApiKey();
        const username = await this.getUsername();
        if (!apiKey || !username)
            return null;
        try {
            const { data } = await axios_1.default.get(this.baseUrl, {
                params: {
                    method: 'user.getrecenttracks',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                    limit: 1,
                },
            });
            const track = data?.recenttracks?.track?.[0];
            if (!track)
                return null;
            return {
                name: track.name,
                artist: track.artist['#text'],
                album: track.album['#text'],
                art: track.image?.find((i) => i.size === 'medium')?.['#text'] ||
                    track.image?.find((i) => i.size === 'small')?.['#text'],
                url: track.url,
                isNowPlaying: !!track['@attr']?.nowplaying,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch Last.fm data', error);
            return null;
        }
    }
};
exports.LastFmService = LastFmService;
exports.LastFmService = LastFmService = LastFmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        settings_service_1.SettingsService])
], LastFmService);
//# sourceMappingURL=lastfm.service.js.map