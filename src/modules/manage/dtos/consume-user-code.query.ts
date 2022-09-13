import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { QRCodeType } from 'src/modules/qrcode/enums/qrcode-type.enum';
import { IsQRCodeValidValidator } from 'src/modules/qrcode/validatos/is-qrcode-valid.validator';

export class ConsumeUserCodeQueryDto {
    @Validate(IsQRCodeValidValidator, [ QRCodeType.USER ])
    @ApiProperty({ description: '二维码字符串' })
    code: string;
}
