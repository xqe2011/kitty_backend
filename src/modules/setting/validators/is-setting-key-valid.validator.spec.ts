import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsSettingKeyValidValidator } from './is-setting-key-valid.validator';

describe('IsSettingKeyValidValidator', () => {
    let validator: IsSettingKeyValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "SettingService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "SettingService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsSettingKeyValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsSettingKeyValidValidator>(IsSettingKeyValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - SettingKey is valid and exists', async () => {
        dependencies["SettingService"].fetchSettingFromClient = jest.fn().mockResolvedValueOnce("value");
        const data1 = await validator.validate("test.xqe");
        expect(dependencies["SettingService"].fetchSettingFromClient).toBeCalledWith("test.xqe", true);
        expect(data1).toBe(true);
    });

    test('validate() - SettingKey is valid and not exists', async () => {
        dependencies["SettingService"].fetchSettingFromClient = jest.fn().mockResolvedValueOnce(null);
        const data1 = await validator.validate("test.xqe");
        expect(dependencies["SettingService"].fetchSettingFromClient).toBeCalledWith("test.xqe", true)
        expect(data1).toBe(false);
    });

    test('validate() - SettingKey is not valid', async () => {
        dependencies["SettingService"].fetchSettingFromClient = jest.fn().mockResolvedValueOnce(null);
        const data1 = await validator.validate(23223);
        expect(dependencies["SettingService"].fetchSettingFromClient).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('SettingKey is not valid or not exists!');
    });
});
