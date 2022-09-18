import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { LoginService } from './login.service';

describe('LoginService', () => {
    let service: LoginService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "UserService": MockedObject,
        "JwtHelperService": MockedObject,
        "MiniprogramService": MockedObject,
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "UserService": {},
            "JwtHelperService": {},
            "MiniprogramService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoginService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<LoginService>(LoginService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('loginByMiniProgramCode()', async () => {
        const user = {
            role: 1,
            nickName: "企鹅鹅",
            avatarFileName: "1234.jpg",
            id: 10,
            points: 500
        };
        const unionData = {
            openID: "888rgthnuer",
            unionID: "yuyu_123",
            sessionKey: "BDU:::"
        };
        dependencies["UserService"].updateLoginDateToNow = jest.fn();
        dependencies["UserService"].getOrCreateUserByUnionIDOrOpenID = jest.fn().mockReturnValue(user);
        dependencies["MiniprogramService"].getIDsAndSessionKeyByCode = jest.fn().mockReturnValue(unionData);
        dependencies["JwtHelperService"].getJWTPayloadForMiniProgram = jest.fn().mockReturnValue("jjjhhhhuuuu");
        const data = await service.loginByMiniProgramCode("abcd");
        expect(dependencies["MiniprogramService"].getIDsAndSessionKeyByCode).toBeCalledWith("abcd");
        expect(dependencies["UserService"].getOrCreateUserByUnionIDOrOpenID).toBeCalledWith(unionData.unionID, unionData.openID);
        expect(dependencies["UserService"].updateLoginDateToNow).toBeCalledWith(user.id);
        expect(dependencies["JwtHelperService"].getJWTPayloadForMiniProgram).toBeCalledWith(user, unionData.sessionKey);
        expect(data).toEqual({
            role: user.role,
            nickName: user.nickName,
            avatarFileName: user.avatarFileName,
            id: user.id,
            points: user.points,
            token: "jjjhhhhuuuu",
        });
    });
});
