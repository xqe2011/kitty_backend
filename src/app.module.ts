import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { UserModule } from './modules/user/user.module';
import { ValidationPipe } from './validate.pipe';
import { ArticleModule } from './modules/article/article.module';
import { CatModule } from './modules/cat/cat.module';
import { FileModule } from './modules/file/file.module';
import { AuthModule } from './modules/auth/auth.module';
import { ToolModule } from './modules/tool/tool.module';
import { UserLogModule } from './modules/user-log/user-log.module';
import { WechatModule } from './modules/wechat/wechat.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ShopModule } from './modules/shop/shop.module';
import { CommentModule } from './modules/comment/comment.module';
import { ManageModule } from './modules/manage/manage.module';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mariadb',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port', 3306),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.name'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                logging: !!configService.get<boolean>('debug', false),
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        UserModule,
        ArticleModule,
        CatModule,
        FileModule,
        AuthModule,
        ToolModule,
        UserLogModule,
        WechatModule,
        FeedbackModule,
        ShopModule,
        CommentModule,
        ManageModule
    ],
    controllers: [],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
    exports: [ConfigModule, AuthModule, FileModule],
})
export class AppModule {}
