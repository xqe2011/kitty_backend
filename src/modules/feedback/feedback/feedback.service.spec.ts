import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { FeedbackType } from '../enums/feedback-type.enum';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
    let service: FeedbackService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: {
        "FeedbackRepository": MockedObject,
        "FeedbackPhotoRepository": MockedObject,
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "FeedbackRepository": {},
            "FeedbackPhotoRepository": {},
            "FileService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [FeedbackService],
        })
            .useMocker(createMocker(dependencies))
            .compile();

        service = module.get<FeedbackService>(FeedbackService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test("createFeedback()", async () => {
        dependencies["FeedbackRepository"].save = jest.fn().mockResolvedValueOnce({ id: 8123 });
        dependencies["FeedbackPhotoRepository"].insert = jest.fn();
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValueOnce("heeeello.jpg");
        await service.createFeedback(FeedbackType.CAT, 888, 999, "abcd", ["token1"]);
        expect(dependencies["FeedbackRepository"].save).toBeCalledWith({
            type: FeedbackType.CAT,
            cat: {
                id: 888
            },
            user: {
                id: 999
            },
            content: "abcd"
        });
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("token1");
        expect(dependencies["FeedbackPhotoRepository"].insert).toBeCalledWith({
            feedback: {
                id: 8123
            },
            fileName: "heeeello.jpg"
        });
    });
});
