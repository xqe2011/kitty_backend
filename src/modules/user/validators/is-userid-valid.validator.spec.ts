import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsUserIDValidValidator } from './is-userid-valid.validator';

describe('IsUserIDValidValidator', () => {
    let validator: IsUserIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "UsersService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "UsersService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsUserIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsUserIDValidValidator>(IsUserIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - UserID is valid and exists', async () => {
        dependencies["UsersService"].isUserExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["UsersService"].isUserExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - UserID is valid and not exists', async () => {
        dependencies["UsersService"].isUserExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["UsersService"].isUserExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - UserID is not valid.', async () => {
        dependencies["UsersService"].isUserExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["UsersService"].isUserExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('UserID is not valid or not exists!');
    });
});
