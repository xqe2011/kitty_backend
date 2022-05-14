import { ApiProperty } from '@nestjs/swagger';

export class CreateUploadParamsResponseDto {
    @ApiProperty({ description: '上传文件的目标地址' })
    url: string;

    @ApiProperty({ description: '需要给上传文件的目标地址传递的参数' })
    params: object;
}
