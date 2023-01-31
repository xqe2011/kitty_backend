import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsTagIDValidValidator } from './is-tagid-valid.validator';

describe('IsTagIDValidValidator', () => {
    let validator: IsTagIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "TagService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "TagService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsTagIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsTagIDValidValidator>(IsTagIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - TagID is valid and exists', async () => {
        dependencies["TagService"].isTagExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["TagService"].isTagExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - TagID is valid and not exists', async () => {
        dependencies["TagService"].isTagExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["TagService"].isTagExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - TagID is not valid.', async () => {
        dependencies["TagService"].isTagExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["TagService"].isTagExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('TagID is not valid or not exists!');
    });
});
