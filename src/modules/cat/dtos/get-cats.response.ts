import { ApiProperty } from '@nestjs/swagger';

export class GetCatsResponseDto {
    @ApiProperty({ description: '猫咪ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '猫咪名称' })
    name: string;

    @ApiProperty({ description: '猫咪描述' })
    description: string;

    @ApiProperty({ description: '猫咪出没地点' })
    haunt: string;

    @ApiProperty({ description: '猫咪封面文件名' })
    coverFileName: string;
}
