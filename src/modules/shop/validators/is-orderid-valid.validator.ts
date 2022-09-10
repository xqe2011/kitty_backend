import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { OrderService } from '../order/order.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsOrderIDValidValidator implements ValidatorConstraintInterface {
    constructor(private orderService: OrderService) {}

    async validate(orderID: any) {
        if (typeof orderID != 'number' || orderID < 0 || isNaN(orderID)) return false;
        return await this.orderService.isOrderExists(orderID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'OrderID is not valid or not exists!';
    }
}
