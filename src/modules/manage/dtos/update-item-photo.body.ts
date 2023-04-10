import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateItemPhotoBodyDto {
    @IsBoolean()
    @ApiProperty({ description: '照片是否为封面' })
    isCover: boolean;
}
