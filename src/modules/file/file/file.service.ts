import { Injectable, OnApplicationBootstrap, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { enc, HmacSHA256 } from 'crypto-js';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { ToolService } from 'src/modules/tool/tool/tool.service';
import { FileType } from '../enums/file-type.enum';
import { UploadPrividerInterface } from '../upload-provider.interface';

@Injectable()
export class FileService implements OnApplicationBootstrap {
    private providers: { [name: string]: UploadPrividerInterface } = {};

    constructor(
        private configService: ConfigService,
        private moduleRef: ModuleRef,
        private toolService: ToolService,
        private settingService: SettingService,
    ) {}

    async onApplicationBootstrap() {
        if ((await this.settingService.getSetting('files.url')) == '') {
            await this.settingService.createSetting('files.url', '', true);
        }
        await this.settingService.updateSetting('files.url', this.configService.get<string>('files.url'));
    }

    /**
     * 注册Token提供者，用于方便扩展不同提供者
     * @param name 提供者名称
     * @param classType 类的类型，本方法适用DI获取实例
     */
    registerTokenProvider(name: string, classType: Type<UploadPrividerInterface>) {
        this.providers[name] = this.moduleRef.get(classType);
    }

    /**
     * 创建上传一个文件所需的接口参数
     * @param userID 用户ID
     * @param fileType 文件类型
     * @param extName 扩展名
     * @returns 接口参数,直接返回给客户端
     */
    async createUploadParams(userID: number, fileType: FileType, extName: string) {
        let providerName = this.configService.get<string>('files.upload.provider');
        if (!(providerName in this.providers)) {
            providerName = 'local';
        }
        return await this.providers[providerName].createUploadParams(userID, fileType, extName);
    }

    /**
     * 通过文件TOKEN获取文件名
     * @param token 文件TOKEN
     * @returns 文件名
     */
    getFileNameByToken(token: string) {
        const tokenArray = token.split('|');
        return tokenArray[1];
    }

    /**
     * 通过文件TOKEN获取文件类型
     * @param token 文件TOKEN
     * @returns 文件类型
     */
    getFileTypeByToken(token: string) {
        const tokenArray = token.split('|');
        return tokenArray[2] as FileType;
    }

    /**
     * 计算文件TOKEN签名
     * @param token 文件上传TOKEN不包含前面的部分
     * @returns 签名
     */
    getTokenSign(token: string) {
        return enc.Base64.stringify(HmacSHA256(token, this.configService.get<string>('secret')));
    }

    /**
     * 验证文件token是否有效
     * @param token 文件上传TOKEN
     * @returns 是否正确
     */
    verifyFileToken(token: string) {
        if (typeof token != 'string' || token.length < 15) return false;
        const tokenArray = token.split('|');
        const timestamp = parseInt(tokenArray[3]);
        if (
            tokenArray.length != 5 ||
            timestamp === NaN ||
            tokenArray[0] != 'file' ||
            !Object.values(FileType).includes(tokenArray[2] as FileType) ||
            tokenArray[4] != this.getTokenSign(tokenArray[0] + '|' + tokenArray[1] + '|' + tokenArray[2] + '|' + tokenArray[3])
        ) {
            return false;
        }
        if (
            !this.configService.get<boolean>('debug', false) &&
            this.toolService.getNowTimestamp() - timestamp > parseInt(this.configService.get<string>('files.token_expired_time', '60'))
        ) {
            return false;
        }
        return true;
    }

    /**
     * 生成文件token
     * @param name 文件名称
     * @param type 文件类型
     * @returns 文件TOKEN
     */
    async generateFileToken(name: string, type: FileType) {
        let token = 'file|' + name + '|' + type + '|' + this.toolService.getNowTimestamp();
        token += '|' + this.getTokenSign(token);
        return token;
    }
}
