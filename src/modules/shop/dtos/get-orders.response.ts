import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusType } from '../enums/order-status-type.enum';

export class GetOrdersResponseDto {
    @ApiProperty({ description: '订单ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '商品ID' })
    itemID: string;

    @ApiProperty({ description: '商品单价' })
    unitPrice: number;

    @ApiProperty({ description: '商品数量' })
    quantity: number;

    @ApiProperty({ description: '订单总价' })
    totalPrice: number;

    @ApiProperty({
        description: '订单状态,0表示备货中,1表示待取货,2表示交易成功,3表示交易取消,4表示已退款',
        enum: OrderStatusType
    })
    status: OrderStatusType;

    @ApiProperty({ description: '订单创建日期' })
    createDate: number;
}
