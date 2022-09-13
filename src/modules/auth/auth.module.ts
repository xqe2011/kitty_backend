import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from './login/login.controller';
import { JwtHelperService } from '../auth/jwt-helper/jwt-helper.service';
import { JwtHelperStrategy } from '../auth/jwt-helper/jwt-helper.strategy';
import { UserModule } from 'src/modules/user/user.module';
import { LoginService } from './login/login.service';
import { WechatModule } from '../wechat/wechat.module';
import { ToolModule } from '../tool/tool.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('secret'),
                signOptions: {
                    expiresIn: configService.get<string>(
                        'jwt.expires_in',
                        '3600s',
                    ),
                },
            }),
            inject: [ConfigService],
        }),
        UserModule,
        WechatModule,
        ToolModule
    ],
    providers: [JwtHelperService, JwtHelperStrategy, LoginService],
    exports: [JwtHelperStrategy],
    controllers: [LoginController],
})
export class AuthModule {}
