import { IsNotEmpty, IsIn } from 'class-validator';
import { ReportStatus } from '../entities/comment-report.entity';

export class UpdateReportDto {
    @IsNotEmpty()
    @IsIn([ReportStatus.RESOLVED, ReportStatus.DISMISSED])
    status: ReportStatus;
}
