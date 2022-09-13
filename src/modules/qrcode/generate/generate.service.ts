import { Injectable } from '@nestjs/common';
import { QRCodeType } from '../enums/qrcode-type.enum';
import { QRCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class GenerateService {
    constructor(
        private qrcodeService: QRCodeService
    ) {}

    /**
     * 获取用户识别码
     * @param id 用户ID
     * @param size 二维码大小
     * @returns 二维码base64字符串
     */
    async getUserImage(id: number, size: number) {
        return await this.qrcodeService.generateQRCodeImage(await this.qrcodeService.encode(QRCodeType.USER, id, null), size);
    }
}
