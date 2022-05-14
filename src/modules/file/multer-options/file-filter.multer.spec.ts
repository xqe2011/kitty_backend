import { ForbiddenException } from '@nestjs/common';
import { MockedObject } from 'test/utils/mocked-object';
import { fileFilterMulter } from './file-filter.multer';

describe('FileFilterMulter', () => {
    let multer: typeof fileFilterMulter;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject
    };

    beforeEach(async () => {
        dependencies = {
            "ConfigService": {},
        };

        multer = fileFilterMulter;

        /* 清除SpyOn */
        jest.clearAllMocks();
    });

    test('should be defined', () => {
        expect(multer).toBeDefined();
    });

    test('fileFilterMulter() - Valid Filename and mimetype', async () => {
        dependencies["ConfigService"].get = jest.fn().mockReturnValue(52428800);
        const cb = jest.fn();
        multer(dependencies["ConfigService"] as any)(null, {
            originalname: "123.jpg",
            size: 52428800,
            mimetype: 'image/jpeg'
        } as any, cb);
        expect(dependencies["ConfigService"].get).toBeCalledWith('files.providers.local.upload.max_size', '52428800');
        expect(cb).toBeCalledWith(null, true);
    });

    test('fileFilterMulter() - Invalid Filename and mimetype', async () => {
        dependencies["ConfigService"].get = jest.fn().mockReturnValue(52428800);
        const cb = jest.fn();
        multer(dependencies["ConfigService"] as any)(null, {
            originalname: "123.php",
            size: 52428800,
            mimetype: 'php'
        } as any, cb);
        expect(dependencies["ConfigService"].get).toBeCalledTimes(0);
        expect(cb).toBeCalledWith(new ForbiddenException('This file type is not allowed to upload!'), false);
    });

    test('fileFilterMulter() - File Too Large', async () => {
        dependencies["ConfigService"].get = jest.fn().mockReturnValue(52428800);
        const cb = jest.fn();
        multer(dependencies["ConfigService"] as any)(null, {
            originalname: "123.jpg",
            size: 524288000,
            mimetype: 'image/jpeg'
        } as any, cb);
        expect(dependencies["ConfigService"].get).toBeCalledWith('files.providers.local.upload.max_size', '52428800');
        expect(cb).toBeCalledWith(new ForbiddenException('This file is too large!'), false);
    });
});
