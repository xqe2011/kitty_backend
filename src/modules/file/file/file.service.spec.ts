import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { FileType } from '../enums/file-type.enum';
import { FileService } from './file.service';

describe('FileService', () => {
    let service: FileService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject,
        "Object": MockedObject,
        "ToolService": MockedObject,
        "SettingService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ConfigService": {},
            "Object": {},
            "ToolService": {},
            "SettingService": {},
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileService,
                /* 因为部分方法需要使用ModuleRef获取类实例,所以直接将Object写入providers方便比对 */
                {
                    provide: Object,
                    useValue: dependencies["Object"],
                }
            ],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<FileService>(FileService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap()', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce("http://abcd.com/");
        dependencies["SettingService"].createSetting = jest.fn();
        dependencies["SettingService"].updateSetting = jest.fn();
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce("http://abc.com/");
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('files.url');
        expect(dependencies["SettingService"].createSetting).toBeCalledTimes(0);
        expect(dependencies["ConfigService"].get).toBeCalledWith('files.url');
        expect(dependencies["SettingService"].updateSetting).toBeCalledWith('files.url', "http://abc.com/");
    });

    test('registerTokenProvider()', async () => {
        dependencies["Object"].a = "b" as any;
        await service.registerTokenProvider("abcd", Object as any);
        expect((service as any).providers["abcd"]).toEqual({a: "b"});
    });

    test('createUploadParams() - Other Providers', async () => {
        const uploadProvier = {
            getUploadParams: jest.fn().mockReturnValue({"aaa": "bbb"})
        };
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce('qiniu');
        (service as any).providers["qiniu"] = uploadProvier;
        const data1 = await service.createUploadParams(2222, FileType.COMPRESSED_IMAGE, ".jpg");
        expect(dependencies["ConfigService"].get).toBeCalledWith('files.upload.provider');
        expect(uploadProvier.getUploadParams).toBeCalledWith(2222, FileType.COMPRESSED_IMAGE, ".jpg");
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('createUploadParams() - Fallback Provider to local', async () => {
        const uploadProvier = {
            getUploadParams: jest.fn().mockReturnValue({"aaa": "bbb"})
        };
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce('qiniu');
        (service as any).providers["local"] = uploadProvier;
        const data1 = await service.createUploadParams(2222, FileType.COMPRESSED_IMAGE, ".jpg");
        expect(dependencies["ConfigService"].get).toBeCalledWith('files.upload.provider');
        expect(uploadProvier.getUploadParams).toBeCalledWith(2222, FileType.COMPRESSED_IMAGE, ".jpg");
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('getFileNameByToken()', async () => {
        const data1 = await service.getFileNameByToken("1|2|3|4|5");
        expect(data1).toEqual("2");
    });

    test('getFileTypeByToken()', async () => {
        const data1 = await service.getFileTypeByToken("1|2|3|4|5");
        expect(data1).toEqual("3");
    });

    test('getTokenSign()', async () => {
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce('xqexqexqexqe');
        const data1 = await service.getTokenSign("1|2|3|4");
        expect(dependencies["ConfigService"].get).toBeCalledWith('secret');
        expect(data1).toEqual("OoL85ddBEtZTkzuIybnlCk51v26WOGwcq7V0j20rcbg=");
    });

    test('verifyFileToken() - Valid Token', async () => {
        service.getTokenSign = jest.fn().mockReturnValueOnce("+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'debug' ? false : '60');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246404');
        const data1 = await service.verifyFileToken("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(service.getTokenSign).toBeCalledWith("file|123.jpg|0|1652246384");
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(1);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(2);
        expect(data1).toEqual(true);
    });

    test('verifyFileToken() - Invalid Token but not expired', async () => {
        service.getTokenSign = jest.fn().mockReturnValueOnce("+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'debug' ? false : '60');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246404');
        const data1 = await service.verifyFileToken("file|123.jpg|9|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(service.getTokenSign).toBeCalledTimes(0);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(0);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(0);
        expect(data1).toEqual(false);
    });

    test('verifyFileToken() - Valid Token but expired', async () => {
        service.getTokenSign = jest.fn().mockReturnValueOnce("+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'debug' ? false : '10');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246404');
        const data1 = await service.verifyFileToken("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(service.getTokenSign).toBeCalledTimes(1);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(1);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(2);
        expect(data1).toEqual(false);
    });

    test('generateFileToken()', async () => {
        service.getTokenSign = jest.fn().mockReturnValueOnce("+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce('1652246384');
        const data1 = await service.generateFileToken("123.jpg", FileType.UNCOMPRESSED_IMAGE);
        expect(service.getTokenSign).toBeCalledTimes(1);
        expect(dependencies["ToolService"].getNowTimestamp).toBeCalledTimes(1);
        expect(data1).toEqual("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
    });
});
