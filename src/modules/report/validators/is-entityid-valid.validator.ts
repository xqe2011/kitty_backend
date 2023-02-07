import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { IsPhotoIDValidValidator } from 'src/modules/cat/validators/is-photoid-valid.validator';
import { IsCommentIDValidValidator } from 'src/modules/comment/validators/is-commentid-valid.validator';
import { ReportEntityType } from '../enums/report-entity-type.enum';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEntityIDValidValidator implements ValidatorConstraintInterface {
    constructor(
        private isCommentIDValidValidator: IsCommentIDValidValidator,
        private isPhotoIDValidValidator: IsPhotoIDValidValidator
    ) {}

    async validate(entityID: any, args: ValidationArguments) {
        if (typeof entityID != 'number' || entityID < 0 || isNaN(entityID)) return false;
        switch((args.object as any).entityType) {
            case ReportEntityType.CAT_PHOTOS:
                return await this.isPhotoIDValidValidator.validate(entityID);
            case ReportEntityType.COMMENTS:
                return await this.isCommentIDValidValidator.validate(entityID, { constraints: [false] } as ValidationArguments);
            default:
                return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'EntityID is not valid or not exists!';
    }
}
