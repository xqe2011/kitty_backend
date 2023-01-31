import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsTagIDValidValidator } from 'src/modules/cat/validators/is-tagid-valid.validator';

export class DeleteCatTagParamDto {
    @Type(() => Number)
    @Validate(IsTagIDValidValidator)
    @ApiProperty({ description: '标签ID', minimum: 1 })
    id: number;
}
