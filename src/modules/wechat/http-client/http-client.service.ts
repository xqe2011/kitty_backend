import { Injectable, Logger, Scope, ServiceUnavailableException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import fetch from 'node-fetch';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { ToolService } from 'src/modules/tool/tool/tool.service';
import { EntityManager } from 'typeorm';

type WechatHttpMethod = 'POST' | 'GET';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpClientService {
    /** 微信AccessToken */
    private accessToken = '';

    /** 微信APPID */
    private appID = '';

    /** 微信APPSECRET */
    private appSecret = '';

    private readonly logger = new Logger(HttpClientService.name);

    constructor(
        private configService: ConfigService,
        private settingService: SettingService,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private toolService: ToolService,
        private schedulerRegistry: SchedulerRegistry,
    ) {}

    /**
     * 初始化本Service,每个注入的模块都必须在onApplicationBootstrap里调用本方法
     * @param appID 微信APPID
     * @param appSecret 微信APPSECRET
     */
    async init(appID: string, appSecret: string) {
        this.appID = appID;
        this.appSecret = appSecret;
        const key = 'wechat.token.' + this.appID;
        if ((await this.settingService.getSetting(key)) == '') {
            await this.settingService.createSetting(key, {}, false);
        }
        await this.updateAccessToken();
    }

    /**
     * 更新/获取AccessToken
     */
    private async updateAccessToken() {
        this.logger.log('Check or fetch wechat access token...');
        await this.entityManager.transaction(async (entityManager) => {
            const key = 'wechat.token.' + this.appID;
            const scheduleKey = key + '.' + this.toolService.getNowTimestamp();
            const tokenData = await this.settingService.getAndLockSetting(key, entityManager);
            const renewIn = parseInt(this.configService.get<string>('wechat.renew_in', '30'));
            const renewTiemoutRandomInt = randomInt(1, 10);

            if (
                typeof tokenData == 'object' &&
                typeof tokenData.expires_time == 'number' &&
                tokenData.expires_time - this.toolService.getNowTimestamp() > renewIn
            ) {
                this.accessToken = tokenData.token;
                this.logger.log('Load wechat access token from database success.');
                this.schedulerRegistry.addTimeout(
                    scheduleKey,
                    setTimeout(
                        () => this.updateAccessToken(),
                        (tokenData.expires_time - this.toolService.getNowTimestamp() - renewIn + renewTiemoutRandomInt) * 1000,
                    ),
                );
                return;
            }
            this.logger.log('Fetch wechat access token...');
            let response: any;
            try {
                response = await this.fetchJson(
                    'GET',
                    '/cgi-bin/token',
                    {
                        grant_type: 'client_credential',
                        appid: this.appID,
                        secret: this.appSecret,
                    },
                    {},
                    false,
                );
            } catch (exception) {
                this.logger.error(
                    'Cannot fetch access token from wechat server: ' +
                        exception.message,
                );
                this.schedulerRegistry.addTimeout(
                    scheduleKey,
                    setTimeout(
                        () => this.updateAccessToken(),
                        parseInt(this.configService.get<string>('wechat.retry_duration', '30')) * 1000,
                    ),
                );
                return;
            }
            this.accessToken = response.access_token;
            this.settingService.updateSetting(key, {
                token: response.access_token,
                expires_time: this.toolService.getNowTimestamp() + response.expires_in,
            });
            this.schedulerRegistry.addTimeout(
                scheduleKey,
                setTimeout(
                    () => this.updateAccessToken(),
                    (response.expires_in - renewIn + renewTiemoutRandomInt) * 1000,
                ),
            );
            this.logger.log('Fetch wechat access token success.');
        });
    }

    /**
     * 发送HTTP请求,返回请求
     * @param method HTTP方法
     * @param path 路径
     * @param params URL参数
     * @param body 请求主体
     * @param withToken 是否携带AccessToken
     * @returns Response
     */
    private async fetchResponse(method: WechatHttpMethod, path: string, params: Record<string, string>, body: object, withToken = false) {
        const url = new URL(path, this.configService.get<string>('wechat.url', 'https://api.weixin.qq.com'));
        const httpParams = new URLSearchParams(params);
        if (withToken) {
            httpParams.append('access_token', this.accessToken);
        }
        url.search = httpParams.toString();
        const response = await fetch(url.href, {
            method: method,
            body: method == 'GET' ? undefined : JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
        });
        if (response.status != 200) {
            throw new ServiceUnavailableException('Wechat api status code error: ' + response.text());
        }
        let data: any = {};
        try {
            data = await response.clone().json();
        } catch (e) {}
        if (typeof data.errcode == 'number' && typeof data.errmsg == 'string') {
            throw new ServiceUnavailableException(`Wechat api error, Code: ${data.errcode}, Message: "${data.errmsg}"`);
        }
        return response;
    }

    /**
     * 发送HTTP请求,返回BLOB
     * @param method HTTP方法
     * @param path 路径
     * @param params URL参数
     * @param body 请求主体
     * @param withToken 是否携带AccessToken
     * @returns BLOB
     */
    async fetchRaw(method: WechatHttpMethod, path: string, params: Record<string, string>, body: object, withToken = false) {
        return (await this.fetchResponse(method, path, params, body, withToken)).blob();
    }

    /**
     * 发送HTTP请求,返回JSON结构体
     * @param method HTTP方法
     * @param path 路径
     * @param params URL参数
     * @param body 请求主体
     * @param withToken 是否携带AccessToken
     * @returns JSON结构体
     */
    async fetchJson(method: WechatHttpMethod, path: string, params: Record<string, string>, body: object, withToken = false) {
        return (await this.fetchResponse(method, path, params, body, withToken)).json() as any;
    }
}
