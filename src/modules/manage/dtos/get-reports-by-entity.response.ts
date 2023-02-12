import { ApiProperty } from '@nestjs/swagger';
import { ReportType } from 'src/modules/report/enums/report-type.enum';

export class GetReportsByEntityResponseDto {
    @ApiProperty({ description: '举报ID', minimum: 1 })
    id: number;

    @ApiProperty({
        description: '举报类型,0表示违法违禁,1表示人身攻击,2表示撞车,3表示广告,4表示其他',
        enum: ReportType,
    })
    type: ReportType;

    @ApiProperty({ description: '用户ID' })
    userID: number;

    @ApiProperty({ description: '举报内容' })
    content: string;

    @ApiProperty({ description: '创建时间' })
    createdDate: Date;
}
