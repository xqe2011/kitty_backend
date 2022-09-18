import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { CatPhoto } from '../entities/cat-photo.entity';
import { CatPhotoType } from '../enums/cat-photo-type.enum';
import { PhotoService } from './photo.service';

describe('PhotoService', () => {
    let service: PhotoService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatPhotoRepository": MockedObject,
        "FileService": MockedObject,
        "SettingService": MockedObject,
        "EntityManager": MockedObject,
        "CommentsAreaService": MockedObject,
        "LikeableEntityService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatPhotoRepository": {},
            "FileService": {},
            "SettingService": {},
            "EntityManager": {},
            "CommentsAreaService": {},
            "LikeableEntityService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [PhotoService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<PhotoService>(PhotoService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap() - "cats.photo.censor" Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('cats.photo.censor');
    });

    test('onApplicationBootstrap() - "cats.photo.censor" Not Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce("");
        dependencies["SettingService"].createSetting = jest.fn();
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('cats.photo.censor');
        expect(dependencies["SettingService"].createSetting).toBeCalledWith("cats.photo.censor", true, true);
    });

    test('createUserPhoto() - File exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(1);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        try {
            await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是BUG,我现在很慌[狗头]", undefined, undefined, undefined, undefined);
        } catch(e) {
            expect(e).toBeInstanceOf(ConflictException);
        }
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["SettingService"].getSetting).toBeCalledTimes(0);
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
    });

    test('createUserPhoto() - File not exists and dont provide gps information', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(0);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        const manager = {
            insert: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["CommentsAreaService"].createArea = jest.fn().mockResolvedValueOnce(9999);
        dependencies["LikeableEntityService"].createEntity = jest.fn().mockResolvedValueOnce(888);
        await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是BUG,我现在很慌[狗头]", undefined, undefined, undefined, undefined);
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(dependencies["CommentsAreaService"].createArea).toBeCalledWith(manager);
        expect(dependencies["LikeableEntityService"].createEntity).toBeCalledWith(false, manager);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("cats.photo.censor");
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
        expect(manager.insert).toBeCalledWith(CatPhoto, {
            type: CatPhotoType.PEDNING,
            user: {
                id: 2222,
            },
            cat: {
                id: 3333,
            },
            commentsAreaID: 9999,
            likeableEntityID: 888,
            comment: "我是BUG,我现在很慌[狗头]",
            rawFileName: "123.jpg",
            fileName: "123.jpg",
            compassAngle: undefined,
            positionAccuration: undefined,
            position: undefined,
        })
    });


    test('createUserPhoto() - File not exists and provide gps information', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(0);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        const manager = {
            insert: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["CommentsAreaService"].createArea = jest.fn().mockResolvedValueOnce(9999);
        dependencies["LikeableEntityService"].createEntity = jest.fn().mockResolvedValueOnce(888);
        await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是BUG,我现在很慌[狗头]", 30.33, 22.902683, 113.87516, 3);
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(dependencies["CommentsAreaService"].createArea).toBeCalledWith(manager);
        expect(dependencies["LikeableEntityService"].createEntity).toBeCalledWith(false, manager);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("cats.photo.censor");
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
        expect(manager.insert).toBeCalledWith(CatPhoto, {
            type: CatPhotoType.PEDNING,
            user: {
                id: 2222,
            },
            cat: {
                id: 3333,
            },
            commentsAreaID: 9999,
            likeableEntityID: 888,
            comment: "我是BUG,我现在很慌[狗头]",
            rawFileName: "123.jpg",
            fileName: "123.jpg",
            compassAngle: 30.33,
            positionAccuration: 3,
            position: "POINT(113.87516 22.902683)",
        })
    });

    test('createUserPhoto() - FileName not provide', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(0);
        dependencies["FileService"].getFileNameByToken = jest.fn();
        const manager = {
            insert: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["CommentsAreaService"].createArea = jest.fn().mockResolvedValueOnce(9999);
        dependencies["LikeableEntityService"].createEntity = jest.fn().mockResolvedValueOnce(888);
        await service.createUserPhoto(2222, 3333, null, "我是BUG,我现在很慌[狗头]", 30.33, 22.902683, 113.87516, 3);
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(dependencies["CommentsAreaService"].createArea).toBeCalledWith(manager);
        expect(dependencies["LikeableEntityService"].createEntity).toBeCalledWith(false, manager);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledTimes(0);
        expect(dependencies["CatPhotoRepository"].count).toBeCalledTimes(0);
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("cats.photo.censor");
        expect(manager.insert).toBeCalledWith(CatPhoto, {
            type: CatPhotoType.PEDNING,
            user: {
                id: 2222,
            },
            cat: {
                id: 3333,
            },
            commentsAreaID: 9999,
            likeableEntityID: 888,
            comment: "我是BUG,我现在很慌[狗头]",
            rawFileName: undefined,
            fileName: undefined,
            compassAngle: 30.33,
            positionAccuration: 3,
            position: "POINT(113.87516 22.902683)",
        })
    });

    test('createUserPhoto() - Censor Disable', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(false);
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(0);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        const manager = {
            insert: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["CommentsAreaService"].createArea = jest.fn().mockResolvedValueOnce(9999);
        dependencies["LikeableEntityService"].createEntity = jest.fn().mockResolvedValueOnce(888);
        await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是BUG,我现在很慌[狗头]", undefined, undefined, undefined, undefined);
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(dependencies["CommentsAreaService"].createArea).toBeCalledWith(manager);
        expect(dependencies["LikeableEntityService"].createEntity).toBeCalledWith(false, manager);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("cats.photo.censor");
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
        expect(manager.insert).toBeCalledWith(CatPhoto, {
            type: CatPhotoType.OTHERS,
            user: {
                id: 2222,
            },
            cat: {
                id: 3333,
            },
            commentsAreaID: 9999,
            likeableEntityID: 888,
            comment: "我是BUG,我现在很慌[狗头]",
            rawFileName: "123.jpg",
            fileName: "123.jpg",
            compassAngle: undefined,
            positionAccuration: undefined,
            position: undefined,
        })
    });

    test('isPhotoExists() - Exist', async () => {
        dependencies["CatPhotoRepository"].count = jest.fn();
        dependencies["CatPhotoRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isPhotoExists(2222);
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            where: {
                id: 2222,
            }
        });
        expect(data1).toBe(true);
    });

    test('isPhotoExists() - Not Exist', async () => {
        dependencies["CatPhotoRepository"].count = jest.fn();
        dependencies["CatPhotoRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isPhotoExists(3333);
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            where: {
                id: 3333,
            }
        });
        expect(data1).toBe(false);
    });

    test('getPhotosByCatIDAndType()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            orderBy: jest.fn(),
            getRawMany: jest.fn().mockReturnValue([{id: 111, name: "你好", description: "desc", fileName: "1.jpg"}])
        };
        dependencies["CatPhotoRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getPhotosByCatIDAndType(2222, CatPhotoType.OTHERS, 100, 0);
        expect(dependencies["CatPhotoRepository"].createQueryBuilder).toBeCalledWith('photo');
        expect(createQueryBuilder.andWhere).toBeCalledWith({
            cat: {
                id: 2222
            },
            type: CatPhotoType.OTHERS
        });
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'rawFileName', 'fileName', 'comment', 'createdDate', 'userId as userID', 'commentsAreaID', 'likeableEntityID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(createQueryBuilder.take).toBeCalledWith(100);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.orderBy).toBeCalledWith("createdDate", "DESC");
        expect(data1).toEqual([{id: 111, name: "你好", description: "desc", fileName: "1.jpg"}]);
    });

    test('getPhotos()', async () => {
        const createQueryBuilder = {
            select: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            orderBy: jest.fn(),
            getRawMany: jest.fn().mockReturnValue([{id: 111, name: "你好", description: "desc", fileName: "1.jpg", type: CatPhotoType.PEDNING}])
        };
        dependencies["CatPhotoRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getPhotos(10, 0);
        expect(dependencies["CatPhotoRepository"].createQueryBuilder).toBeCalledWith('photo');
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'rawFileName', 'fileName', 'comment', 'createdDate', 'userId as userID', 'type', 'commentsAreaID', 'likeableEntityID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.orderBy).toBeCalledWith("createdDate", "DESC");
        expect(data1).toEqual([{id: 111, name: "你好", description: "desc", fileName: "1.jpg", type: CatPhotoType.PEDNING}]);
    });

    test('updatePhotoInfo()', async () => {
        dependencies["CatPhotoRepository"].update = jest.fn();
        await service.updatePhotoInfo(1, CatPhotoType.COVER);
        expect(dependencies["CatPhotoRepository"].update).toBeCalledWith(
            1,
            {
                type: CatPhotoType.COVER
            }
        );
    });

    test('deletePhoto()', async () => {
        dependencies["CatPhotoRepository"].softDelete = jest.fn();
        await service.deletePhoto(1);
        expect(dependencies["CatPhotoRepository"].softDelete).toBeCalledWith(1);
    });
});
