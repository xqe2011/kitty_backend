import { ApiProperty } from '@nestjs/swagger';

export class CreateCatResponseDto {
    @ApiProperty({ description: '猫咪ID', minimum: 1 })
    id: number;
}
