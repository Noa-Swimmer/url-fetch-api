import { IsArray, ArrayNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFetchDto {
  @ApiProperty({ type: [String], example: ['https://example.com'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({ protocols: ['http', 'https'] }, { each: true })
  urls: string[];
}
