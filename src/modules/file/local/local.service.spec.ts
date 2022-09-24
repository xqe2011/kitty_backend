import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { FileType } from '../enums/file-type.enum';
import { LocalService } from './local.service';
import * as fs from 'fs-extra';

describe('LocalService', () => {
    let service: LocalService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject,
        "FileService": MockedObject,
        "ToolService": MockedObject,
        "CryptoService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ConfigService": {},
            "ToolService": {},
            "FileService": {},
            "CryptoService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [LocalService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<LocalService>(LocalService);

        /* 清除SpyOn */
        jest.clearAllMocks();
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap()', async () => {
        dependencies["FileService"].registerTokenProvider = jest.fn();
        service.onApplicationBootstrap();
        expect(dependencies["FileService"].registerTokenProvider).toBeCalledWith('local', LocalService);
    });

    test('getTokenSign()', async () => {
        dependencies["CryptoService"].hmac = jest.fn().mockResolvedValueOnce('xqexqexqexqe');
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce('abcdefgh');
        const data1 = await service.getTokenSign("1|2|3|4");
        expect(dependencies["CryptoService"].hmac).toBeCalledWith('abcdefgh', '1|2|3|4');
        expect(data1).toEqual("xqexqexqexqe");
    });

    test('verifyToken() - Valid Token', async () => {
        service.getTokenSign = jest.fn().mockResolvedValueOnce("snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'debug' ? 'false' : '60');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246404');
        const data1 = await service.verifyToken("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(service.getTokenSign).toBeCalledWith("upload:123.jpg:0:1652246384");
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(1);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(2);
        expect(data1).toEqual(true);
    });

    test('verifyToken() - Invalid Token but not expired', async () => {
        service.getTokenSign = jest.fn().mockResolvedValueOnce("snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'debug' ? 'false' : '60');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246404');
        const data1 = await service.verifyToken("upload:123.jpg:9:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(service.getTokenSign).toBeCalledTimes(0);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(0);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(0);
        expect(data1).toEqual(false);
    });

    test('verifyToken() - Valid Token but expired', async () => {
        service.getTokenSign = jest.fn().mockResolvedValueOnce("snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'debug' ? 'false' : '10');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246404');
        const data1 = await service.verifyToken("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(service.getTokenSign).toBeCalledTimes(1);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(1);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(2);
        expect(data1).toEqual(false);
    });

    test('createUploadParams() - Match Extensions', async () => {
        service.getTokenSign = jest.fn().mockResolvedValueOnce("snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce("http://test.api")
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246384');
        const data1 = await service.createUploadParams(2222, FileType.UNCOMPRESSED_IMAGE, "jpg");
        expect(service.getTokenSign).toBeCalledTimes(1);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(1);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(1);
        expect(data1).toEqual( {
            url: 'http://test.api/files/local/upload',
            params: {
                token: expect.stringMatching(/^upload:(.*)\.jpg:0:1652246384:snl2ury\/2jJE3WvaUEEahEqUTQGCG\/VthfDU1l3GdrA=$/),
            },
        });
    });

    test('createUploadParams() - Unmached Extensions', async () => {
        service.getTokenSign = jest.fn().mockResolvedValueOnce("snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce("http://test.api");
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246384');
        try {
            await service.createUploadParams(2222, FileType.UNCOMPRESSED_IMAGE, "php");
        } catch(e) {
            expect(e).toBeInstanceOf(BadRequestException);
        }
        expect(service.getTokenSign).toBeCalledTimes(0);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(0);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(0);
    });

    test('uploadFile() - File Exists', async () => {
        dependencies["FileService"].generateFileToken = jest.fn().mockReturnValueOnce("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce("/test");
        const pathExistsFunc = jest.spyOn(fs, 'pathExists').mockImplementation(() => Promise.resolve(false));
        const moveFunc = jest.spyOn(fs, 'move').mockImplementation();
        const data1 = await service.uploadFile("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=", {
            path: "/test2/hjhjhj.jpg"
        } as any);
        expect(pathExistsFunc).toBeCalledWith("/test/123.jpg");
        expect(moveFunc).toBeCalledWith("/test2/hjhjhj.jpg", "/test/123.jpg");
        expect(dependencies["FileService"].generateFileToken).toBeCalledWith("123.jpg", FileType.UNCOMPRESSED_IMAGE);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(1);
        expect(data1).toEqual({
            fileToken: "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA="
        });
    });

    test('uploadFile() - File Not Exists', async () => {
        dependencies["FileService"].generateFileToken = jest.fn().mockReturnValueOnce("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce("/test");
        const pathExistsFunc = jest.spyOn(fs, 'pathExists').mockImplementation(() => Promise.resolve(true));
        const moveFunc = jest.spyOn(fs, 'move').mockImplementation();
        try {
            await service.uploadFile("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=", {
                path: "/test2/hjhjhj.jpg"
            } as any);
        } catch(e) {
            expect(e).toBeInstanceOf(ConflictException);
        }
        expect(pathExistsFunc).toBeCalledWith("/test/123.jpg");
        expect(moveFunc).toBeCalledTimes(0);
        expect(dependencies["FileService"].generateFileToken).toBeCalledTimes(0);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(1);
    });
});
