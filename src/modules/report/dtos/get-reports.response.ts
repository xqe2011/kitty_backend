import { ApiProperty } from '@nestjs/swagger';
import { ReportEntityType } from '../enums/report-entity-type.enum';
import { ReportType } from '../enums/report-type.enum';

export class GetReportsResponseDto {
    @ApiProperty({ description: '反馈ID', minimum: 1 })
    id: number;

    @ApiProperty({
        description: '举报类型,0表示违法违禁,1表示人身攻击,2表示撞车,3表示广告,4表示其他',
        enum: ReportType,
    })
    type: ReportType;

    @ApiProperty({
        description: '关联的实体类型,0表示评论,1表示猫咪照片',
        enum: ReportEntityType,
    })
    entityType: ReportEntityType;

    @ApiProperty({ description: '关联的实体ID' })
    entityID: number;

    @ApiProperty({ description: '举报内容' })
    content: string;

    @ApiProperty({ description: '创建时间' })
    createdDate: Date;
}
