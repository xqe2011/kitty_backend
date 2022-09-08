import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const output = exception.getResponse();
        if (typeof output === 'object' && 'statusCode' in output) {
            delete output['statusCode'];
        }

        response.status(status).json({
            status: status,
            msg: typeof output === 'object' ? (output as any).message : output,
        });
    }
}
