import { ApiProperty } from '@nestjs/swagger';

class CommentResponseDto {
    @ApiProperty({ description: '评论ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '对话ID', minimum: 1 })
    conversationID: number;

    @ApiProperty({ description: '评论内容' })
    content: string;

    @ApiProperty({ description: '发表时间' })
    createdDate: Date;
}

export class GetCommentsByAreaIDResponseDto extends CommentResponseDto {
    @ApiProperty({ description: '子评论总数', minimum: 0 })
    childrenTotal: number;

    @ApiProperty({ description: '子评论' })
    childrenComments: CommentResponseDto[];
}
