import { ApiProperty } from '@nestjs/swagger';
import { CatStatusType } from '../enums/cat-status-type.enum';
import { CatVectorType } from '../enums/cat-vector-type.enum';

class CatInfoDto {
    @ApiProperty({
        description: '猫咪状态',
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

    @ApiProperty({ description: '原图图片文件名' })
    rawFileName: string;

    @ApiProperty({ description: '展示图片文件名', nullable: true })
    fileName: string;

    @ApiProperty({ description: '图片发布时间' })
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
        type: 'object',
        description: '向量类型,0是温顺,1是胆小,2是活泼,3是暴躁,4是粘人,5是独立',
        additionalProperties: {
            type: 'number',
            description: '向量百分比',
        },
    })
    vectors: Record<CatVectorType, number>;

    @ApiProperty({ description: '封面图片' })
    coverPhoto: PhotoDto;
}
