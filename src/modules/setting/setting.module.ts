import { Module } from '@nestjs/common';
import { SettingService } from './setting/setting.service';
import { SettingController } from './setting/setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Setting])],
    providers: [SettingService],
    controllers: [SettingController],
    exports: [SettingService],
})
export class SettingModule {}
