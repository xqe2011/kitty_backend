import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        /**
         * plainToClass如果目标验证类型不是数组,即没有经过ParseArrayPipe,但是传入的参数却是数组会导致验证被跳过
         * 经过判断被ParseArrayPipe修饰过的目标类型metatype为Array,我们先于plainToClass进行数组判断
         */
        if (!(metatype === Array) && Array.isArray(value)) {
            throw new BadRequestException(
                'Validation failed (object expected)',
                'Arguments Validation falied',
            );
        }
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
