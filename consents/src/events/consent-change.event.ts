import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class ConsentChangeEvent {
    constructor(createEventDto: CreateEventDto) {
        console.log(createEventDto);
        console.log('Consent change event occurred.');
    }
}