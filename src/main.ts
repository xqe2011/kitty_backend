import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import * as swaggerStats from 'swagger-stats';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(swaggerStats.getMiddleware({
        swaggerSpec: require('./openapi.json'),
        name: 'Kitty Backend API Statistics',
        uriPath: '/stats',
        authentication: true,
        onAuthenticate: (req, username: string, password: string) => {
            return((username==='kitty@gtcist.cn') && (password==='kitty') );
        }
    }));
    await app.listen(3000);
}
bootstrap();
