import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatModule } from '../cat/cat.module';
import { CommentModule } from '../comment/comment.module';
import { SettingModule } from '../setting/setting.module';
import { Report } from './entities/report.entity';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';
import { IsEntityIDValidValidator } from './validators/is-entityid-valid.validator';

@Module({
    imports: [
        SettingModule,
        CommentModule,
        CatModule,
        TypeOrmModule.forFeature([
            Report
        ]),
    ],
    providers: [ReportService, IsEntityIDValidValidator],
    controllers: [ReportController],
    exports: [ReportService]
})
export class ReportModule { }
