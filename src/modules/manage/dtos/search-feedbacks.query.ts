import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, Validate } from 'class-validator';
import { FeedbackProgress } from 'src/modules/feedback/enums/feedback-progress.enum';
import { FeedbackType } from 'src/modules/feedback/enums/feedback-type.enum';
import { IsUserIDValidValidator } from 'src/modules/user/validators/is-userid-valid.validator';

export class SearchFeedbacksQueryDto {
    @Type(() => Number)
    @Validate(IsUserIDValidValidator)
    @IsOptional()
    @ApiProperty({
        description: '用户ID,若为undefined则不指定用户',
        required: false,
    })
    userID: number;

    @IsEnum(FeedbackProgress)
    @IsOptional()
    @ApiProperty({
        description: '反馈进度,若为undefined则不指定进度',
        required: false,
    })
    progress: FeedbackProgress;

    @IsEnum(FeedbackType)
    @IsOptional()
    @ApiProperty({
        description: '反馈类型,若为undefined则不指定类型',
        required: false,
    })
    type: FeedbackType;

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

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    @ApiProperty({ description: '分页参数,照片限制数量', minimum: 1, maximum: 30 })
    photoLimit: number;
}
