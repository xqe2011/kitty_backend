import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsArticleIDValidValidator } from 'src/modules/article/validators/is-articleid-valid.validator';

export class AddPhotoToArticleParamDto {
    @Type(() => Number)
    @Validate(IsArticleIDValidValidator)
    @ApiProperty({ description: '文章ID', minimum: 1 })
    id: number;
}
