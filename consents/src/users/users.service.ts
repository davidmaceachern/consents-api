import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { isEmail } from 'class-validator';
import { User } from './dto/user.interface';
import { ConsentChangedEvent } from "../events/consent-changed.event";
import { ConsentUserDeletedEvent } from "./consent-user-deleted.event";

/**
 * Service class contains the business logic
 * of the domain, the rules that define what will
 * happen when the user interacts with the REST API.
 */

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private eventEmitter: EventEmitter2
  ) { }

  async findAll(): Promise<User[]> {
    const usersEntities: UserEntity[] = await this.usersRepository.find();
    const users = usersEntities.map((user) => this.buildUserResponseObject(user));
    return users
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    return this.buildUserResponseObject(user);
  }

  async create(dto: CreateUserDto): Promise<User> {

    const { email } = dto;
    const validEmail = isEmail(email);

    if (!validEmail) {
      throw new UnprocessableEntityException("Email address provided is not valid: " + email + ".");
    }

    // check uniqueness of email
    const userFound = await this.usersRepository.findOne({ where: { email: email } });

    if (userFound) {
      throw new UnprocessableEntityException("Email must be unique: " + email + ".");
    }

    // create a new user
    let newUser = new UserEntity();
    newUser.email = dto.email;
    await this.usersRepository.save(newUser);
    return this.buildUserResponseObject(newUser);
  }

  async update(user: UpdateUserDto): Promise<User> {
    const { id, email } = user;

    // check user exists
    const foundUser = await this.usersRepository.findOne(id);
    if (!foundUser) {
      throw new NotFoundException("Requested user does not exist");
    }

    const validEmail = isEmail(user.email);

    if (!validEmail) {
      throw new UnprocessableEntityException("Email address provided is not valid.")
    }

    // check uniqueness of email
    const userFound = await this.usersRepository.findOne({ where: { email: email } });
    if (userFound.userID !== id) {
      throw new UnprocessableEntityException("Email must be unique");
    }

    // otherwise update the user
    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOne(id);
    return this.buildUserResponseObject(updatedUser);
  }

  async delete(id: string): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.usersRepository.delete(id);
      // emit an event for the Event Entity to act upon
      this.eventEmitter.emit(
        'ConsentUserDeletedEvent.created',
        new ConsentUserDeletedEvent(id),
      );
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }

  @OnEvent('ConsentChangedEvent.created')
  async handleConsentChangedEvent(event: ConsentChangedEvent) {
    // find the user
    const user: UserEntity = await this.usersRepository.findOne(event.userID);
    type consent = { id: string, enabled: boolean };

    if (!user) {
      throw new Error(`Error: Problem consuming 'ConsentChangedEvent', UserID '${event.userID}' does not exist`);
    }

    // update the consents
    function updateUserConsents(consent: consent, user: UserEntity): any {
      user.previouslyGivenConsent = true;
      if (consent.id === "email_notifications") {
        user.emailNotificationsEnabled = consent.enabled;
      } else if (consent.id === "sms_notifications") {
        user.smsNotificationsEnabled = consent.enabled;
      }
    }

    event.consents.map((consent: consent) => updateUserConsents(consent, user))

    // commit the update to the table
    await this.usersRepository.update(event.userID, user)
  }

  private getUsersConsents(user): any {
    const usersConsents = user.previouslyGivenConsent === false ? [] : [
      {
        "id": "email_notifications",
        "enabled": user.emailNotificationsEnabled
      },
      {
        "id": "sms_notifications",
        "enabled": user.smsNotificationsEnabled
      }
    ];
    return usersConsents
  }

  private buildUserResponseObject(user: UserEntity) {
    const userRecord: User = {
      id: user.userID,
      email: user.email,
      consents: this.getUsersConsents(user)
    };
    return userRecord;
  }
}
