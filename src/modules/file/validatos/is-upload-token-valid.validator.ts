import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { LocalService } from '../local/local.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUploadTokenValidValidator implements ValidatorConstraintInterface {
    constructor(private localService: LocalService) {}

    async validate(token: string) {
        return await this.localService.verifyToken(token);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'Local upload token is not valid!';
    }
}
