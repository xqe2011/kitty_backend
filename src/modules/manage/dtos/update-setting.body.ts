import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingBodyDto {
    @ApiProperty({ description: '配置值,任意类型' })
    value: string;
}
