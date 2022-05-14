import { HttpException } from '@nestjs/common';
import { Error } from './enums/error.enum';

/**
 * 业务错误统一类,一般用于需要向用户反馈的错误,如积分不足以购买商品等
 */
export class ApiException extends HttpException {
    constructor(error: Error, msg = '') {
        super(
            {
                errorType: error,
                errorMsg: msg,
            },
            422,
        );
    }
}
