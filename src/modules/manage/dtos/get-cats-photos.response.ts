import { ApiProperty } from '@nestjs/swagger';
import { CatPhotoType } from 'src/modules/cat/enums/cat-photo-type.enum';

export class GetCatsPhotosResponseDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;

    @ApiProperty({
        description: '照片状态,0表示封面图,1表示精选图,2表示其他,3表示正在审核',
        enum: CatPhotoType,
    })
    type: CatPhotoType;

    @ApiProperty({ description: '原图图片文件名' })
    rawFileName: string;

    @ApiProperty({ description: '展示图片文件名', nullable: true })
    fileName: string;

    @ApiProperty({ description: '图片发布时间' })
    createdDate: Date;

    @ApiProperty({ description: '照片评论' })
    comment: string;

    @ApiProperty({ description: '照片发布者ID' })
    userID: number;

    @ApiProperty({ description: '点赞实体ID' })
    likeableEntityID: number;

    @ApiProperty({ description: '评论区ID' })
    commentsAreaID: number;
}
