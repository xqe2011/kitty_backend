import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsCatIDValidValidator } from './is-catid-valid.validator';

describe('IsCatIDValidValidator', () => {
    let validator: IsCatIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsCatIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsCatIDValidValidator>(IsCatIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - CatID is valid and exists', async () => {
        dependencies["CatService"].isCatExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["CatService"].isCatExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - CatID is valid and not exists', async () => {
        dependencies["CatService"].isCatExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["CatService"].isCatExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - CatID is not valid.', async () => {
        dependencies["CatService"].isCatExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["CatService"].isCatExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - CatID is NaN.', async () => {
        dependencies["CatService"].isCatExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN);
        expect(dependencies["CatService"].isCatExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('CatID is not valid or not exists!');
    });
});
