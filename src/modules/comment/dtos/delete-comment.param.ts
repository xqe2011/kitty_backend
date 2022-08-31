import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCommentIDValidValidator } from '../validators/is-commentid-valid.validator';

export class DeleteCommentsParamDto {
    @Type(() => Number)
    @Validate(IsCommentIDValidValidator, [false])
    @ApiProperty({ description: '评论ID', minimum: 1 })
    id: number;
}
