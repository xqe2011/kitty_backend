import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { JwtHelperStrategy } from './jwt-helper.strategy';

describe('JwtHelperStrategy', () => {
    let strategy: JwtHelperStrategy;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "JwtHelperService": MockedObject,
        "ConfigService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "JwtHelperService": {},
            /* 该函数的构造函数内需要ConfigService,所以提前声明 */
            "ConfigService": {
                get: jest.fn().mockReturnValue("123456789")
            }
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtHelperStrategy],
        })
        .useMocker(createMocker(dependencies))
        .compile();
        strategy = module.get<JwtHelperStrategy>(JwtHelperStrategy);
    });

    test('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    test('validate()', async () => {
        dependencies["JwtHelperService"].parseJWTPayload = jest.fn().mockReturnValue({"ttt": "123"});
        const data1 = await strategy.validate({"t78": "try"});
        expect(dependencies["JwtHelperService"].parseJWTPayload).toBeCalledWith({"t78": "try"});
        expect(data1).toEqual({"ttt": "123"});
    });
});
