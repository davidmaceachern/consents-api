import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsentUserDeletedEvent {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}