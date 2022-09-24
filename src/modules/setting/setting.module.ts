import { Module } from '@nestjs/common';
import { SettingService } from './setting/setting.service';
import { SettingController } from './setting/setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { IsSettingKeyValidValidator } from './validators/is-setting-key-valid.validator';

@Module({
    imports: [TypeOrmModule.forFeature([Setting])],
    providers: [SettingService, IsSettingKeyValidValidator],
    controllers: [SettingController],
    exports: [SettingService],
})
export class SettingModule {}
