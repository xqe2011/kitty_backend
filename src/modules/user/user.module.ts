import { Module } from '@nestjs/common';
import { UserinfoController } from './userinfo/userinfo.controller';
import { UsersService } from './user/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PointsController } from './points/points.controller';
import { PointsService } from './points/points.service';
import { PointsTransaction } from './entities/points-transaction.entity';
import { IsUserIDValidValidator } from './validators/is-userid-valid.validator';
import { FileModule } from '../file/file.module';
import { AchievementService } from './achievement/achievement.service';
import { AchievementController } from './achievement/achievement.controller';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            PointsTransaction,
            Achievement,
            UserAchievement,
        ]),
        FileModule,
    ],
    providers: [
        UsersService,
        PointsService,
        IsUserIDValidValidator,
        AchievementService,
    ],
    exports: [UsersService, PointsService],
    controllers: [UserinfoController, PointsController, AchievementController],
})
export class UserModule {}
