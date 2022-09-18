import { ApiProperty } from "@nestjs/swagger";

export class UploadPhotoResponseDto {
    @ApiProperty({ description: "照片ID", minimum: 1 })
    photoID: number;
}
