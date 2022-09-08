import { ApiProperty } from '@nestjs/swagger';

export class ApiExceptionResponseDto {
    @ApiProperty({ description: 'HTTP状态码' })
    status: number;

    @ApiProperty({ description: '错误类型' })
    msg: string;
}
