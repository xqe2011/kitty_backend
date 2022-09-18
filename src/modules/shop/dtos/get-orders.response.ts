import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusType } from '../enums/order-status-type.enum';

export class GetOrdersResponseDto {
    @ApiProperty({ description: '订单ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '单价', minimum: 0 })
    unitPrice: number;

    @ApiProperty({ description: '数量', minimum: 1 })
    quantity: number;

    @ApiProperty({ description: '总价', minimum: 0 })
    totalPrice: number;

    @ApiProperty({ description: '用户ID', minimum: 1 })
    userID: number;

    @ApiProperty({ description: '商品ID', minimum: 1 })
    itemID: number;

    @ApiProperty({
        description: '订单状态,0表示备货中,1表示待取货,2表示交易成功,3表示交易取消',
        enum: OrderStatusType
    })
    status: OrderStatusType;

    @ApiProperty({ description: '订单取消原因', nullable: true })
    cancelReason: string;

    @ApiProperty({ description: '创建时间' })
    createdDate: Date;
}
