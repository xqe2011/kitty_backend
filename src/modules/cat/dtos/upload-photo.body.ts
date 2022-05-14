import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min, Validate, } from 'class-validator';
import { FileType } from 'src/modules/file/enums/file-type.enum';
import { IsFileTokenValidValidator } from 'src/modules/file/validatos/is-file-token-valid.validator';
import { IsCatIDValidValidator } from '../validators/is-catid-valid.validator';

export class UploadPhotoBodyDto {
    @Validate(IsCatIDValidValidator)
    @IsOptional()
    @ApiProperty({
        description: '猫咪ID,若为undefined则不绑定至特定猫咪',
        required: false,
    })
    catID: number;

    @Validate(IsFileTokenValidValidator, [
        FileType.COMPRESSED_IMAGE,
        FileType.UNCOMPRESSED_IMAGE,
    ])
    @ApiProperty({ description: '文件Token,成功上传文件后获得' })
    fileToken: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '照片评论', required: false })
    comment: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(360)
    @ApiProperty({ description: '指南针角度', required: false })
    compassAngle: number;

    @IsOptional()
    @IsLatitude()
    @ApiProperty({ description: '拍照时的纬度', required: false })
    latitude: number;

    @IsOptional()
    @IsLongitude()
    @ApiProperty({ description: '拍照时的经度', required: false })
    longitude: number;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: '拍照时的位置的精确度,米为单位', required: false })
    positionAccuration: number;
}
