import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, Min } from 'class-validator';

export class UpdateItemBodyDto {
    @IsString()
    @ApiProperty({ description: '商品名称' })
    name: string;

    @IsString()
    @ApiProperty({ description: '商品描述' })
    description: string;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: '商品价格', minimum: 0 })
    price: number;

    @IsBoolean()
    @ApiProperty({ description: '商品是否可见' })
    visible: boolean;
}
