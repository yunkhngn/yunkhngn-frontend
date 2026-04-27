import * as si from 'systeminformation';
export declare class SystemService {
    getStats(): Promise<{
        cpu: si.Systeminformation.CpuData;
        mem: si.Systeminformation.MemData;
        osInfo: si.Systeminformation.OsData;
        currentLoad: si.Systeminformation.CurrentLoadData;
        fsSize: si.Systeminformation.FsSizeData[];
        time: si.Systeminformation.TimeData;
    }>;
}
