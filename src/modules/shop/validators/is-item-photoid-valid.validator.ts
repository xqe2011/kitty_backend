import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { ShopService } from '../shop/shop.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsItemPhotoIDValidValidator implements ValidatorConstraintInterface {
    constructor(private shopService: ShopService) {}

    async validate(photoID: any) {
        if (typeof photoID != 'number' || photoID < 0 || isNaN(photoID)) return false;
        return await this.shopService.isItemPhotoExists(photoID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'Item PhotoID is not valid or not exists!';
    }
}
