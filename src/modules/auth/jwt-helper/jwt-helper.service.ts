import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../user/enums/role.enum';
import { JwtType } from '../enums/jwt-type.enum';
import { AES, enc } from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class JwtHelperService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
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
            en: AES.encrypt(
                sessionKey,
                this.configService.get<string>('secret'),
            ).toString(),
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
                sessionKey: AES.decrypt(
                    payload.en,
                    this.configService.get<string>('secret'),
                ).toString(enc.Utf8),
            };
        }
        return val;
    }
}
