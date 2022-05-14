import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { CatService } from '../cat/cat.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCatIDValidValidator implements ValidatorConstraintInterface {
    constructor(private catService: CatService) {}

    async validate(catID: any) {
        if (typeof catID != 'number' || catID < 0) return false;
        return await this.catService.isCatExists(catID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'CatID is not valid or not exists!';
    }
}
