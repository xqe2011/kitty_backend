import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateItemBodyDto {
    @IsString()
    @ApiProperty({ description: '商品名称' })
    name: string;

    @IsString()
    @ApiProperty({ description: '商品描述' })
    description: string;

    @IsNumber()
    @ApiProperty({ description: '商品价格' })
    price: number;

    @IsBoolean()
    @ApiProperty({ description: '商品是否可见' })
    visible: boolean;
}
