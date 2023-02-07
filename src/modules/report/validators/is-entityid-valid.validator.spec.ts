import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ReportEntityType } from '../enums/report-entity-type.enum';
import { IsEntityIDValidValidator } from './is-entityid-valid.validator';

describe('IsEntityIDValidValidator', () => {
    let validator: IsEntityIDValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "IsCommentIDValidValidator": MockedObject,
        "IsPhotoIDValidValidator": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "IsCommentIDValidValidator": {},
            "IsPhotoIDValidValidator": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsEntityIDValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsEntityIDValidValidator>(IsEntityIDValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - EntityID is valid and exists, EntityType is Comments', async () => {
        dependencies["IsCommentIDValidValidator"].validate = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571, { object: { entityType: ReportEntityType.COMMENTS } } as any);
        expect(dependencies["IsCommentIDValidValidator"].validate).toBeCalledWith(3571, { constraints: [false] });
        expect(data1).toBe(true);
    });

    test('validate() - EntityID is valid and exists, EntityType is CatPhotos', async () => {
        dependencies["IsPhotoIDValidValidator"].validate = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate(3571, { object: { entityType: ReportEntityType.CAT_PHOTOS } } as any);
        expect(dependencies["IsPhotoIDValidValidator"].validate).toBeCalledWith(3571);
        expect(data1).toBe(true);
    });

    test('validate() - EntityID is valid and not exists', async () => {
        dependencies["IsCommentIDValidValidator"].validate = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(3571, { object: { entityType: ReportEntityType.COMMENTS } } as any);
        expect(dependencies["IsCommentIDValidValidator"].validate).toBeCalledWith(3571, { constraints: [false] });
        expect(data1).toBe(false);
    });

    test('validate() - ReportID is not valid', async () => {
        const data1 = await validator.validate("effgdfgh", undefined);
        expect(data1).toBe(false);
    });

    test('validate() - ReportID is NaN', async () => {
        const data1 = await validator.validate(NaN, undefined);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('EntityID is not valid or not exists!');
    });
});
