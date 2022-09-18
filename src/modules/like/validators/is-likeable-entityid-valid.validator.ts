import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { LikeableEntityService } from '../likeable-entity/likeable-entity.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsLikeableEntityIDValidValidator implements ValidatorConstraintInterface {
    constructor(private likeableEntityService: LikeableEntityService) {}

    async validate(entityID: any) {
        if (typeof entityID != 'number' || entityID < 0 || isNaN(entityID)) return false;
        return await this.likeableEntityService.isEntityExists(entityID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'Likeable EntityID is not valid or not exists!';
    }
}
