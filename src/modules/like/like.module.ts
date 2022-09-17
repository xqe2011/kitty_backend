import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeItem } from './entities/like-item.entity';
import { LikeableEntity } from './entities/likeable-entity.entity';
import { LikeableEntityController } from './likeable-entity/likeable-entity.controller';
import { LikeableEntityService } from './likeable-entity/likeable-entity.service';
import { IsLikeableEntityIDValidValidator } from './validators/is-likeable-entityid-valid.validator';

@Module({
    imports: [TypeOrmModule.forFeature([LikeItem, LikeableEntity])],
    controllers: [LikeableEntityController],
    providers: [
        LikeableEntityService,
        IsLikeableEntityIDValidValidator
    ],
    exports: [ LikeableEntityService ]
})
export class LikeModule {}
