import { CloudflareService } from './cloudflare.service';
export declare class CloudflareController {
    private readonly cloudflareService;
    constructor(cloudflareService: CloudflareService);
    getAnalytics(period: '24h' | '7d' | '30d'): Promise<{
        chartData: any;
        totals: any;
    }>;
}
