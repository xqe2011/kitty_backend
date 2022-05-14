import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCatIDValidValidator } from '../validators/is-catid-valid.validator';

export class GetCatInfoParamDto {
    @Type(() => Number)
    @Validate(IsCatIDValidValidator)
    @ApiProperty({ description: '猫咪ID', minimum: 1 })
    id: number;
}
