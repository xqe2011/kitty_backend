import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsLikeableEntityIDValidValidator } from '../validators/is-likeable-entityid-valid.validator';

export class GetLikeableEntityInfoParamDto {
    @Type(() => Number)
    @Validate(IsLikeableEntityIDValidValidator)
    @ApiProperty({ description: '点赞实体ID', minimum: 1 })
    id: number;
}
