import { ApiProperty } from '@nestjs/swagger';

export class PhotoInfoDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '照片文件名' })
    fileName: string;
}

export class GetItemsResponseDto {
    @ApiProperty({ description: '商品ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '商品名称' })
    name: string;

    @ApiProperty({ description: '商品价格' })
    price: number;

    @ApiProperty({ description: '点赞实体ID' })
    likeableEntityID: number;

    @ApiProperty({
        description: '商品封面文件名',
        type: PhotoInfoDto
    })
    coverPhoto: PhotoInfoDto;
}
