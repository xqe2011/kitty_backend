import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { FileType } from '../enums/file-type.enum';

export class CreateUploadParamsBodyDto {
    @IsEnum(FileType)
    @ApiProperty({
        description: '文件类型,0表示未压缩图片,1表示压缩图片',
        enum: FileType,
    })
    type: FileType;

    @IsString()
    @ApiProperty({ description: '文件扩展名,需要匹配文件类型' })
    extName: string;
}
