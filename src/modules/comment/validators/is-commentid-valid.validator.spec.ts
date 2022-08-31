import { Test, TestingModule } from '@nestjs/testing';
import { ValidationArguments } from 'class-validator';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsCommentIDValidValidator } from './is-commentid-valid.validator';

describe('IsCommentIDValidValidator', () => {
    let validator: IsCommentIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CommentService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CommentService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsCommentIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsCommentIDValidValidator>(IsCommentIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - CommentID is valid and exists, dont check root comment', async () => {
        dependencies["CommentService"].isCommentRoot = jest.fn();
        dependencies["CommentService"].isCommentExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571, { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentService"].isCommentExists).toBeCalledWith(3571);
        expect(dependencies["CommentService"].isCommentRoot).toBeCalledTimes(0);
        expect(data1).toBe(true);
    });

    test('validate() - CommentID is valid and exists, check root comment', async () => {
        dependencies["CommentService"].isCommentExists = jest.fn();
        dependencies["CommentService"].isCommentRoot = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571, { constraints: [true] } as ValidationArguments);
        expect(dependencies["CommentService"].isCommentExists).toBeCalledTimes(0);
        expect(dependencies["CommentService"].isCommentRoot).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - CommentID is valid and not exists, dont check root comment', async () => {
        dependencies["CommentService"].isCommentRoot = jest.fn();
        dependencies["CommentService"].isCommentExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572, { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentService"].isCommentExists).toBeCalledWith(3572);
        expect(dependencies["CommentService"].isCommentRoot).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - CommentID is not valid, dont check root comment', async () => {
        dependencies["CommentService"].isCommentRoot = jest.fn();
        dependencies["CommentService"].isCommentExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh", { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentService"].isCommentExists).toBeCalledTimes(0);
        expect(dependencies["CommentService"].isCommentRoot).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('validate() - CommentID is NaN, dont check root comment', async () => {
        dependencies["CommentService"].isCommentRoot = jest.fn();
        dependencies["CommentService"].isCommentExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(NaN, { constraints: [false] } as ValidationArguments);
        expect(dependencies["CommentService"].isCommentExists).toBeCalledTimes(0);
        expect(dependencies["CommentService"].isCommentRoot).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('CommentID is not valid or not exists or not root comment!');
    });
});
