import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { UserService } from '../user/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUserIDValidValidator implements ValidatorConstraintInterface {
    constructor(private userService: UserService) {}

    async validate(userID: any) {
        if (typeof userID != 'number' || userID < 0 || isNaN(userID)) return false;
        return await this.userService.isUserExists(userID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'UserID is not valid or not exists!';
    }
}
