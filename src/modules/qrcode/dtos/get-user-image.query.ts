import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Min, Max, IsNumber, IsHexColor } from 'class-validator';

export class GetUserImageQueryDto {
    @Type(() => Number)
    @IsNumber()
    @Min(100)
    @Max(1000)
    @ApiProperty({
        description: '二维码尺寸',
        minimum: 100,
        maximum: 1000
    })
    size: number;

    @IsHexColor()
    @ApiProperty({ description: "二维码前景色,HTML的HEX RGB/RGBA格式,如#000000" })
    foregroundColor: string;

    @IsHexColor()
    @ApiProperty({ description: "二维码背景色,HTML的HEX RGB/RGBA格式,如#000000" })
    backgroundColor: string;
}
