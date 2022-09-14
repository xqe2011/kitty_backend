import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsFeedbackIDValidValidator } from 'src/modules/feedback/validators/is-feedbackid-valid.validator';

export class UpdateFeedbackParamDto {
    @Type(() => Number)
    @Validate(IsFeedbackIDValidValidator)
    @ApiProperty({ description: '反馈ID', minimum: 1 })
    id: number;
}
