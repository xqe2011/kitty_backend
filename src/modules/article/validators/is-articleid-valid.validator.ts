import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { ArticleService } from '../article/article.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsArticleIDValidValidator implements ValidatorConstraintInterface {
    constructor(private articlesService: ArticleService) {}

    async validate(articleID: any) {
        if (typeof articleID != 'number' || articleID < 0) return false;
        return await this.articlesService.isArticleExists(articleID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'ArticleID is not valid or not exists!';
    }
}
