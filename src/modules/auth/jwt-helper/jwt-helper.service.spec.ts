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
        "CryptoService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "JwtService": {},
            "CryptoService": {}
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
        dependencies["CryptoService"].aesEcbEncryptReturnInBase64 = jest.fn().mockResolvedValue("123456789");
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValue("abceefgh");
        dependencies["JwtService"].sign = jest.fn().mockReturnValue("[354yhfhdfshgdfh");
        const data1 = await service.getJWTPayloadForMiniProgram(user as any, "Z6eOQYPGBYcj+Sg7MxurwA==");
        expect(dependencies["CryptoService"].derivatKey).toBeCalledWith("jwt-miniprogram-secret");
        expect(dependencies["CryptoService"].aesEcbEncryptReturnInBase64).toBeCalledWith("abceefgh", Buffer.from("Z6eOQYPGBYcj+Sg7MxurwA==", 'base64'));
        expect(dependencies["JwtService"].sign).toBeCalledWith({
            sub: user.id,
            role: user.role,
            type: JwtType.MiniProgram,
            en: "123456789",
        });
        expect(data1).toBe("[354yhfhdfshgdfh");
    });

    test('parseJWTPayload() - MiniProgram', async () => {
        dependencies["CryptoService"].aesEcbDecrypt = jest.fn().mockReturnValue("uuuuiiii");
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValue("abceefgh");
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
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValue("abceefgh");
        expect(dependencies["CryptoService"].aesEcbDecrypt).toBeCalledWith("abceefgh", "U2FsdGVkX18Eb4Px15quXd7Lrp8Kt6BnCkV/T9InOyY=");
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
