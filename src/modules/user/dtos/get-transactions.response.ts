import { ApiProperty } from '@nestjs/swagger';
import { PointsTransactionReason } from '../enums/points-transaction-reason.enum';

export class GetTransactionResponseDto {
    @ApiProperty({
        description: '积分变化原因,0表示管理员加减积分,1表示完成成就,2表示使用猫咪雷达功能,3表示随手拍,4表示猫咪状态反馈/BUG反馈,5表示购买商品,6表示购买商品退款',
        enum: PointsTransactionReason,
    })
    reason: PointsTransactionReason;

    @ApiProperty({ description: '变化的积分数,正数为增加,负数为减少' })
    points: number;

    @ApiProperty({ description: '记录ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '变化记录描述' })
    description: string;

    @ApiProperty({ description: '记录产生日期' })
    createdDate: Date;
}
