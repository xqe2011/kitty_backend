import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CatPhotoType } from 'src/modules/cat/enums/cat-photo-type.enum';

export class UpdateCatPhotoBodyDto {
    @IsEnum(CatPhotoType)
    @ApiProperty({
        description: '照片状态,0表示封面图,1表示精选图,2表示其他,3表示正在审核 ',
        enum: CatPhotoType,
    })
    type: CatPhotoType;
}
