import { ApiProperty } from "@nestjs/swagger";

export class GetOtherPhotosResponseDto {
    @ApiProperty({ description: '图片ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '原图图片文件名' })
    rawFileName: string;

    @ApiProperty({ description: '展示图片文件名', nullable: true })
    fileName: string;

    @ApiProperty({ description: '图片发布时间' })
    createdDate: Date;

    @ApiProperty({ description: '照片评论' })
    comment: string;

    @ApiProperty({ description: '照片发布者ID' })
    userID: number;
}
