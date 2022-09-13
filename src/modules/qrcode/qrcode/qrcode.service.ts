import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolService } from 'src/modules/tool/tool/tool.service';
import { QRCodeType } from '../enums/qrcode-type.enum';
import { CryptoService } from 'src/modules/tool/crypto/crypto.service';
import crc8 from 'crc';
import { toDataURL } from 'qrcode';

@Injectable()
export class QRCodeService {
    private magicNumber = 0xA1;
    private readonly logger = new Logger(QRCodeService.name);

    constructor(
        private configService: ConfigService,
        private toolService: ToolService,
        private cryptoService: CryptoService
    ) {}

    /**
     * 生成二维码图像
     * @param str 字符串
     * @param size 二维码大小
     * @returns 二维码base64字符串
     */
    async generateQRCodeImage(str: string, size: number) {
        return await toDataURL([{ data: Buffer.from(str, 'utf8'), mode: 'byte' }], { version: 3, errorCorrectionLevel: 'H', width: size });
    }

    /**
     * 二维码字符串验证有效性
     * @param str 二维码字符串 
     * @type type 二维码类型
     * @returns 是否有效
     */
     async validate(str: string, types: QRCodeType[]) {
        try {
            if (str.length !== 24) {
                return false;
            }
            const hexArray = Buffer.from(str, 'base64');
            if (hexArray.length !== 18 || hexArray[0] !== this.magicNumber || hexArray[17] !== crc8.crc8(hexArray.slice(1, 17))) {
                return false;
            }
            /* 试图解码 */
            const val = await this.cryptoService.aesEcbDecrypt(await this.cryptoService.derivatKey('qrcode'), hexArray.slice(1, 17));
            /* 验证有效性 */
            const now = this.toolService.getNowTimestamp();
            const timestamp = val[7] << 56 | val[8] << 48 | val[9] << 40 | val[10] << 32 | val[11] << 24 | val[12] << 16 | val[13] << 8 | val[14];
            if (val.length === 15 &&
                Object.values(QRCodeType).includes(val[1].toString() as QRCodeType) &&
                now - timestamp <= parseInt(this.configService.get<string>('qrcode.timeout', '60')) &&
                types.includes(val[0].toString() as QRCodeType)) {
                return true;
            } else {
                return false;
            }
        } catch(e) {
            return false;
        }
    }

    /**
     * 二维码解码
     * @param str 二维码字符串 
     * @returns 解码结果
     */
    async decode(str: string) {
        const hexArray = Buffer.from(str, 'base64');
        const val = await this.cryptoService.aesEcbDecrypt(await this.cryptoService.derivatKey('qrcode'), hexArray.slice(1, 17));
        let otherID = val[4] << 16 | val[5] << 8 | val[6];
        otherID = otherID === 0 ? null : otherID;
        return {
            type: val[0].toString() as QRCodeType,
            userID: val[1] << 16 | val[2] << 8 | val[3],
            otherID: otherID
        };
    }

    /**
     * 二维码编码
     * @param type 二维码类型
     * @param userID 用户ID
     * @param otherID 其他ID,可为null
     * @returns 二维码字符串
     */
    async encode(type: QRCodeType, userID: number, otherID: number) {
        const now = this.toolService.getNowTimestamp();
        otherID = otherID === null ? 0 : otherID;
        const buffer = [
            parseInt(type),
            (userID >> 16) & 0xFF, (userID >> 8) & 0xFF, (userID) & 0xFF,
            (otherID >> 16) & 0xFF, (otherID >> 8) & 0xFF, (otherID) & 0xFF,
            (now >> 56) & 0xFF, (now >> 48) & 0xFF, (now >> 40) & 0xFF, (now >> 32) & 0xFF, (now >> 24) & 0xFF, (now >> 16) & 0xFF, (now >> 8) & 0xFF, (now) & 0xFF
        ];
        const encrypted = await this.cryptoService.aesEcbEncryptReturnInArray(await this.cryptoService.derivatKey('qrcode'), Buffer.from(buffer));
        return Buffer.from([this.magicNumber, ...encrypted,  crc8.crc8(encrypted)]).toString('base64');
    }
}
