import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ArticlePhoto } from '../entities/article-photo.entity';
import { Article } from '../entities/article.entity';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
    let service: ArticleService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ArticleRepository": MockedObject,
        "FileService": MockedObject,
        "ArticlePhotoRepository": MockedObject,
        "EntityManager": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ArticleRepository": {},
            "FileService": {},
            "ArticlePhotoRepository": {},
            "EntityManager": {}
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

    test('getArticlesList()', async () => {
        dependencies["ArticleRepository"].find = jest.fn().mockResolvedValueOnce([{
            "id": 1111
        }]);
        service.getPhotosByArticleID = jest.fn().mockResolvedValueOnce([{
            id: 1,
            fileName: 'test.jpg'
        }]);
        const data = await service.getArticlesList(50, 100);
        expect(dependencies["ArticleRepository"].find).toBeCalledWith({
            take: 50,
            skip: 100,
            select: ['id', 'title', 'summary', 'url', 'createdDate'],
        });
        expect(service.getPhotosByArticleID).toBeCalledWith(1111, true);
        expect(data).toEqual([{
            "id": 1111,
            coverPhoto: {
                id: 1,
                fileName: 'test.jpg'
            }
        }]);
    });

    test('getPhotosByArticleID() - Cover', async () => {
        dependencies["ArticlePhotoRepository"].find = jest.fn().mockResolvedValueOnce([{
            id: 1,
            fileName: 'test.jpg'
        }]);
        const data1 = await service.getPhotosByArticleID(2222, true);
        expect(dependencies["ArticlePhotoRepository"].find).toBeCalledWith({
            where: {
                article: {
                    id: 2222
                },
                isCover: true,
            },
            select: ['id', 'fileName']
        });
        expect(data1).toEqual([{
            id: 1,
            fileName: 'test.jpg'
        }]);
    });

    test('getPhotosByArticleID() - Not Cover', async () => {
        dependencies["ArticlePhotoRepository"].find = jest.fn().mockResolvedValueOnce([{
            id: 1,
            fileName: 'test.jpg'
        }]);
        const data1 = await service.getPhotosByArticleID(2222, false);
        expect(dependencies["ArticlePhotoRepository"].find).toBeCalledWith({
            where: {
                article: {
                    id: 2222
                },
                isCover: false,
            },
            select: ['id', 'fileName']
        });
        expect(data1).toEqual([{
            id: 1,
            fileName: 'test.jpg'
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

    test('updateArticlePhoto()', async () => {
        dependencies["ArticlePhotoRepository"].update = jest.fn();
        await service.updateArticlePhoto(3333, true);
        expect(dependencies["ArticlePhotoRepository"].update).toBeCalledWith({ id: 3333 }, { isCover: true });
    });

    test('updateItem()', async () => {
        dependencies["ArticleRepository"].update = jest.fn();
        await service.updateArticle(3333, "ab", "bc", "cd");
        expect(dependencies["ArticleRepository"].update).toBeCalledWith({ id: 3333 }, { title: "ab", summary: "bc", url: "cd" });
    });

    test('addPhotoToArticle()', async () => {
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("1.jpg");
        dependencies["ArticlePhotoRepository"].save = jest.fn();
        await service.addPhotoToArticle(3333, "filetoken");
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("filetoken");
        const photo = new ArticlePhoto();
        photo.article = { id: 3333 } as any;
        photo.fileName = "1.jpg";
        expect(dependencies["ArticlePhotoRepository"].save).toBeCalledWith(photo);
    });

    test('deletePhoto() - Without Transaction', async () => {
        dependencies["EntityManager"].softDelete = jest.fn();
        await service.deletePhoto(3333, undefined);
        expect(dependencies["EntityManager"].softDelete).toBeCalledWith(ArticlePhoto, { id: 3333 });
    });

    test('deletePhoto() - With Transaction', async () => {
        const manager = {
            softDelete: jest.fn()
        };
        await service.deletePhoto(3333, manager as any);
        expect(manager.softDelete).toBeCalledWith(ArticlePhoto, { id: 3333 });
    });

    test('deleteArticle()', async () => {
        const manager = {
            findOne: jest.fn().mockResolvedValue({ likeableEntityID: 111 }),
            softDelete: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        await service.deleteArticle(3333);
        expect(manager.softDelete.mock.calls).toEqual([
            [ArticlePhoto, { article: { id: 3333 } }],
            [Article, { id: 3333 }],
        ]);
    });

    test('createArticle()', async () => {
        const manager = {
            save: jest.fn().mockResolvedValueOnce({ id: 222 })
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        const data = await service.createArticle("abcd", "uiuiu", "dfdf");
        const article = new Article();
        article.title = "abcd";
        article.summary = "uiuiu";
        article.url = "dfdf";
        expect(manager.save).toBeCalledWith(article);
        expect(data).toEqual(222);
    });

    test('isArticlePhotoExists() - Exist', async () => {
        dependencies["ArticlePhotoRepository"].count = jest.fn();
        dependencies["ArticlePhotoRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isArticlePhotoExists(2222);
        expect(dependencies["ArticlePhotoRepository"].count).toBeCalledWith({ id: 2222 });
        expect(data1).toBe(true);
    });

    test('isArticlePhotoExists() - Not Exist', async () => {
        dependencies["ArticlePhotoRepository"].count = jest.fn();
        dependencies["ArticlePhotoRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isArticlePhotoExists(3333);
        expect(dependencies["ArticlePhotoRepository"].count).toBeCalledWith({ id: 3333 });
        expect(data1).toBe(false);
    });
});
