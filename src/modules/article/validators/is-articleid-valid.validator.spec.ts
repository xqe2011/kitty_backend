import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsArticleIDValidValidator } from './is-articleid-valid.validator';

describe('IsArticleIDValidValidator', () => {
    let validator: IsArticleIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ArticleService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ArticleService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsArticleIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsArticleIDValidValidator>(IsArticleIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - ArticleID is valid and exists.', async () => {
        dependencies["ArticleService"].isArticleExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["ArticleService"].isArticleExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - ArticleID is valid and not exists', async () => {
        dependencies["ArticleService"].isArticleExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["ArticleService"].isArticleExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - ArticleID is not valid.', async () => {
        dependencies["ArticleService"].isArticleExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["ArticleService"].isArticleExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('ArticleID is not valid or not exists!');
    });
});
