import { ApiProperty } from '@nestjs/swagger';

export class GetArticlesResponseDto {
    @ApiProperty({ description: '文章ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '文章封面文件名' })
    coverFileName: string;

    @ApiProperty({ description: '文章概述' })
    summary: string;

    @ApiProperty({ description: '文章标题' })
    title: string;
}
