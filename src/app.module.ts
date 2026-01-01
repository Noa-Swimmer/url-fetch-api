import { Module } from '@nestjs/common';
import { FetchModule } from './fetch/fetch.module';

@Module({
  imports: [FetchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
