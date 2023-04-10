import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsItemPhotoIDValidValidator } from 'src/modules/shop/validators/is-item-photoid-valid.validator';

export class UpdateItemPhotoParamDto {
    @Type(() => Number)
    @Validate(IsItemPhotoIDValidValidator)
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;
}
