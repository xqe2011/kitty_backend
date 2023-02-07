import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Validate } from 'class-validator';
import { ReportEntityType } from '../enums/report-entity-type.enum';
import { ReportType } from '../enums/report-type.enum';
import { IsEntityIDValidValidator } from '../validators/is-entityid-valid.validator';

export class CreateReportBodyDto {
    @IsEnum(ReportType)
    @ApiProperty({
        description: '举报类型,0表示违法违禁,1表示人身攻击,2表示撞车,3表示广告,4表示其他',
        enum: ReportType,
    })
    type: ReportType;

    @ApiProperty({
        description: '关联的实体类型,0表示评论,1表示猫咪照片',
        enum: ReportEntityType,
    })
    @IsEnum(ReportEntityType)
    entityType: ReportEntityType;

    @Validate(IsEntityIDValidValidator)
    @ApiProperty({ description: '关联的实体ID' })
    entityID: number;

    @IsString()
    @ApiProperty({ description: '举报内容' })
    content: string;
}
