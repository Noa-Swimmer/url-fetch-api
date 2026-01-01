import { IsArray, ArrayNotEmpty, IsUrl } from 'class-validator';

export class CreateFetchDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({ protocols: ['http', 'https'] }, { each: true })
  urls: string[];
}
