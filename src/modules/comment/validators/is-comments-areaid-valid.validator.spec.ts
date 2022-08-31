import { Test, TestingModule } from '@nestjs/testing';
import { ValidationArguments } from 'class-validator';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsCommentsAreaIDValidValidator } from './is-comments-areaid-valid.validator';

describe('IsCommentsAreaIDValidValidator', () => {
    let validator: IsCommentsAreaIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CommentsAreaService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CommentsAreaService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsCommentsAreaIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsCommentsAreaIDValidValidator>(IsCommentsAreaIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - Comments AreaID is valid and exists, dont check visible', async () => {
        dependencies["CommentsAreaService"].isAreaVisible = jest.fn();
        dependencies["CommentsAreaService"].isAreaExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571, { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentsAreaService"].isAreaExists).toBeCalledWith(3571);
        expect(dependencies["CommentsAreaService"].isAreaVisible).toBeCalledTimes(0);
        expect(data1).toBe(true);
    });

    test('validate() - Comments AreaID is valid and exists, check visible', async () => {
        dependencies["CommentsAreaService"].isAreaExists = jest.fn();
        dependencies["CommentsAreaService"].isAreaVisible = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571, { constraints: [true] } as ValidationArguments);
        expect(dependencies["CommentsAreaService"].isAreaExists).toBeCalledTimes(0);
        expect(dependencies["CommentsAreaService"].isAreaVisible).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - Comments AreaID is valid and not exists, dont check visible', async () => {
        dependencies["CommentsAreaService"].isAreaVisible = jest.fn();
        dependencies["CommentsAreaService"].isAreaExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572, { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentsAreaService"].isAreaExists).toBeCalledWith(3572);
        expect(dependencies["CommentsAreaService"].isAreaVisible).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - Comments AreaID is not valid, dont check visible', async () => {
        dependencies["CommentsAreaService"].isAreaVisible = jest.fn();
        dependencies["CommentsAreaService"].isAreaExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh", { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentsAreaService"].isAreaExists).toBeCalledTimes(0);
        expect(dependencies["CommentsAreaService"].isAreaVisible).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - Comments AreaID is NaN, dont check visible', async () => {
        dependencies["CommentsAreaService"].isAreaVisible = jest.fn();
        dependencies["CommentsAreaService"].isAreaExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN, { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentsAreaService"].isAreaExists).toBeCalledTimes(0);
        expect(dependencies["CommentsAreaService"].isAreaVisible).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('Comments AreaID is not valid or not visible!');
    });
});
