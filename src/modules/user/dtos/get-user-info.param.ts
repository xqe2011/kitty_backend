import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { IsUserIDValidValidator } from '../validators/is-userid-valid.validator';

export class GetUserInfoParamDto {
    @Type(() => Number)
    @IsOptional()
    @Validate(IsUserIDValidValidator)
    @ApiProperty({
        description: '用户ID,若不传递则返回当前用户',
        minimum: 1,
        required: false,
    })
    id: number;
}
