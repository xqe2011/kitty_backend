import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user/user.service';
import { MiniprogramService } from 'src/modules/wechat/miniprogram/miniprogram.service';
import { JwtHelperService } from '../jwt-helper/jwt-helper.service';

@Injectable()
export class LoginService {
    constructor(
        private userService: UserService,
        private jwtHelperService: JwtHelperService,
        private miniprogramService: MiniprogramService,
    ) {}

    /**
     * 通过微信小程序Code登陆并换领认证TOKEN
     * @param code 小程序Code
     * @returns 登陆信息
     */
    async loginByMiniProgramCode(code: string) {
        const info = await this.miniprogramService.getIDsAndSessionKeyByCode(code);
        const user = await this.userService.getOrCreateUserByUnionIDOrOpenID(info.unionID, info.openID);
        await this.userService.updateLoginDateToNow(user.id);
        return {
            role: user.role,
            nickName: user.nickName,
            avatarFileName: user.avatarFileName,
            id: user.id,
            points: user.points,
            token: await this.jwtHelperService.getJWTPayloadForMiniProgram(
                user,
                info.sessionKey,
            ),
        };
    }
}
