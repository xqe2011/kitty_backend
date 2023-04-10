import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsItemIDValidValidator } from './is-itemid-valid.validator';

describe('IsItemIDValidValidator', () => {
    let validator: IsItemIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ShopService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ShopService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsItemIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsItemIDValidValidator>(IsItemIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - ItemID is valid and exists', async () => {
        dependencies["ShopService"].isItemExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["ShopService"].isItemExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - ItemID is valid and not exists', async () => {
        dependencies["ShopService"].isItemExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["ShopService"].isItemExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - ItemID is not valid.', async () => {
        dependencies["ShopService"].isItemExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["ShopService"].isItemExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - ItemID is NaN.', async () => {
        dependencies["ShopService"].isItemExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN);
        expect(dependencies["ShopService"].isItemExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('ItemID is not valid or not exists!');
    });
});
