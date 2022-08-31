import { ApiProperty } from '@nestjs/swagger';

export class GetCommentsByConversationIDResponseDto {
    @ApiProperty({ description: '评论ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '对话ID', minimum: 1 })
    conversationID: number;

    @ApiProperty({ description: '评论内容' })
    content: string;

    @ApiProperty({ description: '发表时间' })
    createdDate: Date;
}
