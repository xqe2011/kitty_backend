import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { MiniprogramService } from './miniprogram.service';

describe('MiniprogramService', () => {
    let service: MiniprogramService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject,
        "HttpClientService": MockedObject,
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ConfigService": {},
            "HttpClientService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [MiniprogramService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = await module.resolve<MiniprogramService>(MiniprogramService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap()', async () => {
        dependencies["HttpClientService"].init = jest.fn();
        dependencies["ConfigService"].get = jest.fn().mockImplementation(key => key == 'wechat.miniprogram.appid' ? "aid" : "asecret")
        await service.onApplicationBootstrap();
        expect(dependencies["HttpClientService"].init).toBeCalledWith("aid", "asecret");
        expect(dependencies["ConfigService"].get).toBeCalledTimes(2);
    });

    test('getIDsAndSessionKeyByCode()', async () => {
        dependencies["HttpClientService"].fetchJson = jest.fn().mockResolvedValue({
            openid: "oid",
            unionid: "uid",
            session_key: "sk"
        });
        (service as any).appID = "aid";
        (service as any).appSecret = "asecret";
        const data1 = await service.getIDsAndSessionKeyByCode("ecode");
        expect(dependencies["HttpClientService"].fetchJson).toBeCalledWith(
            'GET',
            '/sns/jscode2session',
            {
                appid: "aid",
                secret: "asecret",
                js_code: "ecode",
                grant_type: 'authorization_code',
            },
            {},
            false
        );
        expect(data1).toEqual({
            openID: "oid",
            unionID: "uid",
            sessionKey: "sk"
        });
    });
});
