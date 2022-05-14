import { Module } from '@nestjs/common';
import { MiniprogramService } from './miniprogram/miniprogram.service';
import { HttpClientService } from './http-client/http-client.service';
import { SettingModule } from '../setting/setting.module';
import { ToolModule } from '../tool/tool.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        SettingModule,
        ToolModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature(),
    ],
    providers: [MiniprogramService, HttpClientService],
    exports: [MiniprogramService],
})
export class WechatModule {}
