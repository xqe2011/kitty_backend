import { ApiProperty } from '@nestjs/swagger';

export class ConsumeUserCodeResponseDto {
    @ApiProperty({ description: '用户ID', minimum: 1 })
    userID: number;
}
