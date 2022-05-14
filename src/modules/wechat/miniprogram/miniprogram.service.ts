import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class MiniprogramService implements OnApplicationBootstrap {
    /** 微信APPID */
    private appID = '';

    /** 微信APPSECRET */
    private appSecret = '';

    constructor(
        private configService: ConfigService,
        private httpClientService: HttpClientService,
    ) {}

    async onApplicationBootstrap() {
        this.appID = this.configService.get<string>('wechat.miniprogram.appid');
        this.appSecret = this.configService.get<string>('wechat.miniprogram.appsecret');
        await this.httpClientService.init(this.appID, this.appSecret);
    }

    /**
     * 通过小程序Code换取联盟ID和开放ID和会话密钥
     * @param code 登录时获取的code
     * @returns 联盟ID和会话密钥
     */
    async getIDsAndSessionKeyByCode(code: string) {
        const data = await this.httpClientService.fetchJson(
            'GET',
            '/sns/jscode2session',
            {
                appid: this.appID,
                secret: this.appSecret,
                js_code: code,
                grant_type: 'authorization_code',
            },
            {},
            false,
        );
        return {
            openID: data.openid as string,
            unionID: data.unionid as string,
            sessionKey: data.session_key as string,
        };
    }
}
