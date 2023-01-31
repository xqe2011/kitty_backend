import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { TagService } from '../tag/tag/tag.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsTagIDValidValidator implements ValidatorConstraintInterface {
    constructor(private tagService: TagService) {}

    async validate(tagID: any) {
        if (typeof tagID != 'number' || tagID < 0) return false;
        return await this.tagService.isTagExists(tagID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'TagID is not valid or not exists!';
    }
}
