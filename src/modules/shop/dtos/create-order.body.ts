import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Validate, } from 'class-validator';
import { IsItemIDValidValidator } from '../validators/is-itemid-valid.validator';

export class CreateOrderBodyDto {
    @Type(() => Number)
    @Validate(IsItemIDValidValidator)
    @ApiProperty({ description: '商品ID', minimum: 1 })
    itemID: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: '商品数量', minimum: 1 })
    quantity: number;
}
