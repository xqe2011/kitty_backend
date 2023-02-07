import { ApiProperty } from "@nestjs/swagger";

export class CreateReportResponseDto {
    @ApiProperty({ description: "举报ID", minimum: 1 })
    reportID: number;
}
