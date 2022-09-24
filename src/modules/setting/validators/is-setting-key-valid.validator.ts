import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { SettingService } from '../setting/setting.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsSettingKeyValidValidator implements ValidatorConstraintInterface {
    constructor(private settingService: SettingService) {}

    async validate(key: any) {
        if (typeof key != 'string' || key === '') return false;
        return (await this.settingService.fetchSettingFromClient(key, true)) !== null;
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'SettingKey is not valid or not exists!';
    }
}
