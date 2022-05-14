import { ApiProperty } from '@nestjs/swagger';

export class GetAchievementsResponseDto {
    @ApiProperty({ description: '成就ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '成就描述' })
    description: string;

    @ApiProperty({ description: '成就完成进度', minimum: 0, maximum: 100 })
    percent: number;

    @ApiProperty({
        description:
            '成就进度上一次更新的时间,如果该成就已完成则将定格在完成时间',
    })
    updatedDate: Date;
}
