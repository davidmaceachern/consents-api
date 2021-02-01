import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { CreateEventDto } from './dto/create-event.dto';
import { EventEntity } from './entities/event.entity';
import { ConsentChangedEvent } from './consent-changed.event';
import { ConsentUserDeletedEvent } from '../users/consent-user-deleted.event';

/**
 * Service class contains the business logic
 * of the domain, the rules that define what will
 * happen when the user interacts with the REST API.
 */

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    private eventEmitter: EventEmitter2
  ) { }

  async create(dto: CreateEventDto): Promise<void> {
    // create a new event
    let newEvent = new EventEntity();
    newEvent.changeDescription = this.getChangeDescription(dto.consents);
    newEvent.userID = dto.user.id;
    await this.eventsRepository.save(newEvent);

    // emit an event for the User Entity to act upon
    this.eventEmitter.emit(
      'ConsentChangedEvent.created',
      new ConsentChangedEvent(dto),
    );
  }

  async findAll(): Promise<EventEntity[]> {
    return await this.eventsRepository.find();
  }

  async delete(id: string): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.eventsRepository.delete(id);
      return { deleted: true }; // TODO Http status 204?
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }

  @OnEvent('ConsentUserDeletedEvent.created')
  async handleConsentUserDeletedEvent(event: ConsentUserDeletedEvent) {
    console.log('CONSENT USER DELETED EVENT OCCURRED');
    try {
      // await this.eventsRepository.delete({ userID: event.id});
      await this.eventsRepository.createQueryBuilder()
        .delete()
        .where("userID = :id", { id: event.id })
        .execute()
    } catch (err) {
      // console.log(`Event handler failed to delete the users event history for userID: ${event.id}`);
      throw new Error(`Event handler failed to delete the users event history for userID: ${event.id}`);
    }
  }

  private getChangeDescription(consents): string {

    type IConsentsToBeUpdated = {
      emailNotificationsEnabled: boolean
      smsNotificationsEnabled: boolean
    };

    type consent = { id: string, enabled: boolean };

    let consentsToBeUpdated: IConsentsToBeUpdated = {
      emailNotificationsEnabled: undefined,
      smsNotificationsEnabled: undefined
    };

    let changeDescription: string;

    function isConsentEnabled(consent): void {
      if (consent.id === "email_notifications") {
        consentsToBeUpdated.emailNotificationsEnabled = consent.enabled.toString();
      } else if (consent.id === "sms_notifications") {
        consentsToBeUpdated.smsNotificationsEnabled = consent.enabled.toString();
      }
    }

    consents.map((consent: consent) => isConsentEnabled(consent))

    if (consentsToBeUpdated.smsNotificationsEnabled === true && consentsToBeUpdated.emailNotificationsEnabled === true) {
      changeDescription = "Enabled SMS and enabled Email";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === true && consentsToBeUpdated.emailNotificationsEnabled === true) {
      changeDescription = "Enabled SMS and enabled Email"
    } else if (consentsToBeUpdated.smsNotificationsEnabled === false && consentsToBeUpdated.emailNotificationsEnabled === false) {
      changeDescription = "Disabled SMS and disabled Email";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === true && consentsToBeUpdated.emailNotificationsEnabled === false) {
      changeDescription = "Enabled SMS and disabled Email";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === false && consentsToBeUpdated.emailNotificationsEnabled === true) {
      changeDescription = "Disabled SMS and enabled Email";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === true && consentsToBeUpdated.emailNotificationsEnabled === undefined) {
      changeDescription = "Enabled SMS";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === false && consentsToBeUpdated.emailNotificationsEnabled === undefined) {
      changeDescription = "Disabled SMS";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === undefined && consentsToBeUpdated.emailNotificationsEnabled === true) {
      changeDescription = "Enabled Email";
    } else if (consentsToBeUpdated.smsNotificationsEnabled === undefined && consentsToBeUpdated.emailNotificationsEnabled === false) {
      changeDescription = "Disabled Email";
    } else {
      changeDescription = "Nothing has changed.";
    }
    return changeDescription
  }
}