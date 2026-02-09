import { Injectable } from '@nestjs/common';
import * as si from 'systeminformation';

@Injectable()
export class SystemService {
  async getStats() {
    try {
      const [cpu, mem, osInfo, currentLoad, fsSize] = // Removed dockerContainers as it might require socket access
        await Promise.all([
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
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }
}
