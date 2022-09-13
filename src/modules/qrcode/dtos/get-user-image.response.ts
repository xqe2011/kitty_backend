import { ApiProperty } from "@nestjs/swagger";

export class GetUserImageResponseDto {
    @ApiProperty({ description: '图像', format: 'Base64' })
    image: string;
}
