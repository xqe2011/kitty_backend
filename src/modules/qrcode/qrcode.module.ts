import { Module } from '@nestjs/common';
import { ToolModule } from '../tool/tool.module';
import { ConsumeService } from './consume/consume.service';
import { GenerateController } from './generate/generate.controller';
import { GenerateService } from './generate/generate.service';
import { QRCodeService } from './qrcode/qrcode.service';
import { IsQRCodeValidValidator } from './validatos/is-qrcode-valid.validator';

@Module({
    imports: [ToolModule],
    providers: [GenerateService, QRCodeService, ConsumeService, IsQRCodeValidValidator],
    controllers: [GenerateController],
    exports: [ ConsumeService ],
})
export class QRCodeModule {}
