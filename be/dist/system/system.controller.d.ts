import { SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getStats(): Promise<{
        cpu: import("systeminformation").Systeminformation.CpuData;
        mem: import("systeminformation").Systeminformation.MemData;
        osInfo: import("systeminformation").Systeminformation.OsData;
        currentLoad: import("systeminformation").Systeminformation.CurrentLoadData;
        fsSize: import("systeminformation").Systeminformation.FsSizeData[];
        time: import("systeminformation").Systeminformation.TimeData;
    }>;
}
