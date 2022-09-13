import { Module } from '@nestjs/common';
import { CryptoService } from './crypto/crypto.service';
import { ToolService } from './tool/tool.service';

@Module({
    providers: [ToolService, CryptoService],
    exports: [ToolService, CryptoService],
})
export class ToolModule {}
