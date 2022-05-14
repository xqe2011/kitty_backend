import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetArticlesQueryDto {
    @IsInt()
    @Min(1)
    @Max(30)
    @ApiProperty({ description: '分页参数,限制数量', minimum: 1, maximum: 30 })
    limit: number;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: '分页参数,开始位置', minimum: 1 })
    start: number;
}
