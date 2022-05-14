import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { UserLogType } from '../enums/user-log-type.enum';
import { UserLogService } from './user-log.service';

describe('UserLogService', () => {
    let service: UserLogService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "UserLogRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "UserLogRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserLogService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<UserLogService>(UserLogService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test("writeLog()", async () => {
        const date = new Date();
        dependencies["UserLogRepository"].insert = jest.fn();
        await service.writeLog(1, UserLogType.LOGIN, {"test": 1}, date);
        expect(dependencies["UserLogRepository"].insert).toBeCalledWith({
            user: {
                id: 1,
            },
            message: {"test": 1},
            type: UserLogType.LOGIN,
            createdDate: date,
        });
    });
});
