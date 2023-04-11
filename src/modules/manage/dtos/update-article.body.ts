import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateArticleBodyDto {
    @IsString()
    @ApiProperty({ description: '文章标题' })
    title: string;

    @IsString()
    @ApiProperty({ description: '文章摘要' })
    summary: string;

    @IsString()
    @ApiProperty({ description: '文章URL' })
    url: string;
}
