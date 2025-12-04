import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly zoneId: string;
  private readonly accountId: string;
  private readonly apiToken: string;

  constructor(private configService: ConfigService) {
    this.zoneId = this.configService.get<string>('CLOUDFLARE_ZONE_ID');
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    this.apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');
  }

  async getAnalytics(period: '24h' | '7d' | '30d' = '24h') {
    if (!this.zoneId || !this.apiToken) {
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
      const response = await fetch(
        'https://api.cloudflare.com/client/v4/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: JSON.stringify({
            query,
            variables: {
              zoneTag: this.zoneId,
              since: since.toISOString(),
              until: now.toISOString(),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        this.logger.error('Cloudflare GraphQL errors', result.errors);
        throw new Error('Failed to fetch Cloudflare analytics');
      }

      const data = result.data.viewer.zones[0].httpRequests1hGroups;

      // Process data for frontend
      const processedData = data.map((item) => ({
        time: item.dimensions.datetime,
        requests: item.sum.requests,
        bytes: item.sum.bytes,
        pageViews: item.sum.pageViews,
        threats: item.sum.threats,
      }));

      // Calculate totals
      const totals = processedData.reduce(
        (acc, curr) => ({
          requests: acc.requests + curr.requests,
          bytes: acc.bytes + curr.bytes,
          pageViews: acc.pageViews + curr.pageViews,
          threats: acc.threats + curr.threats,
        }),
        { requests: 0, bytes: 0, pageViews: 0, threats: 0 },
      );

      return {
        chartData: processedData,
        totals,
      };
    } catch (error) {
      this.logger.error('Failed to fetch analytics', error);
      throw error;
    }
  }
}
