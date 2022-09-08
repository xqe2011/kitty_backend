import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCommentIDValidValidator } from 'src/modules/comment/validators/is-commentid-valid.validator';

export class DeleteCommentParamDto {
    @Type(() => Number)
    @Validate(IsCommentIDValidValidator, [false])
    @ApiProperty({ description: '评论ID', minimum: 1 })
    id: number;
}
