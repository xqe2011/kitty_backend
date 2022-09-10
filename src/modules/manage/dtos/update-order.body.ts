import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/* 参考OrderStatusType */
enum AllowOrderStatusType {
    /** 备货中 */
    STOCKING = '0',

    /** 待取货 */
    PENDING_RECEIPT = '1',

    /** 交易成功 */
    SUCCESS = '2',
}

export class UpdateOrderBodyDto {
    @IsEnum(AllowOrderStatusType)
    @ApiProperty({
        description: '订单状态,0表示备货中,1表示待取货,2表示交易成功',
        enum: AllowOrderStatusType,
    })
    status: AllowOrderStatusType;
}
