import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min, Validate } from 'class-validator';
import { ReportEntityType } from 'src/modules/report/enums/report-entity-type.enum';
import { IsEntityIDValidValidator } from 'src/modules/report/validators/is-entityid-valid.validator';

export class GetReportsByEntityQueryDto {
    @ApiProperty({
        description: '关联的实体类型,0表示评论,1表示猫咪照片',
        enum: ReportEntityType,
    })
    @IsEnum(ReportEntityType)
    entityType: ReportEntityType;

    @Type(() => Number)
    @Validate(IsEntityIDValidValidator)
    @ApiProperty({ description: '关联的实体ID' })
    entityID: number;

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
