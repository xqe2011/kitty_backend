import { ApiProperty } from '@nestjs/swagger';

export class CreateItemResponseDto {
    @ApiProperty({ description: '商品ID', minimum: 1 })
    id: number;
}
