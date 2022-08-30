import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsItemIDValidValidator } from '../validators/is-itemid-valid.validator';

export class GetItemParamDto {
    @Type(() => Number)
    @Validate(IsItemIDValidValidator)
    @ApiProperty({
        description: '商品ID',
        minimum: 1
    })
    id: number;
}
