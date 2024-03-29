import { ForbiddenException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

@Injectable()
export class UserService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private fileService: FileService,
        private settingService: SettingService,
    ) {}

    async onApplicationBootstrap() {
        if ((await this.settingService.getSetting('user.default_nickname')) == '') {
            await this.settingService.createSetting('user.default_nickname', '', true);
        }
        if ((await this.settingService.getSetting('user.default_avatar')) == '') {
            await this.settingService.createSetting('user.default_avatar', '', true);
        }
        await this.settingService.updateSetting('user.default_nickname', "爱猫人士_uid");
        await this.settingService.updateSetting('user.default_avatar', "default.png");
    }

    /**
     * 用户是否存在
     * @param id 用户ID
     * @returns 是否存在
     */
    async isUserExists(id: number) {
        return (await this.usersRepository.count({ id: id })) > 0;
    }

    /**
     * 根据用户ID获取用户可以输出的信息(非User实例)
     * @param id 用户ID
     * @param isDetail 是否包含角色,积分等敏感信息
     * @returns 用户信息
     */
    async getUserInfoByID(id: number, isDetail: boolean) {
        const user = await this.getUserByID(id);
        const sensitive = isDetail ? {
            role: user.role,
            points: user.points,
            createdDate: user.createdDate,
            lastLoginDate: user.lastLoginDate
        } : {};
        return {
            nickName: user.nickName,
            avatarFileName: user.avatarFileName,
            id: user.id,
            ...sensitive
        };
    }

    /**
     * 根据用户ID获取用户信息
     * @param id 用户ID
     * @returns 用户信息
     */
    async getUserByID(id: number) {
        return await this.usersRepository.findOne(id);
    }

    /**
     * 根据微信UnionID获取用户信息
     * @param unionID 微信UnionID
     * @returns 用户信息
     */
    async getUserByUnionID(unionID: string) {
        return await this.usersRepository.findOne({ unionID: unionID });
    }

    /**
     * 根据微信OpenID获取用户信息
     * @param openID 微信OpenID
     * @returns 用户信息
     */
     async getUserByOpenID(openID: string) {
        return await this.usersRepository.findOne({ openID: openID });
    }

    /**
     * 根据微信UnionID或者OpenID获取用户信息获取不到则创建
     * @param unionID 微信UnionID
     * @param openID 微信OpenID
     * @returns 用户信息
     */
    async getOrCreateUserByUnionIDOrOpenID(unionID: string, openID: string) {
        let user = await this.getUserByUnionID(unionID);
        if (user == undefined) {
            user = await this.getUserByOpenID(openID);
        }
        if (user === undefined) {
            const createdUser = new User();
            createdUser.unionID = unionID;
            createdUser.openID = openID;
            createdUser.lastLoginDate = new Date();
            await this.usersRepository.save(createdUser);
            user = createdUser;
        } else {
            user.unionID = unionID;
            user.openID = openID;
            await this.usersRepository.save(user);
        }
        return user;
    }

    /**
     * 更新用户登陆时间到现在
     * @param id 用户ID
     */
    async updateLoginDateToNow(id: number) {
        await this.usersRepository.update(id, { lastLoginDate: new Date() });
    }

    /**
     * 更新用户信息,如果是普通用户则升级为已注册用户
     * @param id 用户ID
     * @param nickName 昵称,若为undefined则不更新昵称
     * @param avatarFileToken 头像文件Token,若为undefined则不更新头像
     * @returns 是否成功
     */
    async updateUserinfoAndRole(id: number, nickName?: string, avatarFileToken?: string) {
        const user = await this.getUserByID(id);
        if (user === undefined) return false;
        if (nickName !== undefined) {
            user.nickName = nickName;
        }
        if (avatarFileToken !== undefined) {
            user.avatarFileName = this.fileService.getFileNameByToken(avatarFileToken);
        }
        if (user.role === Role.NormalUser &&
            user.nickName !== null &&
            user.avatarFileName !== null) {
            user.role = Role.RegisteredUser;
        }
        await this.usersRepository.save(user);
        return true;
    }

    /**
     * 重置用户昵称和头像未默认值
     * @param id 用户ID
     */
    async resetNickNameAndAvatar(id: number) {
        const user = await this.getUserByID(id);
        user.nickName = await this.settingService.getSetting('user.default_nickname') + user.id;
        user.avatarFileName = await this.settingService.getSetting('user.default_avatar');
        await this.usersRepository.save(user);
    }

    /**
     * 更新用户信息
     * @parma id 用户ID
     * @param role 角色
     */
    async updateUser(id: number, role: Role) {
        const user = await this.getUserByID(id);
        if ((user.avatarFileName === null || user.nickName === null) &&
            (role !== Role.NormalUser && role !== Role.Disabled)) {
            throw new ForbiddenException("This user doesn't have a nickname or avatar");
        }
        user.role = role;
        await this.usersRepository.save(user);
    }
}
