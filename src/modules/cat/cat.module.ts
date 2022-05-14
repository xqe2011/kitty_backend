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
import { VectorService } from './vector/vector.service';
import { CatVector } from './entities/cat-vector.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Cat,
            CatPhoto,
            CatRecommendation,
            CatVector,
        ]),
        SettingModule,
    ],
    providers: [
        RecommendationService,
        CatService,
        PhotoService,
        IsCatIDValidValidator,
        IsPhotoIDValidValidator,
        VectorService,
    ],
    controllers: [CatController, RecommendationController, PhotoController],
})
export class CatModule {}
