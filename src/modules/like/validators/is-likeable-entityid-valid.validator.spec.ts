import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsLikeableEntityIDValidValidator } from './is-likeable-entityid-valid.validator';

describe('IsLikeableEntityIDValidValidator', () => {
    let validator: IsLikeableEntityIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "LikeableEntityService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "LikeableEntityService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsLikeableEntityIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsLikeableEntityIDValidValidator>(IsLikeableEntityIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - Likeable EntityID is valid and exists', async () => {
        dependencies["LikeableEntityService"].isEntityExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["LikeableEntityService"].isEntityExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - Likeable EntityID is valid and not exists', async () => {
        dependencies["LikeableEntityService"].isEntityExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["LikeableEntityService"].isEntityExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - Likeable EntityID is not valid', async () => {
        dependencies["LikeableEntityService"].isEntityExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["LikeableEntityService"].isEntityExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - Likeable EntityID is NaN', async () => {
        dependencies["LikeableEntityService"].isEntityExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN);
        expect(dependencies["LikeableEntityService"].isEntityExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('Likeable EntityID is not valid or not exists!');
    });
});
