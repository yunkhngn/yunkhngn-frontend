import { LastFmService } from './lastfm.service';
export declare class LastFmController {
    private readonly lastFmService;
    constructor(lastFmService: LastFmService);
    getNowPlaying(): Promise<{
        name: any;
        artist: any;
        album: any;
        art: any;
        url: any;
        isNowPlaying: boolean;
    }>;
    getWidget(): Promise<string>;
}
