import { Module } from '@nestjs/common';
import { ShortlinkController } from './shortlink.controller';
import { ShortlinkService } from './shortlink.service';

@Module({
    controllers: [ShortlinkController],
    providers: [ShortlinkService],
    exports: [ShortlinkService],
})
export class ShortlinkModule { }
