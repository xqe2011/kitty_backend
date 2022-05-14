import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { LocalService } from './local/local.service';
import { QiniuService } from './qiniu/qiniu.service';
import { fileFilterMulter } from './multer-options/file-filter.multer';
import { LocalController } from './local/local.controller';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { IsUploadTokenValidValidator } from './validatos/is-upload-token-valid.validator';
import { ToolModule } from 'src/modules/tool/tool.module';
import { IsFileTokenValidValidator } from './validatos/is-file-token-valid.validator';
import { QiniuController } from './qiniu/qiniu.controller';
import { SettingModule } from '../setting/setting.module';

@Module({
    imports: [
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                dest: configService.get<string>(
                    'files.providers.local.upload.tmp_path',
                    '../tmp',
                ),
                fileFilter: fileFilterMulter(configService),
            }),
            inject: [ConfigService],
        }),
        ToolModule,
        SettingModule,
    ],
    providers: [
        LocalService,
        QiniuService,
        FileService,
        IsUploadTokenValidValidator,
        IsFileTokenValidValidator,
    ],
    exports: [FileService],
    controllers: [LocalController, FileController, QiniuController],
})
export class FileModule {}
