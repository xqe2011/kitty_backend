import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { FileType } from '../enums/file-type.enum';

export class QiniuCallbackBodyDto {
    @IsString()
    @ApiProperty({ description: '上传的文件名' })
    fileName: string;

    @IsEnum(FileType)
    @ApiProperty({ description: '上传的文件类型' })
    fileType: FileType;
}
