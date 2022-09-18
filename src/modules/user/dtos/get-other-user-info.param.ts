import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsUserIDValidValidator } from '../validators/is-userid-valid.validator';

export class GetOtherUserInfoParamDto {
    @Type(() => Number)
    @Validate(IsUserIDValidValidator)
    @ApiProperty({ description: '用户ID', minimum: 1 })
    id: number;
}
