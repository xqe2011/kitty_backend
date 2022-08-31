import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Min } from 'class-validator';

export class GetCommentsByConversationIDParamDto {
    @Type(() => Number)
    @Min(1)
    @ApiProperty({ description: '讨论ID', minimum: 1 })
    id: number;
}
