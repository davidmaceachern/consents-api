import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';

/**
 * Service class contains the business logic
 * of the domain, the rules that define what will
 * happen when the user interacts with the REST API.
 */
// TODO Edgecase - if user updates their consent status directly would that emit an event we need to handle here?
// TODO Edgecase - if user is not a valid user, we would need to use an authentication layer to avoid this being a problem?
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
  ) {}

  async create(dto: CreateEventDto): Promise<void> {
    // create a new event
    let newEvent = new EventEntity();
    newEvent.changeDescription = this.getChangeDescription(dto.consents);
    newEvent.userID = dto.user.id;
    await this.eventsRepository.save(newEvent);
    // TODO emit details about the created event.
  }

  async findAll(): Promise<EventEntity[]> {
    return await this.eventsRepository.find();
    // TODO Edgecase - might want let the user know when there are no events
  }

  async delete(id: string): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.eventsRepository.delete(id);
      return { deleted: true }; // TODO Http status 204?
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }

  private getChangeDescription(consents): string {
    // TODO This needs to be refactored.
    type IConsentsToBeUpdated = { 
      emailNotificationsEnabled: boolean
      smsNotificationsEnabled: boolean
    };

    let consentsToBeUpdated: IConsentsToBeUpdated = {
      emailNotificationsEnabled: undefined,
      smsNotificationsEnabled: undefined
    };

    let changeDescription: string;

    type consent = { id: string, enabled: boolean };

    function isConsentEnabled(consent): void {
      if (consent.id === "email_notifications") {
        consentsToBeUpdated.emailNotificationsEnabled = consent.enabled.toString();
      } else if (consent.id === "sms_notifications") {
        consentsToBeUpdated.smsNotificationsEnabled = consent.enabled.toString();
      }
    }

    consents.map((consent: consent) => isConsentEnabled(consent))

    if (consentsToBeUpdated.smsNotificationsEnabled === true && consentsToBeUpdated.emailNotificationsEnabled === true){
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