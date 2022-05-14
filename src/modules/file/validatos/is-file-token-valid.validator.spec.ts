import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { FileType } from '../enums/file-type.enum';
import { IsFileTokenValidValidator } from './is-file-token-valid.validator';

describe('IsFileTokenValidValidator', () => {
    let validator: IsFileTokenValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "FileService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsFileTokenValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsFileTokenValidValidator>(IsFileTokenValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });

    test('validate() - FileToken is valid and filetype is valid', async () => {
        dependencies["FileService"].verifyFileToken = jest.fn().mockResolvedValueOnce(true);
        dependencies["FileService"].getFileTypeByToken = jest.fn().mockReturnValueOnce(FileType.UNCOMPRESSED_IMAGE);
        const data1 = await validator.validate("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", { constraints: [FileType.UNCOMPRESSED_IMAGE] } as any);
        expect(dependencies["FileService"].verifyFileToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["FileService"].getFileTypeByToken).toBeCalledWith("file|123.jpg|0|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(data1).toBe(true);
    });

    test('validate() - FileToken is valid and filetype is not valid.', async () => {
        dependencies["FileService"].verifyFileToken = jest.fn().mockResolvedValueOnce(true);
        dependencies["FileService"].getFileTypeByToken = jest.fn().mockReturnValueOnce(FileType.COMPRESSED_IMAGE);
        const data1 = await validator.validate("file|123.jpg|1|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=", { constraints: [FileType.UNCOMPRESSED_IMAGE] } as any);
        expect(dependencies["FileService"].verifyFileToken).toBeCalledWith("file|123.jpg|1|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(dependencies["FileService"].getFileTypeByToken).toBeCalledWith("file|123.jpg|1|1652246384|+4V93CrK/KenKg5xQYh/FrxoaJ3+tEt48ULPemcFvoA=");
        expect(data1).toBe(false);
    });

    test('validate() - FileToken is not valid.', async () => {
        dependencies["FileService"].verifyFileToken = jest.fn().mockResolvedValueOnce(false);
        dependencies["FileService"].getFileTypeByToken = jest.fn().mockReturnValueOnce(FileType.UNCOMPRESSED_IMAGE);
        const data1 = await validator.validate("file|123.jpg", { constraints: [FileType.UNCOMPRESSED_IMAGE] } as any);
        expect(dependencies["FileService"].verifyFileToken).toBeCalledWith("file|123.jpg");
        expect(dependencies["FileService"].getFileTypeByToken).toBeCalledTimes(0);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('File Token is not valid!');
    });
});
