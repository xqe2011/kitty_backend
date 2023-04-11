import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { ArticleService } from '../article/article.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsArticlePhotoIDValidValidator implements ValidatorConstraintInterface {
    constructor(private articleService: ArticleService) {}

    async validate(photoID: any) {
        if (typeof photoID != 'number' || photoID < 0 || isNaN(photoID)) return false;
        return await this.articleService.isArticlePhotoExists(photoID);
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'Article PhotoID is not valid or not exists!';
    }
}
