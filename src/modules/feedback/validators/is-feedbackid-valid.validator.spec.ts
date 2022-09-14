import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsFeedbackIDValidValidator } from './is-feedbackid-valid.validator';

describe('IsFeedbackIDValidValidator', () => {
    let validator: IsFeedbackIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "FeedbackService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "FeedbackService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsFeedbackIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsFeedbackIDValidValidator>(IsFeedbackIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - FeedbackID is valid and exists', async () => {
        dependencies["FeedbackService"].isFeedbackExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["FeedbackService"].isFeedbackExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - FeedbackID is valid and not exists', async () => {
        dependencies["FeedbackService"].isFeedbackExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["FeedbackService"].isFeedbackExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - FeedbackID is not valid', async () => {
        dependencies["FeedbackService"].isFeedbackExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["FeedbackService"].isFeedbackExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - FeedbackID is NaN', async () => {
        dependencies["FeedbackService"].isFeedbackExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN);
        expect(dependencies["FeedbackService"].isFeedbackExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('FeedbackID is not valid or not exists!');
    });
});
