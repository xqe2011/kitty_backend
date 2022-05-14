import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsPhotoIDValidValidator } from './is-photoid-valid.validator';

describe('IsPhotoIDValidValidator', () => {
    let validator: IsPhotoIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "PhotoService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "PhotoService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsPhotoIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsPhotoIDValidValidator>(IsPhotoIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - PhotoID is valid and exists', async () => {
        dependencies["PhotoService"].isPhotoExists = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571);
        expect(dependencies["PhotoService"].isPhotoExists).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - PhotoID is valid and not exists', async () => {
        dependencies["PhotoService"].isPhotoExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3572);
        expect(dependencies["PhotoService"].isPhotoExists).toBeCalledWith(3572);
        expect(data1).toBe(false);
    });

    test('validate() - PhotoID is not valid.', async () => {
        dependencies["PhotoService"].isPhotoExists = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("effgdfgh");
        expect(dependencies["PhotoService"].isPhotoExists).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('PhotoID is not valid or not exists!');
    });
});
