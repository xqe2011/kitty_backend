import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Validate } from 'class-validator';
import { IsCommentIDValidValidator } from '../validators/is-commentid-valid.validator';
import { IsCommentsAreaIDValidValidator } from '../validators/is-comments-areaid-valid.validator';

export class CreateCommentBodyDto {
    @Validate(IsCommentsAreaIDValidValidator, [true])
    @ApiProperty({ description: '评论区ID', minimum: 1 })
    areaID: number;

    @Validate(IsCommentIDValidValidator, [true])
    @IsOptional()
    @ApiProperty({ description: '父评论ID', minimum: 1, required: false })
    parentID: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    @ApiProperty({ description: '讨论ID', minimum: 1, required: false })
    conversationID: number;

    @IsString()
    @ApiProperty({ description: '评论内容' })
    content: string;
}
