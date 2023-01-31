import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationService } from './recommendation/recommendation.service';
import { CatService } from './cat/cat.service';
import { CatController } from './cat/cat.controller';
import { Cat } from './entities/cat.entity';
import { CatPhoto } from './entities/cat-photo.entity';
import { RecommendationController } from './recommendation/recommendation.controller';
import { CatRecommendation } from './entities/cat-recommendation.entity';
import { SettingModule } from 'src/modules/setting/setting.module';
import { PhotoController } from './photo/photo.controller';
import { PhotoService } from './photo/photo.service';
import { IsCatIDValidValidator } from './validators/is-catid-valid.validator';
import { IsPhotoIDValidValidator } from './validators/is-photoid-valid.validator';
import { CommentModule } from '../comment/comment.module';
import { LikeModule } from '../like/like.module';
import { UserModule } from '../user/user.module';
import { TagService } from './tag/tag/tag.service';
import { CatTag } from './entities/cat-tag.entity';
import { IsTagIDValidValidator } from './validators/is-tagid-valid.validator';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Cat,
            CatPhoto,
            CatRecommendation,
            CatTag
        ]),
        SettingModule,
        CommentModule,
        LikeModule,
        UserModule
    ],
    providers: [
        RecommendationService,
        CatService,
        PhotoService,
        IsCatIDValidValidator,
        IsPhotoIDValidValidator,
        TagService,
        IsTagIDValidValidator
    ],
    controllers: [CatController, RecommendationController, PhotoController],
    exports: [ CatService, PhotoService, TagService ]
})
export class CatModule {}
