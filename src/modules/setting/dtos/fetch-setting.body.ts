import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class FetchSettingBodyDto {
    @IsString()
    @ApiProperty({ description: '配置的Key' })
    key: string;

    @IsBoolean()
    @ApiProperty({ description: '配置是否允许返回Null值' })
    nullable: boolean;
}
