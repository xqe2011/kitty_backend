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
     * @param foregroundColor 二维码前景色
     * @param backgroundColor 二维码背景色
     * @returns 二维码base64字符串
     */
    async getUserImage(id: number, size: number, foregroundColor: string, backgroundColor: string) {
        return await this.qrcodeService.generateQRCodeImage(await this.qrcodeService.encode(QRCodeType.USER, id, null), size, foregroundColor, backgroundColor);
    }
}
