import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { PhotoService } from '../photo/photo.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPhotoIDValidValidator implements ValidatorConstraintInterface {
    constructor(private photoService: PhotoService) {}

    async validate(photoID: any) {
        if (typeof photoID != 'number' || photoID < 0) return false;
        return await this.photoService.isPhotoExists(photoID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'PhotoID is not valid or not exists!';
    }
}
