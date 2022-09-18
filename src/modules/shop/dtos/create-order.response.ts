import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderResponseDto {
    @ApiProperty({ description: "订单ID", minimum: 1 })
    orderID: number;
}
