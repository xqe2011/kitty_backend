import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { Role } from '../enums/role.enum';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "UserRepository": MockedObject,
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "FileService": {},
            "UserRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<UsersService>(UsersService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('isUserExists() - Exists', async () => {
        dependencies["UserRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isUserExists(2222);
        expect(dependencies["UserRepository"].count).toBeCalledWith({ id: 2222 });
        expect(data1).toBe(true);
    });

    test('isUserExists() - Not Exists', async () => {
        dependencies["UserRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isUserExists(2222);
        expect(dependencies["UserRepository"].count).toBeCalledWith({ id: 2222 });
        expect(data1).toBe(false);
    });

    test('getUserInfoByID() - Details', async () => {
        service.getUserByID = jest.fn().mockResolvedValueOnce({role: Role.Admin, nickName: "dgs", avatarFileName: "dgnfs.jpg", id: 2222, points: 10, createdDate: 1, lastLoginDate: 2});
        const data1 = await service.getUserInfoByID(2222, true);
        expect(service.getUserByID).toBeCalledWith(2222);
        expect(data1).toEqual({role: Role.Admin, nickName: "dgs", avatarFileName: "dgnfs.jpg", id: 2222, points: 10, createdDate: 1, lastLoginDate: 2});
    });

    test('getUserInfoByID() - Not Details', async () => {
        service.getUserByID = jest.fn().mockResolvedValueOnce({role: Role.Admin, nickName: "dgs", avatarFileName: "dgnfs.jpg", id: 2222, points: 10});
        const data1 = await service.getUserInfoByID(2222, false);
        expect(service.getUserByID).toBeCalledWith(2222);
        expect(data1).toEqual({nickName: "dgs", avatarFileName: "dgnfs.jpg", id: 2222});
    });

    test('getUserByID()', async () => {
        dependencies["UserRepository"].findOne = jest.fn().mockResolvedValueOnce({"aaa": "bbb"});
        const data1 = await service.getUserByID(2222);
        expect(dependencies["UserRepository"].findOne).toBeCalledWith(2222);
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('getUserByUnionID()', async () => {
        dependencies["UserRepository"].findOne = jest.fn().mockResolvedValueOnce({"aaa": "bbb"});
        const data1 = await service.getUserByUnionID("ababac");
        expect(dependencies["UserRepository"].findOne).toBeCalledWith({ unionID: "ababac" });
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('getUserByOpenID()', async () => {
        dependencies["UserRepository"].findOne = jest.fn().mockResolvedValueOnce({"aaa": "bbb"});
        const data1 = await service.getUserByOpenID("abcd");
        expect(dependencies["UserRepository"].findOne).toBeCalledWith({ openID: "abcd" });
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('getOrCreateUserByUnionIDOrOpenID() - Create User by OpenID', async () => {
        service.getUserByOpenID = jest.fn().mockResolvedValueOnce(undefined);
        service.getUserByUnionID = jest.fn().mockResolvedValueOnce(undefined);
        dependencies["UserRepository"].save = jest.fn();
        const data1 = await service.getOrCreateUserByUnionIDOrOpenID("abcd", "bbcd");
        expect(dependencies["UserRepository"].save).toBeCalledWith(expect.objectContaining({
            unionID: "abcd",
            openID: "bbcd",
            lastLoginDate: expect.any(Date)
        }));
        expect(data1).toEqual(expect.objectContaining({
            unionID: "abcd",
            openID: "bbcd",
            lastLoginDate: expect.any(Date)
        }));
    });

    test('getOrCreateUserByUnionIDOrOpenID() - Get User by OpenID', async () => {
        service.getUserByOpenID = jest.fn().mockResolvedValueOnce({id: 5});
        service.getUserByUnionID = jest.fn().mockResolvedValueOnce(undefined);
        dependencies["UserRepository"].save = jest.fn();
        const data1 = await service.getOrCreateUserByUnionIDOrOpenID("abcd", "bbcd");
        expect(dependencies["UserRepository"].save).toBeCalledWith(expect.objectContaining({
            id: 5,
            unionID: "abcd",
            openID: "bbcd"
        }));
        expect(data1).toEqual(expect.objectContaining({
            id: 5,
            unionID: "abcd",
            openID: "bbcd"
        }));
    });

    test('getOrCreateUserByUnionIDOrOpenID() - Get User by UnionID', async () => {
        service.getUserByOpenID = jest.fn().mockResolvedValueOnce(undefined);
        service.getUserByUnionID = jest.fn().mockResolvedValueOnce({id: 5});
        dependencies["UserRepository"].save = jest.fn();
        const data1 = await service.getOrCreateUserByUnionIDOrOpenID("abcd", "bbcd");
        expect(dependencies["UserRepository"].save).toBeCalledWith(expect.objectContaining({
            id: 5,
            unionID: "abcd",
            openID: "bbcd"
        }));
        expect(data1).toEqual(expect.objectContaining({
            id: 5,
            unionID: "abcd",
            openID: "bbcd"
        }));
    });

    test('updateLoginDateToNow()', async () => {
        dependencies["UserRepository"].update = jest.fn().mockResolvedValueOnce(0);
        await service.updateLoginDateToNow(2222);
        expect(dependencies["UserRepository"].update).toBeCalledWith(2222, { lastLoginDate: expect.any(Date) });
    });

    test('updateUserinfoAndRole()- Normal User', async () => {
        service.getUserByID = jest.fn().mockResolvedValueOnce({role: Role.NormalUser});
        dependencies["UserRepository"].save = jest.fn();
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValueOnce("aaa.jpg");
        const data1 = await service.updateUserinfoAndRole(2222, "gfgdf", "ababc");
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("ababc");
        expect(dependencies["UserRepository"].save).toBeCalledWith({
            nickName: "gfgdf",
            avatarFileName: "aaa.jpg",
            role: Role.RegisteredUser
        });
        expect(data1).toEqual(true);
    });

    test('updateUserinfoAndRole()- User not exists', async () => {
        service.getUserByID = jest.fn().mockResolvedValueOnce(undefined);
        dependencies["UserRepository"].save = jest.fn();
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValueOnce("aaa.jpg");
        const data1 = await service.updateUserinfoAndRole(2222, "gfgdf", "ababc");
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledTimes(0);
        expect(dependencies["UserRepository"].save).toBeCalledTimes(0);
        expect(data1).toEqual(false);
    });

    test('updateUserinfoAndRole()- Registered User', async () => {
        service.getUserByID = jest.fn().mockResolvedValueOnce({role: Role.RegisteredUser});
        dependencies["UserRepository"].save = jest.fn();
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValueOnce("aaa.jpg");
        const data1 = await service.updateUserinfoAndRole(2222, "gfgdf", "ababc");
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("ababc");
        expect(dependencies["UserRepository"].save).toBeCalledWith({
            nickName: "gfgdf",
            avatarFileName: "aaa.jpg",
            role: Role.RegisteredUser
        });
        expect(data1).toEqual(true);
    });
});
