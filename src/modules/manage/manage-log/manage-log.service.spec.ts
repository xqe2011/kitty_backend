import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ManageLogType } from '../enums/manage-log-type.enum';
import { ManageLogService } from './manage-log.service';

describe('ManageLogService', () => {
    let service: ManageLogService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ManageLogRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ManageLogRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [ManageLogService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<ManageLogService>(ManageLogService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test("writeLog()", async () => {
        dependencies["ManageLogRepository"].insert = jest.fn();
        await service.writeLog(1, ManageLogType.CANCEL_ORDER, {"test": 1});
        expect(dependencies["ManageLogRepository"].insert).toBeCalledWith({
            userID: 1,
            message: {"test": 1},
            type: ManageLogType.CANCEL_ORDER
        });
    });
});
