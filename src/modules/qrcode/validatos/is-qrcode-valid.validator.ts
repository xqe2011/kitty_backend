import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { QRCodeService } from '../qrcode/qrcode.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsQRCodeValidValidator implements ValidatorConstraintInterface {
    constructor(private qrcodeService: QRCodeService) {}

    async validate(code: any,  args: ValidationArguments) {
        if (typeof code !== 'string') return false;
        /* constraints为允许的类型 */
        return await this.qrcodeService.validate(code, args.constraints);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'QRCode is not valid or not allowed type!';
    }
}
