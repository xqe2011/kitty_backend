import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, createCipheriv, createDecipheriv, scrypt } from 'node:crypto';

@Injectable()
export class CryptoService {
    private derivatedKey: Record<string, Uint8Array> = {};

    constructor(
        private configService: ConfigService
    ) {}

    /**
     * HMAC签名
     * @param key 密钥,128位uint8数组
     * @param value 签名字符串
     * @returns 签名,base64格式
     */
    async hmac(key: Uint8Array, value: string) {
        return createHmac('sha256', key)
                .update(value)
                .digest('base64');
    }

    /**
     * 密钥派生
     * @param scope 用途
     * @returns 密钥,128位uint8数组
     */
    derivatKey(scope: string) {
        return new Promise<Uint8Array>(async (resolve, reject) => {
            if (scope in Object.keys(this.derivatedKey)) {
                return resolve(this.derivatedKey[scope]);
            }
            scrypt(await this.configService.get<string>('secret'), scope, 16, (err, derivedKey) => {
                if (err) return reject(err);
                this.derivatedKey[scope] = derivedKey;
                resolve(this.derivatedKey[scope]);
            });
        });
    }

    /**
     * AES-ECB加密
     * @param key 密钥,128位uint8数组
     * @param str 明文
     * @returns 密文,base64格式
     */
    async aesEcbEncryptReturnInBase64(key: Uint8Array, hex: Uint8Array) {
        const cipherChunks = [];
        const cipher = createCipheriv('aes-128-ecb', key, null);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(hex, undefined, 'base64'));
        cipherChunks.push(cipher.final('base64'));
        return cipherChunks.join('');
    }

    /**
     * AES-ECB加密,返回128位uint8数组
     * @param key 密钥,128位uint8数组
     * @param str 明文
     * @returns 密文,128位uint8数组
     */
     async aesEcbEncryptReturnInArray(key: Uint8Array, hex: Uint8Array) {
        const cipher = createCipheriv('aes-128-ecb', key, null);
        cipher.setAutoPadding(true);
        return Buffer.concat([cipher.update(hex), cipher.final()])
    }

    /**
     * AES-ECB解密
     * @param key 密钥,128位uint8数组
     * @param str 密文
     * @returns 明文,uint8数组
     */
    aesEcbDecrypt(key: Uint8Array, hex: Uint8Array): Promise<Uint8Array>;
    aesEcbDecrypt(key: Uint8Array, str: string): Promise<Uint8Array>;
    async aesEcbDecrypt(key: Uint8Array, encrypted: string | Uint8Array) {
        const cipher = createDecipheriv('aes-128-ecb', key, null);
        cipher.setAutoPadding(true);
        return Buffer.concat([typeof encrypted === "string" ? cipher.update(encrypted, 'base64') : cipher.update(encrypted), cipher.final()]);
    }

    /**
     * AES-CBC解密
     * @param key 密钥,128位uint8数组
     * @param iv IV
     * @param str 密文
     * @returns 明文
     */
    async aesCbcDecrypt(key: Uint8Array, iv: Uint8Array, str: string) {
        const cipherChunks: string[] = [];
        const cipher = createDecipheriv('aes-128-ecb', key, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(str, 'base64', 'utf8'));
        cipherChunks.push(cipher.final('utf8'));
        return cipherChunks.join('');
    }
}
