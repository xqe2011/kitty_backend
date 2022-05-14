import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { FileService } from '../file/file.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsFileTokenValidValidator implements ValidatorConstraintInterface {
    constructor(private fileService: FileService) {}

    async validate(fileToken: any, args: ValidationArguments) {
        if (!(await this.fileService.verifyFileToken(fileToken))) {
            return false;
        }
        return this.fileService.getFileTypeByToken(fileToken) in args.constraints;
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'File Token is not valid!';
    }
}
