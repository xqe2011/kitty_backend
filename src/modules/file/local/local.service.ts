import { BadRequestException, ConflictException, Injectable, OnApplicationBootstrap, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { move, pathExists } from 'fs-extra';
import { join } from 'path';
import { CryptoService } from 'src/modules/tool/crypto/crypto.service';
import { ToolService } from 'src/modules/tool/tool/tool.service';
import { FileType } from '../enums/file-type.enum';
import { FileService } from '../file/file.service';
import { UploadPrividerInterface } from '../upload-provider.interface';

@Injectable()
export class LocalService
    implements UploadPrividerInterface, OnApplicationBootstrap
{
    /** 不同文件类型允许的扩展名  */
    private fileTypeAllowExt = {
        [FileType.UNCOMPRESSED_IMAGE]: ['jpg', 'jpeg', 'png'],
        [FileType.COMPRESSED_IMAGE]: ['jpg', 'jpeg'],
    };

    constructor(
        private configService: ConfigService,
        private fileService: FileService,
        private toolService: ToolService,
        private cryptoService: CryptoService
    ) {}

    onApplicationBootstrap() {
        this.fileService.registerTokenProvider('local', LocalService);
    }

    /**
     * 验证文件上传token是否有效
     * @param token 文件上传TOKEN
     * @returns 是否正确
     */
    async verifyToken(token: string) {
        if (typeof token != 'string' || token.length < 15) return false;
        const tokenArray = token.split(':');
        const timestamp = parseInt(tokenArray[3]);
        if (
            tokenArray.length != 5 ||
            timestamp === NaN ||
            tokenArray[0] != 'upload' ||
            !Object.values(FileType).includes(tokenArray[2] as FileType) ||
            tokenArray[4] != await this.getTokenSign(tokenArray[0] + ':' + tokenArray[1] + ':' + tokenArray[2] + ':' + tokenArray[3])
        ) {
            return false;
        }
        if (
            this.configService.get<string>('debug', "false").toLowerCase() !== 'true' &&
            this.toolService.getNowTimestamp() - timestamp > parseInt(this.configService.get<string>('files.providers.local.upload.token_expired_time', '1200'))
        ) {
            return false;
        }
        return true;
    }

    /**
     * 计算文件上传TOKEN签名
     * @param token 文件上传上传TOKEN不包含前面的部分
     * @returns 签名
     */
    async getTokenSign(token: string) {
        return this.cryptoService.hmac(await this.cryptoService.derivatKey('file-upload-token'), token);
    }

    /**
     * 获取上传接口参数
     * @param userID 用户ID
     * @param fileType 文件类型
     * @param extName 扩展名
     * @returns 接口参数,直接返回给客户端
     */
    async createUploadParams(userID: number, fileType: FileType, extName: string) {
        const fileName = randomBytes(20).toString('hex') + '.' + extName;
        if (!this.fileTypeAllowExt[fileType].includes(extName)) {
            throw new BadRequestException('This file type is not matched to the extension name!');
        }
        let token = 'upload:' + fileName + ':' + fileType + ':' + this.toolService.getNowTimestamp();
        token += ':' + await this.getTokenSign(token);
        return {
            url: this.configService.get<string>('api.url') + '/files/local/upload',
            params: {
                token: token,
            },
        };
    }

    /**
     * 上传文件
     * @param token 文件上传TOKEN
     * @param file 文件
     * @returns 文件token
     */
    async uploadFile(token: string, file: Express.Multer.File) {
        const fileName = token.split(':')[1];
        const filePath = join(this.configService.get<string>('files.providers.local.path'), fileName);
        if (await pathExists(filePath)) {
            throw new ConflictException('File exists!');
        }
        await move(file.path, filePath);
        const uploadTokenParams = token.split(':');
        return {
            fileToken: await this.fileService.generateFileToken(fileName, uploadTokenParams[2] as FileType)
        };
    }
}
