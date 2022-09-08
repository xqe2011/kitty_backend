import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCommentsAreaIDValidValidator } from 'src/modules/comment/validators/is-comments-areaid-valid.validator';

export class UpdateCommentsAreaParamDto {
    @Type(() => Number)
    @Validate(IsCommentsAreaIDValidValidator, [false])
    @ApiProperty({ description: '评论区ID', minimum: 1 })
    id: number;
}
