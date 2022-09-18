import { ApiProperty } from '@nestjs/swagger';

export class UploadLocalResponseDto {
    @ApiProperty({ description: '文件Token,用于标记一个已经存储在服务器上的文件,可以用于需要上传文件的接口,注意不同于文件上传Token' })
    fileToken: string;
}
