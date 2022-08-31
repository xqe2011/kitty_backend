import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CommentService } from '../comment/comment.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCommentIDValidValidator implements ValidatorConstraintInterface {
    constructor(private commentService: CommentService) {}

    async validate(commentID: any, args: ValidationArguments) {
        if (typeof commentID != 'number' || commentID < 0 || isNaN(commentID)) return false;
        /** 是否检查根评论 */
        if (args.constraints[0]) {
            return await this.commentService.isCommentRoot(commentID);
        } else {
            return await this.commentService.isCommentExists(commentID);
        }
    }

    defaultMessage(args: ValidationArguments) {
        args;
        return 'CommentID is not valid or not exists or not root comment!';
    }
}
