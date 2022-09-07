import { Module } from '@nestjs/common';
import { CatModule } from '../cat/cat.module';
import { CatController } from './cat/cat.controller';

@Module({
    imports: [ CatModule ],
    controllers: [ CatController ]
})
export class ManageModule {}
