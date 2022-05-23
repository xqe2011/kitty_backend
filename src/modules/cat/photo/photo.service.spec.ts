import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { CatPhotoType } from '../enums/cat-photo-type.enum';
import { PhotoService } from './photo.service';

describe('PhotoService', () => {
    let service: PhotoService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatPhotoRepository": MockedObject,
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatPhotoRepository": {},
            "FileService": {}
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

    test('createUserPhoto() - File exists', async () => {
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(1);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        try {
            await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是嘉狸,我现在很慌[狗头]", undefined, undefined, undefined, undefined);
        } catch(e) {
            expect(e).toBeInstanceOf(ConflictException);
        }
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
    });

    test('createUserPhoto() - File not exists and dont provide gps information', async () => {
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(0);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        dependencies["CatPhotoRepository"].insert = jest.fn().mockResolvedValue(1);
        await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是嘉狸,我现在很慌[狗头]", undefined, undefined, undefined, undefined);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
        expect(dependencies["CatPhotoRepository"].insert).toBeCalledWith({
            user: {
                id: 2222,
            },
            cat: {
                id: 3333,
            },
            comment: "我是嘉狸,我现在很慌[狗头]",
            rawFileName: "123.jpg",
            compassAngle: undefined,
            positionAccuration: undefined,
            position: undefined,
        })
    });


    test('createUserPhoto() - File not exists and provide gps information', async () => {
        dependencies["CatPhotoRepository"].count = jest.fn().mockResolvedValue(0);
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("123.jpg");
        dependencies["CatPhotoRepository"].insert = jest.fn().mockResolvedValue(1);
        await service.createUserPhoto(2222, 3333, "file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", "我是嘉狸,我现在很慌[狗头]", 30.33, 22.902683, 113.87516, 3);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["CatPhotoRepository"].count).toBeCalledWith({
            user: {
                id: 2222,
            },
            rawFileName: "123.jpg",
        });
        expect(dependencies["CatPhotoRepository"].insert).toBeCalledWith({
            user: {
                id: 2222,
            },
            cat: {
                id: 3333,
            },
            comment: "我是嘉狸,我现在很慌[狗头]",
            rawFileName: "123.jpg",
            compassAngle: 30.33,
            positionAccuration: 3,
            position: "POINT(113.87516 22.902683)",
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
            getRawMany: jest.fn().mockReturnValue([{id: 111, name: "你好", description: "desc", coverFileName: "1.jpg"}])
        };
        dependencies["CatPhotoRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getPhotosByCatIDAndType(2222, CatPhotoType.OTHERS);
        expect(dependencies["CatPhotoRepository"].createQueryBuilder).toBeCalledWith('photo');
        expect(createQueryBuilder.andWhere).toBeCalledWith({
            cat: {
                id: 2222
            },
            type: CatPhotoType.OTHERS
        });
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'rawFileName', 'fileName', 'comment', 'createdDate', 'userId as userID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, name: "你好", description: "desc", coverFileName: "1.jpg"}]);
    });
});
