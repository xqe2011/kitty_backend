import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { FeedbackService } from '../feedback/feedback.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsFeedbackIDValidValidator implements ValidatorConstraintInterface {
    constructor(private feedbackService: FeedbackService) {}

    async validate(feedbackID: any) {
        if (typeof feedbackID != 'number' || feedbackID < 0 || isNaN(feedbackID)) return false;
        return await this.feedbackService.isFeedbackExists(feedbackID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'FeedbackID is not valid or not exists!';
    }
}
