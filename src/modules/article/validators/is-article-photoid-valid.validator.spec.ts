import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsArticlePhotoIDValidValidator } from './is-article-photoid-valid.validator';

describe('IsArticlePhotoIDValidValidator', () => {
    let validator: IsArticlePhotoIDValidValidator;
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
            providers: [IsArticlePhotoIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsArticlePhotoIDValidValidator>(IsArticlePhotoIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - Article PhotoID is valid and exists', async () => {
        dependencies["ArticleService"].isArticlePhotoExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["ArticleService"].isArticlePhotoExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - Article PhotoID is valid and not exists', async () => {
        dependencies["ArticleService"].isArticlePhotoExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["ArticleService"].isArticlePhotoExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - Article PhotoID is not valid.', async () => {
        dependencies["ArticleService"].isArticlePhotoExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["ArticleService"].isArticlePhotoExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - Article PhotoID is NaN.', async () => {
        dependencies["ArticleService"].isArticlePhotoExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN);
        expect(dependencies["ArticleService"].isArticlePhotoExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('Article PhotoID is not valid or not exists!');
    });
});
