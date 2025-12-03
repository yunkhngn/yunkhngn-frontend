import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateReportDto {
  @IsNotEmpty()
  @IsIn(['pending', 'resolved', 'dismissed', 'rejected'])
  status: string;
}
