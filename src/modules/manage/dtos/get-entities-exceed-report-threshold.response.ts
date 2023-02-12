import { ApiProperty } from '@nestjs/swagger';
import { ReportEntityType } from 'src/modules/report/enums/report-entity-type.enum';

export class GetEntitiesExceedReportThresholdResponseDto {
    @ApiProperty({
        description: '关联的实体类型,0表示评论,1表示猫咪照片',
        enum: ReportEntityType,
    })
    entityType: ReportEntityType;

    @ApiProperty({ description: '关联的实体ID' })
    entityID: number;

    @ApiProperty({ description: '举报数量' })
    reportCount: number;
}
