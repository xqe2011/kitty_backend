import { Module } from '@nestjs/common';
import { CatModule } from '../cat/cat.module';
import { CatPhotoController } from './cat-photo/cat-photo.controller';
import { CatController } from './cat/cat.controller';

@Module({
    imports: [ CatModule ],
    controllers: [ CatController, CatPhotoController ]
})
export class ManageModule {}
