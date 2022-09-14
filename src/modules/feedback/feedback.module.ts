import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback/feedback.service';
import { FeedbackController } from './feedback/feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackPhoto } from './entities/feedback-photo.entity';
import { CatModule } from '../cat/cat.module';
import { UserModule } from '../user/user.module';
import { IsFeedbackIDValidValidator } from './validators/is-feedbackid-valid.validator';

@Module({
    imports: [
        CatModule,
        UserModule,
        TypeOrmModule.forFeature([
            Feedback,
            FeedbackPhoto
        ]),
    ],
    providers: [FeedbackService, IsFeedbackIDValidValidator],
    controllers: [FeedbackController],
    exports: [ FeedbackService ]
})
export class FeedbackModule { }
