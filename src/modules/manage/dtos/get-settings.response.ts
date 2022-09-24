import { ApiProperty } from '@nestjs/swagger';

export class GetSettingsResponseDto {
    @ApiProperty({ description: '配置键' })
    key: string;

    @ApiProperty({ description: '配置值,任意类型' })
    value: string;

    @ApiProperty({ description: '配置最后一次更新时间' })
    updatedDate: Date;
}
