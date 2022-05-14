import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { HttpClientService } from './http-client.service';

describe('HttpClientService', () => {
    let service: HttpClientService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject,
        "SettingService": MockedObject,
        "EntityManager": MockedObject,
        "ToolService": MockedObject,
        "SchedulerRegistry": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ConfigService": {},
            "SettingService": {},
            "EntityManager": {},
            "ToolService": {},
            "SchedulerRegistry": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [HttpClientService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = await module.resolve<HttpClientService>(HttpClientService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('init() - Exists Setting', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce('nfviudifnij');
        dependencies["SettingService"].createSetting = jest.fn();
        const updateAccessTokenFunc = jest.fn();
        (service as any).updateAccessToken = updateAccessTokenFunc;
        await service.init("abc", "cde");
        expect(updateAccessTokenFunc).toBeCalledWith();
        expect((service as any).appID).toEqual("abc");
        expect((service as any).appSecret).toEqual("cde");
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('wechat.token.abc');
        expect(dependencies["SettingService"].createSetting).toBeCalledTimes(0);
    });

    test('init() - Not Exists Setting', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce('');
        dependencies["SettingService"].createSetting = jest.fn();
        const updateAccessTokenFunc = jest.fn();
        (service as any).updateAccessToken = updateAccessTokenFunc;
        await service.init("abc", "cde");
        expect(updateAccessTokenFunc).toBeCalledWith();
        expect((service as any).appID).toEqual("abc");
        expect((service as any).appSecret).toEqual("cde");
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('wechat.token.abc');
        expect(dependencies["SettingService"].createSetting).toBeCalledWith('wechat.token.abc', {}, false)
    });

    test('fetchRaw()', async () => {
        const blobFunc = jest.fn().mockReturnValueOnce(Object);
        const fetchResponseFunc = jest.fn().mockResolvedValueOnce({
            blob: blobFunc
        });
        (service as any).fetchResponse = fetchResponseFunc;
        const data1 = await service.fetchRaw("POST", "/test", {}, {}, true);
        expect(fetchResponseFunc).toBeCalledWith("POST", "/test", {}, {}, true);
        expect(blobFunc).toBeCalledWith()
        expect(data1).toEqual(Object);
    });

    test('fetchJson()', async () => {
        const jsonFunc = jest.fn().mockReturnValueOnce({"aaa": "bbb"});
        const fetchResponseFunc = jest.fn().mockResolvedValueOnce({
            json: jsonFunc
        });
        (service as any).fetchResponse = fetchResponseFunc;
        const data1 = await service.fetchJson("POST", "/test", {}, {}, true);
        expect(fetchResponseFunc).toBeCalledWith("POST", "/test", {}, {}, true);
        expect(jsonFunc).toBeCalledWith();
        expect(data1).toEqual({"aaa": "bbb"});
    });
});
