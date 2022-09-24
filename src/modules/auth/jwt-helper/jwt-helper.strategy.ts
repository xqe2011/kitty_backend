import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtHelperService } from './jwt-helper.service';

@Injectable()
export class JwtHelperStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private jwtHelperService: JwtHelperService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: configService.get<string>('debug', "false").toLowerCase() === 'true',
            secretOrKey: configService.get<string>('secret'),
        });
    }

    async validate(payload: any) {
        return this.jwtHelperService.parseJWTPayload(payload);
    }
}
