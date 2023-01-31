import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsCatIDValidValidator } from 'src/modules/cat/validators/is-catid-valid.validator';

export class AddTagToCatParamDto {
    @Type(() => Number)
    @Validate(IsCatIDValidValidator)
    @ApiProperty({ description: '猫咪ID', minimum: 1 })
    id: number;
}
