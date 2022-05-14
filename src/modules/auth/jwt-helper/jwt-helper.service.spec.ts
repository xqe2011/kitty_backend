import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { JwtType } from '../enums/jwt-type.enum';
import { JwtHelperService } from './jwt-helper.service';

describe('JwtHelperService', () => {
    let service: JwtHelperService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "JwtService": MockedObject,
        "ConfigService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "JwtService": {},
            "ConfigService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtHelperService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<JwtHelperService>(JwtHelperService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getJWTPayloadForMiniProgram()', async () => {
        const user = {
            role: 1,
            id: 10,
        };
        dependencies["ConfigService"].get = jest.fn().mockReturnValue("123456789");
        dependencies["JwtService"].sign = jest.fn().mockReturnValue("[354yhfhdfshgdfh");
        const data1 = await service.getJWTPayloadForMiniProgram(user as any, "uuuuiiii");
        expect(dependencies["ConfigService"].get).toBeCalledWith("secret");
        expect(dependencies["JwtService"].sign).toBeCalledWith({
            sub: user.id,
            role: user.role,
            type: JwtType.MiniProgram,
            en: expect.any(String),
        });
        expect(data1).toBe("[354yhfhdfshgdfh");
    });

    test('parseJWTPayload() - MiniProgram', async () => {
        dependencies["ConfigService"].get = jest.fn().mockReturnValue("123456789");
        const user = {
            role: 1,
            id: 10,
        };
        const data1 = await service.parseJWTPayload({
            sub: user.id,
            role: user.role,
            type: JwtType.MiniProgram,
            en: "U2FsdGVkX18Eb4Px15quXd7Lrp8Kt6BnCkV/T9InOyY=",
        });
        expect(dependencies["ConfigService"].get).toBeCalledWith("secret");
        expect(data1).toEqual({
            id: user.id,
            role: user.role,
            type: JwtType.MiniProgram,
            miniprogram: {
                sessionKey: "uuuuiiii"
            }
        });
    });
});
