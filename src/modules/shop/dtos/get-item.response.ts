import { ApiProperty } from '@nestjs/swagger';

export class ItemInfoDto {
    @ApiProperty({ description: '商品ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '商品名称' })
    name: string;

    @ApiProperty({ description: '商品描述' })
    description: string;

    @ApiProperty({ description: '商品价格' })
    price: number;
}

export class PhotoInfoDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '照片文件名' })
    fileName: string;
}

export class GetItemResponseDto {
    @ApiProperty({
        description: '商品信息',
        type: ItemInfoDto
    })
    info: ItemInfoDto;

    @ApiProperty({
        description: '商品封面文件名',
        type: PhotoInfoDto
    })
    coverPhoto: PhotoInfoDto;

    @ApiProperty({
        description: '商品照片',
        type: PhotoInfoDto,
        isArray: true
    })
    photos: PhotoInfoDto[];
}
