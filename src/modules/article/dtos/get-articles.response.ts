import { ApiProperty } from '@nestjs/swagger';

export class PhotoInfoDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '照片文件名' })
    fileName: string;
}

export class GetArticlesResponseDto {
    @ApiProperty({ description: '文章ID', minimum: 1 })
    id: number;

    @ApiProperty({
        description: '文章封面文件名',
        type: PhotoInfoDto
    })
    coverPhoto: PhotoInfoDto;

    @ApiProperty({ description: '文章概述' })
    summary: string;

    @ApiProperty({ description: '文章标题' })
    title: string;

    @ApiProperty({ description: '文章URL' })
    url: string;

    @ApiProperty({ description: '创建时间' })
    createdDate: Date;
}
