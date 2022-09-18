import { ApiProperty } from '@nestjs/swagger';

class ValidationErrorDto {
    @ApiProperty({ description: "目标参数", required: false })
    target?: object;
    
    @ApiProperty({ description: "参数属性", required: false })
    property: string;

    @ApiProperty({ description: "参数值", required: false })
    value?: any;

    @ApiProperty({
        description: "失败类型",
        required: false,
        type: 'object',
        additionalProperties: {
            nullable: true,
            description: '失败原因',
            type: 'string',
        },
    })
    constraints?: {
        [type: string]: string;
    };
    
    @ApiProperty({
        description: "子参数",
        required: false,
        type: ValidationErrorDto,
        isArray: true
    })
    children?: ValidationErrorDto[];

    @ApiProperty({
        description: "上下文",
        required: false,
        type: 'object',
        additionalProperties: {
            nullable: true,
            type: 'string',
        }
    })
    contexts?: {
        [type: string]: any;
    };
}


export class BadRequestExceptionResponseDto {
    @ApiProperty({ description: 'HTTP状态码' })
    status: number;

    @ApiProperty({
        description: '错误信息',
        type: ValidationErrorDto,
        isArray: true
    })
    msg: ValidationErrorDto[];
}
