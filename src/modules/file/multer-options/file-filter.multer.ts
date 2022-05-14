import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Multer文件上传模块的过滤器，返回过滤器函数
 * @param configService 配置服务
 */
export const fileFilterMulter = (configService: ConfigService) => {
    const fileFilterMulterFunc: MulterOptions['fileFilter'] = (req, file, callback) => {
        const allowMimeType = ['image/jpeg', 'image/png'];
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/) || !allowMimeType.includes(file.mimetype)) {
            return callback(new ForbiddenException('This file type is not allowed to upload!'), false);
        }
        if (file.size > parseInt(configService.get<string>('files.providers.local.upload.max_size', '52428800'))) {
            return callback(new ForbiddenException('This file is too large!'), false);
        }
        callback(null, true);
    };
    return fileFilterMulterFunc;
};
