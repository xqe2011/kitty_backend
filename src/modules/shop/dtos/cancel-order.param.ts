import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsOrderIDValidValidator } from '../validators/is-orderid-valid.validator';

export class CancelOrderParamDto {
    @Type(() => Number)
    @Validate(IsOrderIDValidValidator)
    @ApiProperty({
        description: '订单ID',
        minimum: 1
    })
    id: number;
}
