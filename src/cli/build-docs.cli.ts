import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import { SwaggerModule, DocumentBuilder, OpenAPIObject, getSchemaPath } from '@nestjs/swagger';
import { mkdir, pathExists, remove, writeFile } from 'fs-extra';
import { Logger } from '@nestjs/common';
import { ForbiddenExceptionResponseDto } from 'src/docs/dtos/forbidden-exception.response';
import { UnauthorizedExceptionResponseDto } from 'src/docs/dtos/unauthorized-exception.response';
import { BadRequestExceptionResponseDto } from 'src/docs/dtos/bad-request-exception.response';

function addLogo(document: OpenAPIObject) {
    document.info['x-logo'] = {
        url: './logo.png',
        backgroundColor: '#FFFFFF',
    };
}

/**
 * 添加全局错误
 * @param document OPENAPI文档
 */
function addGlobalExceptions(document: OpenAPIObject) {
    if (document.components['responses'] === undefined) {
        document.components['responses'] = {};
    }
    document.components.responses['403'] = {
        description: '无权限',
        content: {
            'application/json': {
                schema: {
                    $ref: getSchemaPath(ForbiddenExceptionResponseDto),
                },
            },
        },
    };
    document.components.responses['401'] = {
        description: 'Authorization字段无效',
        content: {
            'application/json': {
                schema: {
                    $ref: getSchemaPath(UnauthorizedExceptionResponseDto),
                },
            },
        },
    };
    document.components.responses['400'] = {
        description: '参数错误',
        content: {
            'application/json': {
                schema: {
                    $ref: getSchemaPath(BadRequestExceptionResponseDto),
                },
            },
        },
    };
    for (const path in document.paths) {
        for (const method in document.paths[path]) {
            if (document.paths[path][method].responses != undefined) {
                document.paths[path][method].responses['403'] = {
                    $ref: '#/components/responses/403',
                };
                document.paths[path][method].responses['401'] = {
                    $ref: '#/components/responses/401',
                };
                document.paths[path][method].responses['400'] = {
                    $ref: '#/components/responses/400',
                };
            }
        }
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const logger = new Logger('CLI');
    logger.log('Start building documentation...');
    let version = process.env["GITHUB_SHA"];
    if (version !== undefined) {
        version = version.slice(0, 7);
    } else {
        version = "local";
    }
    const config = new DocumentBuilder()
        .setTitle('Kitty后端APi服务')
        .setVersion(version)
        .addBearerAuth({ name: '统一认证', type: 'http' })
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        extraModels: [BadRequestExceptionResponseDto, ForbiddenExceptionResponseDto, UnauthorizedExceptionResponseDto],
    });
    /** 批量添加全局错误 */
    addGlobalExceptions(document);
    /** 添加LOGO */
    addLogo(document);
    /* 添加index.md文件 */
    config.info.description = {
        $ref: './index.md',
    } as any;
    logger.log('Write schemas to filesystem...');
    if (!(await pathExists('./docs'))) {
        await mkdir('./docs');
    }
    await remove('./docs/openapi.json');
    await writeFile(
        './docs/openapi.json',
        JSON.stringify(document, undefined, 4),
    );
    logger.log('Everything done.');
    await app.close();
}
bootstrap();
