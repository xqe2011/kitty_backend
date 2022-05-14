import { Module } from '@nestjs/common';
import { UserLogService } from './user-log/user-log.service';
import { UserLogController } from './user-log/user-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLog } from './entities/user-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserLog])],
    providers: [UserLogService],
    controllers: [UserLogController],
})
export class UserLogModule {}
