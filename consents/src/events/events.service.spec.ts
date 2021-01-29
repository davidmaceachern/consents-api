import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from './events.service';
import { EventEntity } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './dto/event.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

// TODO Move to use DTO's as a factory for generating records or move to .json
const date = new Date(2020, 10, 30)

// const eventEntity: Event = {
//   eventID: "00000000-0000-0000-0000-000000000000",
//   userID: "11111111-1111-1111-1111-111111111111",
//   changeDescription: "",
//   timestamp: date
// };
const eventEntities: EventEntity[] = [{
  eventID: "00000000-0000-0000-0000-000000000000",
  userID: "11111111-1111-1111-1111-111111111111",
  changeDescription: "",
  timestamp: date
}, {
  eventID: "11111111-1111-1111-1111-111111111111",
  userID: "00000000-0000-0000-0000-000000000000",
  changeDescription: "",
  timestamp: date
}];

const createEvent1 = {
  user: {
    id: "00000000-0000-0000-0000-000000000000"
  },
  consents: [{
    id: "email_notifications",
    enabled: true
  }
  ]
};

const createEvent2 = {
  user: {
    id: "00000000-0000-0000-0000-000000000000"
  },
  consents: [
    {
      id: "email_notifications",
      enabled: false
    },
    {
      id: "sms_notifications",
      enabled: true
    }
  ]
};

describe('EventsService', () => {
  let eventsService: EventsService;
  let eventsRepository: Repository<EventEntity>;
  let eventEmitter: EventEmitter2;
  let findOne: jest.Mock;


  beforeEach(async () => {
    findOne = jest.fn();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(eventEntities),
            findOne,
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue({ deleted: true })
          }
        },
        {
          provide: eventEmitter,
          useValue: {}
        },
      ],
    }).compile();

    eventsService = moduleRef.get<EventsService>(EventsService);
    eventsRepository = moduleRef.get<Repository<EventEntity>>(getRepositoryToken(EventEntity));
  });

  it('should be defined', () => {
    expect(eventsService).toBeDefined();
  });

  describe('findAll', () => {

    it('should return an array of events', async () => {
      const expected = eventEntities;

      const result = eventsService.findAll();

      await expect(result).resolves.toEqual(expected);
    });
  });

  describe('create', () => {
    describe('should', () => {

      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      })

      it.only('successfully create an event', async () => {
        const eventToBeCreated = createEvent1;

        await eventsService.create(eventToBeCreated);

        expect(eventsRepository.save).toBeCalledTimes(1);
      });
    });
  });

  describe('delete', () => {

    describe('should', () => {

      it('successfully delete an event', async () => {
        const expected = { deleted: true };
        const result = await eventsService.delete("00000000-0000-0000-0000-000000000000")
        expect(result).toEqual(expected);
      });

      it('should return {deleted: false, message: err.message}', async () => {
        const repoSpy = jest
          .spyOn(eventsRepository, 'delete')
          .mockRejectedValueOnce(new Error('Bad Delete Method.'));
        expect(eventsService.delete("a bad uuid")).resolves.toEqual({
          deleted: false,
          message: 'Bad Delete Method.',
        });
        expect(repoSpy).toBeCalledWith("a bad uuid");
        expect(repoSpy).toBeCalledTimes(1);
      });
    });
  });
});