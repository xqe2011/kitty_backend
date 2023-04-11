import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsArticlePhotoIDValidValidator } from 'src/modules/article/validators/is-article-photoid-valid.validator';

export class DeleteArticlePhotoParamDto {
    @Type(() => Number)
    @Validate(IsArticlePhotoIDValidValidator)
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;
}
