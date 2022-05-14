import { ForbiddenException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { auth, rs, util } from 'qiniu';
import { FileType } from '../enums/file-type.enum';
import { FileService } from '../file/file.service';
import { UploadPrividerInterface } from '../upload-provider.interface';

@Injectable()
export class QiniuService
    implements OnApplicationBootstrap, UploadPrividerInterface
{
    /** 七牛认证对象 */
    private sdkMac: auth.digest.Mac;

    /** 不同文件类型允许的MIME  */
    private fileTypeAllowMime = {
        [FileType.UNCOMPRESSED_IMAGE]: ['image/jpeg', 'image/png'],
        [FileType.COMPRESSED_IMAGE]: ['image/jpeg'],
    };

    constructor(
        private configService: ConfigService,
        private fileService: FileService,
    ) {}

    /**
     * 获取上传接口参数
     * @param userID 用户ID
     * @param fileType 文件类型
     * @param extName 扩展名
     * @returns 接口参数,直接返回给客户端
     */
    async getUploadParams(userID: number, fileType: FileType, extName: string) {
        const uploadPolicy: rs.PutPolicyOptions & { forceSaveKey: boolean } = {
            scope: this.configService.get<string>('files.providers.qiniu.scope'),
            expires: parseInt(this.configService.get<string>('files.providers.qiniu.upload.token_expired_time', '1200')),
            callbackUrl: this.configService.get<string>('api.url') + '/files/qiniu/callback',
            callbackBodyType: 'application/json',
            callbackBody: `{"fileName":"$(key)", "fileType": "${fileType}"}`,
            detectMime: 1,
            forceSaveKey: true,
            saveKey: randomBytes(20).toString('hex') + '.' + extName,
            mimeLimit: this.fileTypeAllowMime[fileType].join(';'),
            fsizeLimit: parseInt(this.configService.get<string>('files.providers.qiniu.upload.max_size', '52428800')),
            insertOnly: 1,
        };
        return {
            url: this.configService.get<string>('files.providers.qiniu.upload.url'),
            params: {
                upload_token: new rs.PutPolicy(uploadPolicy).uploadToken(this.sdkMac)
            },
        };
    }

    /**
     * 七牛服务器回调
     * @param fileName 文件名
     * @param fileType 文件类型
     * @param authorization 认证头部
     * @returns 文件Token
     */
    async getFileTokenByQiniuAuthorization(fileName: string, fileType: FileType, authorization: string) {
        /** 检查是否是七牛服务器的回调 */
        if (!util.isQiniuCallback(this.sdkMac, this.configService.get<string>('api.url') + '/files/qiniu/callback', '', authorization)) {
            throw new ForbiddenException('Must call this method from Qiniu Server!');
        }
        return {
            fileToken: await this.fileService.generateFileToken(fileName, fileType)
        };
    }

    onApplicationBootstrap() {
        /** 初始化SDK */
        this.sdkMac = new auth.digest.Mac(
            this.configService.get<string>('files.providers.qiniu.access_key'),
            this.configService.get<string>('files.providers.qiniu.secret_key'),
        );
        this.fileService.registerTokenProvider('qiniu', QiniuService);
    }
}
