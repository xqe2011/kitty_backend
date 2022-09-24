import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { IsSettingKeyValidValidator } from 'src/modules/setting/validators/is-setting-key-valid.validator';

export class UpdateSettingParamDto {
    @Validate(IsSettingKeyValidValidator)
    @ApiProperty({ description: '配置键' })
    key: string;
}
