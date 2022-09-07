import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { CatStatusType } from 'src/modules/cat/enums/cat-status-type.enum';

export class CreateCatBodyDto {
    @IsString()
    @ApiProperty({ description: '猫咪名称' })
    name: string;

    @IsString()
    @ApiProperty({ description: '猫咪物种' })
    species: string;

    @IsBoolean()
    @ApiProperty({ description: '猫咪是否已经绝育' })
    isNeuter: boolean;

    @IsString()
    @ApiProperty({ description: '猫咪描述' })
    description: string;

    @IsString()
    @ApiProperty({ description: '猫咪出没地点' })
    haunt: string;

    @IsEnum(CatStatusType)
    @ApiProperty({
        description: '猫咪状态,0表示失踪,1表示正常,2表示生病,3表示住院,4表示被领养,5表示死亡',
        enum: CatStatusType,
    })
    status: CatStatusType;
}
