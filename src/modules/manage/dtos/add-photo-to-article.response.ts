import { ApiProperty } from '@nestjs/swagger';

export class AddPhotoToArticleResponseDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;
}
