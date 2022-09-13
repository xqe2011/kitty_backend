import { Injectable } from '@nestjs/common';
import { QRCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class ConsumeService {
    constructor(
        private qrcodeService: QRCodeService
    ) {}

    /**
     * 根据二维码字符串获取用户ID
     * @param str 二维码字符串
     * @returns 用户ID
     */
    async getUserIDByBase64(str: string) {
        const val = await this.qrcodeService.decode(str);
        return val.userID;
    }

    
}
