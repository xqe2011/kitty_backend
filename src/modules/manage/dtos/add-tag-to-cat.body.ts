import { ApiProperty } from '@nestjs/swagger';

export class AddTagToCatBodyDto {
    @ApiProperty({ description: '标签名称' })
    name: string;
}
