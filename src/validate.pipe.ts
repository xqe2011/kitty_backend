import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        const object = plainToClass(metatype, value);
        const errors = await validate(object, {
            validationError: { target: false },
        });
        if (errors.length > 0) {
            throw new BadRequestException(
                errors,
                'Arguments Validation falied',
            );
        }
        return value;
    }
}
