import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CommentsAreaService } from '../comments-area/comments-area.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCommentsAreaIDValidValidator implements ValidatorConstraintInterface {
    constructor(private commentsAreaService: CommentsAreaService) {}

    async validate(commentsAreaID: any, args: ValidationArguments) {
        if (typeof commentsAreaID != 'number' || commentsAreaID < 0 || isNaN(commentsAreaID)) return false;
        /** 是否检查评论区可见 */
        if (args.constraints[0]) {
            return await this.commentsAreaService.isAreaVisible(commentsAreaID);
        } else {
            return await this.commentsAreaService.isAreaExists(commentsAreaID);
        }
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'Comments AreaID is not valid or not visible!';
    }
}
