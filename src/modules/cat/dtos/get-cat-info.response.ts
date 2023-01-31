import { ApiProperty } from '@nestjs/swagger';
import { CatStatusType } from '../enums/cat-status-type.enum';

class CatInfoDto {
    @ApiProperty({
        description: '猫咪状态,0表示失踪,1表示正常,2表示生病,3表示住院,4表示被领养,5表示死亡',
        enum: CatStatusType,
    })
    status: CatStatusType;

    @ApiProperty({ description: '猫咪名称' })
    name: string;

    @ApiProperty({ description: '猫咪物种' })
    species: string;

    @ApiProperty({ description: '猫咪是否已经绝育' })
    isNeuter: boolean;

    @ApiProperty({ description: '猫咪描述' })
    description: string;

    @ApiProperty({ description: '猫咪出没地点' })
    haunt: string;
}

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

class TagDto {
    @ApiProperty({ description: '标签ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '标签名称' })
    name: string;

    @ApiProperty({ description: '标签发布时间' })
    createdDate: Date;
}

export class GetCatInfoResponseDto {
    @ApiProperty({ description: '猫咪信息' })
    info: CatInfoDto;

    @ApiProperty({
        description: '精选图片集',
        type: PhotoDto,
        isArray: true,
    })
    selectedPhotos: PhotoDto[];

    @ApiProperty({
        description: '猫咪标签',
        type: TagDto,
        isArray: true
    })
    tags: TagDto[];

    @ApiProperty({ description: '封面图片' })
    coverPhoto: PhotoDto;
}
