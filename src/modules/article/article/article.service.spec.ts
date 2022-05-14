import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
    let service: ArticleService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ArticleRepository": MockedObject,
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ArticleRepository": {},
            "FileService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [ArticleService]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<ArticleService>(ArticleService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getArticle()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            getRawOne: jest.fn()
        }
        dependencies["ArticleRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        createQueryBuilder.getRawOne.mockResolvedValueOnce({"content": 1234});
        const data = await service.getArticle(8848);
        expect(dependencies["ArticleRepository"].createQueryBuilder).toBeCalledWith();
        expect(createQueryBuilder.andWhere).toBeCalledWith("id = :id", {id: 8848});
        expect(createQueryBuilder.select).toBeCalledWith([
            'content',
            'id',
            'title',
            'coverFileName',
            'createdDate',
            'summary'
        ]);
        expect(data).toEqual({"content": 1234});
    });

    test('getArticlesList()', async () => {
        dependencies["ArticleRepository"].find = jest.fn().mockResolvedValueOnce([{
            "id": 1111
        }]);
        const data = await service.getArticlesList(50, 100);
        expect(dependencies["ArticleRepository"].find).toBeCalledWith({
            where: {
                canBeListed: true,
            },
            take: 50,
            skip: 100,
            select: ['id', 'coverFileName', 'title', 'summary'],
        });
        expect(data).toEqual([{
            "id": 1111
        }]);
    });

    test('isArticleExists() - Exist', async () => {
        dependencies["ArticleRepository"].count = jest.fn();
        dependencies["ArticleRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isArticleExists(2222);
        expect(dependencies["ArticleRepository"].count).toBeCalledWith({
            where: {
                id: 2222,
            }
        });
        expect(data1).toBe(true);
    });

    test('isArticleExists() - Not Exist', async () => {
        dependencies["ArticleRepository"].count = jest.fn();
        dependencies["ArticleRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isArticleExists(3333);
        expect(dependencies["ArticleRepository"].count).toBeCalledWith({
            where: {
                id: 3333,
            }
        });
        expect(data1).toBe(false);
    });
});
