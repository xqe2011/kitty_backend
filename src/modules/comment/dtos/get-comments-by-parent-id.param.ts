import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCommentIDValidValidator } from '../validators/is-commentid-valid.validator';

export class GetCommentsByParentIDParamDto {
    @Type(() => Number)
    @Validate(IsCommentIDValidValidator, [true])
    @ApiProperty({ description: '父评论ID', minimum: 1 })
    id: number;
}
