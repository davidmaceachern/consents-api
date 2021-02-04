import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class ConsentChangedEvent {
    userID: string;
    consents: Array<any>;

    constructor(createEventDto: CreateEventDto) {
        this.userID = createEventDto.user.id;
        this.consents = createEventDto.consents;
    }
}