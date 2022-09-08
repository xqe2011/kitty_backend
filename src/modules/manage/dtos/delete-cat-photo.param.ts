import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsPhotoIDValidValidator } from 'src/modules/cat/validators/is-photoid-valid.validator';

export class DeleteCatPhotoParamDto {
    @Type(() => Number)
    @Validate(IsPhotoIDValidValidator)
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;
}
