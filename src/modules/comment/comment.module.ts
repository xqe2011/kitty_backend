import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentsAreaService } from './comments-area/comments-area.service';
import { Comment } from './entities/comment.entity';
import { CommentsArea } from './entities/comments-area.entity';
import { CommentsAreaController } from './comments-area/comments-area.controller';
import { UserModule } from 'src/modules/user/user.module';
import { IsCommentIDValidValidator } from './validators/is-commentid-valid.validator';
import { IsCommentsAreaIDValidValidator } from './validators/is-comments-areaid-valid.validator';
import { SettingModule } from '../setting/setting.module';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, CommentsArea]), UserModule, SettingModule],
    controllers: [CommentController, CommentsAreaController],
    providers: [
        CommentService,
        CommentsAreaService,
        IsCommentIDValidValidator,
        IsCommentsAreaIDValidValidator,
    ],
})
export class CommentModule {}
