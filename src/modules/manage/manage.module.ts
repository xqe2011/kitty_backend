import { Module } from '@nestjs/common';
import { CatModule } from '../cat/cat.module';
import { CommentModule } from '../comment/comment.module';
import { CatPhotoController } from './cat-photo/cat-photo.controller';
import { CatController } from './cat/cat.controller';
import { CommentController } from './comment/comment.controller';
import { CommentsAreaController } from './comments-area/comments-area.controller';

@Module({
    imports: [ CatModule, CommentModule ],
    controllers: [ CatController, CatPhotoController, CommentController, CommentsAreaController ]
})
export class ManageModule {}
