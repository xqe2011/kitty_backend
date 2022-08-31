import { ApiProperty } from '@nestjs/swagger';

export class GetCommentAreaInfoResponseDto {
    @ApiProperty({ description: '是否可见' })
    isDisplay: boolean;
}
