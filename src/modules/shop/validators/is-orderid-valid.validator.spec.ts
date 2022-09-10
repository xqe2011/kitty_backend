import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsOrderIDValidValidator } from './is-orderid-valid.validator';

describe('IsOrderIDValidValidator', () => {
    let validator: IsOrderIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "OrderService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "OrderService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsOrderIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsOrderIDValidValidator>(IsOrderIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - OrderID is valid and exists', async () => {
        dependencies["OrderService"].isOrderExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["OrderService"].isOrderExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - OrderID is valid and not exists', async () => {
        dependencies["OrderService"].isOrderExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["OrderService"].isOrderExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - OrderID is not valid.', async () => {
        dependencies["OrderService"].isOrderExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["OrderService"].isOrderExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - OrderID is NaN.', async () => {
        dependencies["OrderService"].isOrderExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN);
        expect(dependencies["OrderService"].isOrderExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('OrderID is not valid or not exists!');
    });
});
