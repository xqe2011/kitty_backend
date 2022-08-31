import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCommentsAreaIDValidValidator } from '../validators/is-comments-areaid-valid.validator';

export class GetCommentsByAreaIDParamDto {
    @Type(() => Number)
    @Validate(IsCommentsAreaIDValidValidator, [true])
    @ApiProperty({ description: '评论区ID', minimum: 1 })
    id: number;
}
