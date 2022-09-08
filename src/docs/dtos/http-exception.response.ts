import { ApiProperty } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';

export class HttpExceptionResponseDto {
    @ApiProperty({ description: 'HTTP状态码' })
    status: number;

    @ApiProperty({ description: '错误信息' })
    msg: string | ValidationError[];
}
