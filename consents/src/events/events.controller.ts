import { Controller, Get, Post, Body, Param, Delete} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiNoContentResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
/**
 * Controller class allows us to define how our users
 * can interact with the REST API.
 */
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiNoContentResponse()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}
