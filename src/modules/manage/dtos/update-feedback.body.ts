import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FeedbackProgress } from 'src/modules/feedback/enums/feedback-progress.enum';
import { FeedbackType } from 'src/modules/feedback/enums/feedback-type.enum';

export class UpdateFeedbackBodyDto {
    @IsEnum(FeedbackType)
    @ApiProperty({
        description: '反馈类型,0是猫咪问题,1是小程序问题,2是组织建议',
        enum: FeedbackType
    })
    type: FeedbackType;

    @IsEnum(FeedbackProgress)
    @ApiProperty({
        description: '处理进度,0是待处理,1是已确认-正在处理,2是无需处理,3是处理完成,4是无法确认,5是重复反馈',
        enum: FeedbackProgress
    })
    progress: FeedbackProgress;
}
