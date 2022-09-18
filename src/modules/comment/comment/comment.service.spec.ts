import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/modules/user/entities/user.entity';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsNull } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CommentsArea } from '../entities/comments-area.entity';
import { CommentStatus } from '../enums/comment-status.enum';
import { CommentService } from './comment.service';

describe('CommentService', () => {
    let service: CommentService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CommentRepository": MockedObject,
        "UserService": MockedObject,
        "SettingService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CommentRepository": {},
            "UserService": {},
            "SettingService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [CommentService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<CommentService>(CommentService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap() - "comment.censor" Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('comment.censor');
    });

    test('onApplicationBootstrap() - "comment.censor" Not Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce("");
        dependencies["SettingService"].createSetting = jest.fn();
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('comment.censor');
        expect(dependencies["SettingService"].createSetting).toBeCalledWith("comment.censor", true, true);
    });

    test('getCommentsByAreaID() - Without children', async () => {
        service.getCommentsByParentID = jest.fn().mockResolvedValue([]);
        dependencies["CommentRepository"].count = jest.fn().mockReturnValue(0);
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            skip: jest.fn(),
            take: jest.fn(),
            getMany: jest.fn().mockResolvedValueOnce([{id: 2222}, {id: 3333}])
        };
        dependencies["CommentRepository"].createQueryBuilder = jest.fn().mockImplementation(() => createQueryBuilder);
        const data1 = await service.getCommentsByAreaID(1111, 10, 0, 30);
        expect(dependencies["CommentRepository"].createQueryBuilder).toBeCalledWith('comment');
        expect(createQueryBuilder.andWhere).toBeCalledWith({
            area: { id: 1111 },
            parentComment: { id: IsNull() },
            status: CommentStatus.DISPLAY,
        });
        expect((service.getCommentsByParentID as jest.Mock).mock.calls).toEqual([
            [2222, 30, 0],
            [3333, 30, 0],
        ]);
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        expect(data1).toEqual([
            { id: 2222, childrenTotal: 0, childrenComments: [] },
            { id: 3333, childrenTotal: 0, childrenComments: [] }
        ]);
    });

    test('getCommentsByAreaID() - With children', async () => {
        service.getCommentsByParentID = jest.fn().mockResolvedValueOnce([{id: 5555}]).mockResolvedValueOnce([{id: 6666}])
        dependencies["CommentRepository"].count = jest.fn().mockReturnValue(0);
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            skip: jest.fn(),
            take: jest.fn(),
            getMany: jest.fn().mockResolvedValueOnce([{id: 2222}, {id: 3333}])
        };
        dependencies["CommentRepository"].createQueryBuilder = jest.fn().mockImplementation(() => createQueryBuilder);
        const data1 = await service.getCommentsByAreaID(1111, 10, 0, 30);
        expect(dependencies["CommentRepository"].createQueryBuilder).toBeCalledWith('comment');
        expect(createQueryBuilder.andWhere).toBeCalledWith({
            area: { id: 1111 },
            parentComment: { id: IsNull() },
            status: CommentStatus.DISPLAY,
        });
        expect((service.getCommentsByParentID as jest.Mock).mock.calls).toEqual([
            [2222, 30, 0],
            [3333, 30, 0],
        ]);
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        expect(data1).toEqual([
            { id: 2222, childrenTotal: 0, childrenComments: [{id: 5555}] },
            { id: 3333, childrenTotal: 0, childrenComments: [{id: 6666}] }
        ]);
    });

    test('getCommentsByConversationID()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            skip: jest.fn(),
            take: jest.fn(),
            getMany: jest.fn().mockResolvedValueOnce([{id: 2222}, {id: 3333}])
        };
        dependencies["CommentRepository"].createQueryBuilder = jest.fn().mockImplementation(() => createQueryBuilder);
        const data1 = await service.getCommentsByConversationID(1111, 10, 0);
        expect(dependencies["CommentRepository"].createQueryBuilder).toBeCalledWith('comment');
        expect(createQueryBuilder.andWhere).toBeCalledWith({
            status: CommentStatus.DISPLAY,
            conversationID: 1111
        });
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        expect(data1).toEqual([{id: 2222}, {id: 3333}]);
    });

    test('getCommentsByParentID()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            skip: jest.fn(),
            take: jest.fn(),
            getMany: jest.fn().mockResolvedValueOnce([{id: 2222}, {id: 3333}])
        };
        dependencies["CommentRepository"].createQueryBuilder = jest.fn().mockImplementation(() => createQueryBuilder);
        const data1 = await service.getCommentsByParentID(1111, 10, 0);
        expect(dependencies["CommentRepository"].createQueryBuilder).toBeCalledWith('comment');
        expect(createQueryBuilder.andWhere).toBeCalledWith({
            status: CommentStatus.DISPLAY,
            parentComment: { id: 1111 }
        });
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        expect(data1).toEqual([{id: 2222}, {id: 3333}]);
    });

    test('createComment() - Without ParentID and ConversationID and with censor', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CommentRepository"].save = jest.fn().mockResolvedValueOnce({id: 7777});
        dependencies["CommentRepository"].update = jest.fn();
        const data = await service.createComment(1111, 2222, null, null, '你好');
        const comment = new Comment();
        comment.area = new CommentsArea();
        comment.area.id = 2222;
        comment.user = new User();
        comment.user.id = 1111;
        comment.status = CommentStatus.PENDING;
        comment.content = '你好';
        expect(dependencies["CommentRepository"].save.mock.calls[0][0]).toEqual(comment);
        expect(dependencies["CommentRepository"].update).toBeCalledWith(
            { id: 7777 },
            { conversationID: 7777 }
        );
        expect(data).toEqual(7777);
    });

    test('createComment() - Without ParentID and ConversationID censor', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(false);
        dependencies["CommentRepository"].save = jest.fn().mockResolvedValueOnce({id: 7777});
        dependencies["CommentRepository"].update = jest.fn();
        const data = await service.createComment(1111, 2222, null, null, '你好');
        const comment = new Comment();
        comment.area = new CommentsArea();
        comment.area.id = 2222;
        comment.user = new User();
        comment.user.id = 1111;
        comment.status = CommentStatus.DISPLAY;
        comment.content = '你好';
        expect(dependencies["CommentRepository"].save.mock.calls[0][0]).toEqual(comment);
        expect(dependencies["CommentRepository"].update).toBeCalledWith(
            { id: 7777 },
            { conversationID: 7777 }
        );
        expect(data).toEqual(7777);
    });

    test('createComment() - With ParentID and without ConversationID and with censor', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CommentRepository"].save = jest.fn().mockResolvedValueOnce({id: 7777});
        dependencies["CommentRepository"].update = jest.fn();
        const data = await service.createComment(1111, 2222, 3333, null, '你好');
        const comment = new Comment();
        comment.parentComment = new Comment();
        comment.parentComment.id = 3333;
        comment.area = new CommentsArea();
        comment.area.id = 2222;
        comment.user = new User();
        comment.user.id = 1111;
        comment.status = CommentStatus.PENDING;
        comment.content = '你好';
        expect(dependencies["CommentRepository"].save.mock.calls[0][0]).toEqual(comment);
        expect(dependencies["CommentRepository"].update).toBeCalledWith(
            { id: 7777 },
            { conversationID: 7777 }
        );
        expect(data).toEqual(7777);
    });

    test('createComment() - With ConversationID and without ParentID and with censor', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        dependencies["CommentRepository"].save = jest.fn().mockResolvedValueOnce({id: 7777});
        dependencies["CommentRepository"].update = jest.fn();
        const data = await service.createComment(1111, 2222, null, 4444, '你好');
        const comment = new Comment();
        comment.area = new CommentsArea();
        comment.area.id = 2222;
        comment.user = new User();
        comment.user.id = 1111;
        comment.status = CommentStatus.PENDING;
        comment.content = '你好';
        expect(dependencies["CommentRepository"].save.mock.calls[0][0]).toEqual(comment);
        expect(dependencies["CommentRepository"].update).toBeCalledWith(
            { id: 7777 },
            { conversationID: 4444 }
        );
        expect(data).toEqual(7777);
    });

    test('deleteComment() - Without Children', async () => {
        dependencies["CommentRepository"].findOne = jest.fn().mockResolvedValueOnce({ id: 1111, childrenComments: [] });
        dependencies["CommentRepository"].softDelete = jest.fn();
        await service.deleteComment(1111);
        expect(dependencies["CommentRepository"].findOne.mock.calls).toEqual([
            [ 1111, { relations: ['childrenComments'] } ],
        ]);
        expect(dependencies["CommentRepository"].softDelete.mock.calls).toEqual([
            [ 1111 ],
        ]);
    });

    test('deleteComment() - With Children', async () => {
        dependencies["CommentRepository"].findOne = jest.fn().mockResolvedValueOnce({
            id: 1111,
            childrenComments: [
                { id: 2222 },
                { id: 3333 },
            ]
        }).mockResolvedValueOnce({
            id: 2222,
            childrenComments: [
                { id: 4444 }
            ]
        }).mockResolvedValue({ childrenComments: [] });
        dependencies["CommentRepository"].softDelete = jest.fn();
        await service.deleteComment(1111);
        expect(dependencies["CommentRepository"].findOne.mock.calls).toEqual([
            [ 1111, { relations: ['childrenComments'] } ],
            [ 2222, { relations: ['childrenComments'] } ],
            [ 4444, { relations: ['childrenComments'] } ],
            [ 3333, { relations: ['childrenComments'] } ],
        ]);
        expect(dependencies["CommentRepository"].softDelete.mock.calls).toEqual([
            [ 4444 ],
            [ 2222 ],
            [ 3333 ],
            [ 1111 ]
        ]);
    });

    test('isCommentBelongToUser() - Exists', async () => {
        dependencies["UserService"].isUserExists = jest.fn().mockResolvedValueOnce(true);
        dependencies["CommentRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isCommentBelongToUser(1111, 2222);
        expect(dependencies["CommentRepository"].count).toBeCalledWith({
            id: 1111,
            user: { id: 2222 },
        });
        expect(dependencies["UserService"].isUserExists).toBeCalledWith(2222);
        expect(data1).toEqual(true);
    });

    test('isCommentBelongToUser() - Not Exists', async () => {
        dependencies["UserService"].isUserExists = jest.fn().mockResolvedValueOnce(true);
        dependencies["CommentRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isCommentBelongToUser(1111, 2222);
        expect(dependencies["CommentRepository"].count).toBeCalledWith({
            id: 1111,
            user: { id: 2222 },
        });
        expect(dependencies["UserService"].isUserExists).toBeCalledWith(2222);
        expect(data1).toEqual(false);
    });

    test('isCommentExists() - Exists', async () => {
        dependencies["CommentRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isCommentExists(1111);
        expect(dependencies["CommentRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(true);
    });

    test('isCommentExists() - Not Exists', async () => {
        dependencies["CommentRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isCommentExists(1111);
        expect(dependencies["CommentRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(false);
    });

    test('isCommentRoot() - Root', async () => {
        dependencies["CommentRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isCommentRoot(1111);
        expect(dependencies["CommentRepository"].count).toBeCalledWith({
            id: 1111,
            parentComment: {
                id: IsNull(),
            },
        });
        expect(data1).toEqual(true);
    });

    test('isCommentRoot() - Not Root', async () => {
        dependencies["CommentRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isCommentRoot(1111);
        expect(dependencies["CommentRepository"].count).toBeCalledWith({
            id: 1111,
            parentComment: {
                id: IsNull(),
            },
        });
        expect(data1).toEqual(false);
    });

    test('getComments()', async () => {
        const createQueryBuilder = {
            select: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            orderBy: jest.fn(),
            getRawMany: jest.fn().mockReturnValue([{id: 111, content: "你好", status: CommentStatus.PENDING}])
        };
        dependencies["CommentRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getComments(10, 0);
        expect(dependencies["CommentRepository"].createQueryBuilder).toBeCalledWith('comment');
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'conversationID', 'status', 'createdDate', 'content', 'areaId as areaID', 'parentCommentId as parentCommentID', 'userId as userID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.orderBy).toBeCalledWith('createdDate', 'DESC');
        expect(data1).toEqual([{id: 111, content: "你好", status: CommentStatus.PENDING}]);
    });

    test('updateCommentInfo()', async () => {
        dependencies["CommentRepository"].update = jest.fn();
        await service.updateCommentInfo(1, CommentStatus.PENDING);
        expect(dependencies["CommentRepository"].update).toBeCalledWith(
            1,
            {
                status: CommentStatus.PENDING
            }
        );
    });

    test('deletePhoto()', async () => {
        dependencies["CommentRepository"].softDelete = jest.fn();
        await service.deletePhoto(1);
        expect(dependencies["CommentRepository"].softDelete).toBeCalledWith(1);
    });
});