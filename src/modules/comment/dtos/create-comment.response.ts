import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentResponseDto {
    @ApiProperty({ description: "评论ID", minimum: 1 })
    commentID: number;
}
