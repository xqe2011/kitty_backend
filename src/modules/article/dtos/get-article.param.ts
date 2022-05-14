import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsArticleIDValidValidator } from '../validators/is-articleid-valid.validator';

export class GetArticleParamDto {
    @Type(() => Number)
    @Validate(IsArticleIDValidValidator)
    @ApiProperty({ description: '文章ID', minimum: 1 })
    id: number;
}
