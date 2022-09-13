import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../user/enums/role.enum';
import { JwtType } from '../enums/jwt-type.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { CryptoService } from 'src/modules/tool/crypto/crypto.service';

@Injectable()
export class JwtHelperService {
    constructor(
        private jwtService: JwtService,
        private cryptoService: CryptoService
    ) {}

    /**
     * 生成小程序用的JWT
     * @param user 用户
     * @param sessionKey
     * @returns
     */
    async getJWTPayloadForMiniProgram(user: User, sessionKey: string) {
        return this.jwtService.sign({
            sub: user.id,
            role: user.role,
            type: JwtType.MiniProgram,
            en: await this.cryptoService.aesEcbEncryptReturnInBase64(
                    await this.cryptoService.derivatKey('jwt-miniprogram-secret'),
                    Buffer.from(sessionKey, 'base64')
                )
        });
    }

    /**
     * 解析JWT负荷
     * @param payload JWT负荷
     * @returns 解析后的内容
     */
    async parseJWTPayload(payload: any) {
        const val = {
            id: payload.sub as number,
            role: payload.role as Role,
            type: payload.type as JwtType,
        };
        if (val.type === JwtType.MiniProgram) {
            val['miniprogram'] = {
                sessionKey: await this.cryptoService.aesEcbDecrypt(
                    await this.cryptoService.derivatKey('jwt-miniprogram-secret'),
                    payload.en
                ),
            };
        }
        return val;
    }
}
