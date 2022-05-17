import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { auth, rs, util } from 'qiniu';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { FileType } from '../enums/file-type.enum';
import { QiniuService } from './qiniu.service';

describe('QiniuService', () => {
    let service: QiniuService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject,
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ConfigService": {},
            "FileService": {},
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [QiniuService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<QiniuService>(QiniuService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap()', async () => {
        dependencies["FileService"].registerTokenProvider = jest.fn();
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'files.providers.qiniu.access_key' ? "ak" : "sk");
        const macFunction = jest.fn();
        auth.digest.Mac = macFunction;
        await service.onApplicationBootstrap();
        expect(macFunction).toBeCalledWith("ak", "sk");
        expect(dependencies["FileService"].registerTokenProvider).toBeCalledWith('qiniu', QiniuService);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(2);
    });

    test('createUploadParams()', async () => {
        const configKey = {
            'files.providers.qiniu.scope': "abc",
            'files.providers.qiniu.upload.token_expired_time': "1200",
            'api.url': "http://test.api",
            'files.providers.qiniu.upload.max_size': '52428800',
            'files.providers.qiniu.upload.url': "http://qiniu.com"
        };
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => configKey[key]);
        const putPolicy = {
            uploadToken: jest.fn().mockReturnValue("ababcdcd")
        };
        rs.PutPolicy = jest.fn().mockImplementation(() => putPolicy);
        (service as any).sdkMac = Object;
        const data1 = await service.createUploadParams(2222, FileType.UNCOMPRESSED_IMAGE, "jpg");
        expect(rs.PutPolicy).toBeCalledWith({
            scope: "abc",
            expires: 1200,
            callbackUrl: 'http://test.api/files/qiniu/callback',
            callbackBodyType: 'application/json',
            callbackBody: `{"fileName":"$(key)", "fileType": "0"}`,
            detectMime: 1,
            forceSaveKey: true,
            saveKey: expect.stringMatching(/^(.*)\.jpg$/),
            mimeLimit: 'image/jpeg;image/png',
            fsizeLimit: 52428800,
            insertOnly: 1,
        });
        expect(putPolicy.uploadToken).toBeCalledWith(Object);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(5);
        expect(data1).toEqual( {
            url: 'http://qiniu.com',
            params: {
                token: "ababcdcd",
            },
        });
    });

    test('getFileTokenByQiniuAuthorization() - Valid Token', async () => {
        (service as any).sdkMac = Object;
        util.isQiniuCallback = jest.fn().mockReturnValue(true);
        dependencies["ConfigService"].get = jest.fn().mockReturnValue("http://test.api");
        dependencies["FileService"].generateFileToken = jest.fn().mockResolvedValue("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        const data1 = await service.getFileTokenByQiniuAuthorization("123.jpg", FileType.UNCOMPRESSED_IMAGE, "abababababdfs");
        expect(util.isQiniuCallback).toBeCalledWith(Object, "http://test.api/files/qiniu/callback", '', "abababababdfs");
        expect(dependencies["FileService"].generateFileToken).toBeCalledWith("123.jpg", FileType.UNCOMPRESSED_IMAGE);
        expect(dependencies["ConfigService"].get).toBeCalledWith("api.url");
        expect(data1).toEqual({
            fileToken: "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA="
        });
    });

    test('getFileTokenByQiniuAuthorization() - Invalid Token', async () => {
        (service as any).sdkMac = Object;
        util.isQiniuCallback = jest.fn().mockReturnValue(false);
        dependencies["ConfigService"].get = jest.fn().mockReturnValue("http://test.api");
        dependencies["FileService"].generateFileToken = jest.fn().mockResolvedValue("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        try {
            await service.getFileTokenByQiniuAuthorization("123.jpg", FileType.UNCOMPRESSED_IMAGE, "abababababdfs");
        } catch(e) {
            expect(e).toBeInstanceOf(ForbiddenException);
        }
        expect(util.isQiniuCallback).toBeCalledWith(Object, "http://test.api/files/qiniu/callback", '', "abababababdfs");
        expect(dependencies["FileService"].generateFileToken).toBeCalledTimes(0);
        expect(dependencies["ConfigService"].get).toBeCalledWith("api.url");
    });
});
