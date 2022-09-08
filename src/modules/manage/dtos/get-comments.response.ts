import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from 'src/modules/comment/enums/comment-status.enum';

export class GetCommentsResponseDto {
    @ApiProperty({ description: '评论ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '对话ID', minimum: 1 })
    conversationID: number;

    @ApiProperty({ description: '评论内容' })
    content: string;

    @ApiProperty({
        description: "评论状态,0表示未审核,1表示正常显示,2表示隐藏"
    })
    status: CommentStatus;

    @ApiProperty({ description: '照片发布者ID' })
    userID: number;

    @ApiProperty({ description: '父评论ID' })
    parentCommentID: number;

    @ApiProperty({ description: '评论区ID' })
    areaID: number;

    @ApiProperty({ description: '发表时间' })
    createdDate: Date;
}
