import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { ShopService } from '../shop/shop.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsItemIDValidValidator implements ValidatorConstraintInterface {
    constructor(private shopService: ShopService) {}

    async validate(itemID: any) {
        if (typeof itemID != 'number' || itemID < 0 || isNaN(itemID)) return false;
        return await this.shopService.isItemExists(itemID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'ItemID is not valid or not exists!';
    }
}
