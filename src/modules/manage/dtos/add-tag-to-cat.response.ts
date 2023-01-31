import { ApiProperty } from '@nestjs/swagger';

export class AddTagToCatResponseDto {
    @ApiProperty({ description: '标签ID', minimum: 1 })
    id: number;
}
