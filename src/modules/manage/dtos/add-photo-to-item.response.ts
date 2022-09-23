import { ApiProperty } from '@nestjs/swagger';

export class AddPhotoToItemResponseDto {
    @ApiProperty({ description: '照片ID', minimum: 1 })
    id: number;
}
