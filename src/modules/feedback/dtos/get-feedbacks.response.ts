import { ApiProperty } from '@nestjs/swagger';
import { FeedbackProgress } from 'src/modules/feedback/enums/feedback-progress.enum';
import { FeedbackType } from 'src/modules/feedback/enums/feedback-type.enum';

class PhotosResponseDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '文件名' })
    fileName: string;
}

export class GetFeedbacksResponseDto {
    @ApiProperty({ description: '反馈ID', minimum: 1 })
    id: number;

    @ApiProperty({
        description: '反馈类型,0是猫咪问题,1是小程序问题,2是组织建议',
        enum: FeedbackType
    })
    type: FeedbackType;

    @ApiProperty({
        description: '处理进度,0是待处理,1是已确认-正在处理,2是无需处理,3是处理完成,4是无法确认,5是重复反馈',
        enum: FeedbackProgress
    })
    progress: FeedbackProgress;

    @ApiProperty({ description: '反馈内容' })
    content: string;

    @ApiProperty({ description: '猫咪ID', minimum: 1 })
    catID: number;

    @ApiProperty({
        description: '照片数组',
        isArray: true,
        type: PhotosResponseDto
    })
    photos: PhotosResponseDto[];

    @ApiProperty({ description: '创建时间' })
    createdDate: Date;
}
