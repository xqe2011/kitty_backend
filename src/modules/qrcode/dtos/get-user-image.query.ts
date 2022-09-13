import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Min, Max, IsNumber } from 'class-validator';

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
}
