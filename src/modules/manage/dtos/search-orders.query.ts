import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, Validate } from 'class-validator';
import { OrderStatusType } from 'src/modules/shop/enums/order-status-type.enum';
import { IsUserIDValidValidator } from 'src/modules/user/validators/is-userid-valid.validator';

export class SearchOrdersQueryDto {
    @Type(() => Number)
    @Validate(IsUserIDValidValidator)
    @IsOptional()
    @ApiProperty({
        description: '用户ID,若为undefined则不指定用户',
        required: false,
    })
    userID: number;

    @IsEnum(OrderStatusType)
    @IsOptional()
    @ApiProperty({
        description: '订单状态,若为undefined则不指定状态',
        required: false,
    })
    status: OrderStatusType;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    @ApiProperty({ description: '分页参数,限制数量', minimum: 1, maximum: 30 })
    limit: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @ApiProperty({ description: '分页参数,开始位置', minimum: 0 })
    start: number;
}
