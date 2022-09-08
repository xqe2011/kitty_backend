import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CommentStatus } from 'src/modules/comment/enums/comment-status.enum';

export class UpdateCommentBodyDto {
    @IsEnum(CommentStatus)
    @ApiProperty({
        description: '评论状态,0表示未审核,1表示正常显示,2表示隐藏',
        enum: CommentStatus,
    })
    status: CommentStatus;
}
