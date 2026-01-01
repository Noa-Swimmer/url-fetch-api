import { Controller, Post, Body, Get } from '@nestjs/common';
import { FetchService } from './fetch.service';
import { CreateFetchDto } from './dto/create-fetch.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('fetch')
@Controller('fetch')
export class FetchController {
  constructor(private readonly fetchService: FetchService) {}

  @Post()
  @ApiOperation({ summary: 'Submit URLs to be fetched later', description: 'Accepts a JSON body containing an array of HTTP/HTTPS URLs to fetch asynchronously.' })
  @ApiBody({
    type: CreateFetchDto,
    examples: {
      example: {
        summary: 'Two URLs',
        value: { urls: ['https://example.com', 'https://httpbin.org/redirect/1'] },
      },
    },
  })
  create(@Body() dto: CreateFetchDto) {
    return this.fetchService.enqueue(dto.urls);
  }

  @Get()
  @ApiOperation({ summary: 'List submitted URLs and their fetch status' })
  @ApiResponse({
    status: 200,
    description: 'Array of fetch items',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          finalUrl: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
          httpStatusCode: { type: 'number' },
          content: { type: 'string' },
          error: { type: 'string' },
        },
      },
      example: [
        { url: 'https://example.com', finalUrl: 'https://example.com', status: 'completed', httpStatusCode: 200, content: '<html>...</html>' },
        { url: 'http://no-such-host.example.invalid', finalUrl: 'http://no-such-host.example.invalid', status: 'failed', error: 'DNS lookup failed' },
      ],
    },
  })
  findAll() {
    return this.fetchService.getAll();
  }
}
