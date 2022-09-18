import { ApiProperty } from '@nestjs/swagger';

class PhotoDto {
    @ApiProperty({ description: '图片ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '原图图片文件名', nullable: true })
    rawFileName: string;

    @ApiProperty({ description: '展示图片文件名', nullable: true })
    fileName: string;

    @ApiProperty({ description: '图片发布时间' })
    createdDate: Date;

    @ApiProperty({ description: '照片评论', nullable: true })
    comment: string;

    @ApiProperty({ description: '照片发布者ID' })
    userID: number;

    @ApiProperty({ description: '点赞实体ID' })
    likeableEntityID: number;

    @ApiProperty({ description: '评论区ID' })
    commentsAreaID: number;
}

export class SearchCatsResponseDto {
    @ApiProperty({ description: '猫咪ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '猫咪名称' })
    name: string;

    @ApiProperty({ description: '猫咪描述' })
    description: string;

    @ApiProperty({ description: '猫咪出没地点' })
    haunt: string;

    @ApiProperty({ description: '猫咪封面文件名' })
    coverPhoto: PhotoDto;
}