import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { ReportEntityType } from 'src/modules/report/enums/report-entity-type.enum';

export class GetEntitiesExceedReportThresholdQueryDto {
    @ApiProperty({
        description: '关联的实体类型,0表示评论,1表示猫咪照片',
        enum: ReportEntityType,
    })
    @IsEnum(ReportEntityType)
    entityType: ReportEntityType;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    @ApiProperty({ description: '分页参数,限制数量', minimum: 1, maximum: 30 })
    limit: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @ApiProperty({ description: '分页参数,开始位置', minimum: 0 })
    start: number;
}
