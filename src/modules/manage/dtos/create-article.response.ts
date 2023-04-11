import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleResponseDto {
    @ApiProperty({ description: '文章ID', minimum: 1 })
    id: number;
}
