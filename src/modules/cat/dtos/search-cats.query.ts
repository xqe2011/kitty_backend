import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max } from 'class-validator';

export class SearchCatsQueryDto {
    @IsString()
    @ApiProperty({ description: '关键词' })
    keyword: string;

    @IsInt()
    @Min(1)
    @Max(30)
    @ApiProperty({ description: '分页参数,限制数量', minimum: 1, maximum: 30 })
    limit: number;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: '分页参数,开始位置', minimum: 0 })
    start: number;
}
