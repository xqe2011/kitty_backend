import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsUploadTokenValidValidator } from './is-upload-token-valid.validator';

describe('IsUploadTokenValidValidator', () => {
    let validator: IsUploadTokenValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "LocalService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "LocalService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsUploadTokenValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsUploadTokenValidValidator>(IsUploadTokenValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });
    test('validate() - UploadToken is valid', async () => {
        dependencies["LocalService"].verifyToken = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(dependencies["LocalService"].verifyToken).toBeCalledWith("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(data1).toBe(true);
    });

    test('validate() - UploadToken is not valid.', async () => {
        dependencies["LocalService"].verifyToken = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(dependencies["LocalService"].verifyToken).toBeCalledWith("upload:123.jpg:0:1652246384:snl2ury/2jJE3WvaUEEahEqUTQGCG/VthfDU1l3GdrA=");
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('Local upload token is not valid!');
    });
});
