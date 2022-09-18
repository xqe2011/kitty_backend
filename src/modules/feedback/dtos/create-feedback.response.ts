import { ApiProperty } from "@nestjs/swagger";

export class CreateFeedbackResponseDto {
    @ApiProperty({ description: "反馈ID", minimum: 1 })
    feedbackID: number;
}
