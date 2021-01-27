import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventEntity } from './entities/event.entity';

const date = new Date(2020, 10, 30)

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

const event2 = {
  eventID: "11111111-1111-1111-1111-111111111111",
  userID: "00000000-0000-0000-0000-000000000000",
  changeDescription: "",
  timestamp: date
};

describe('EventsController', () => {
  let eventsController: EventsController;
  let eventsService: EventsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{
        provide: EventsService,
        useValue: {
          findAll: jest.fn().mockResolvedValue(eventEntities),
          create: jest.fn().mockResolvedValue(event2),
          delete: jest.fn().mockResolvedValue({ deleted: true })
        },
      },
      ],
    }).compile();

    eventsController = moduleRef.get<EventsController>(EventsController);
    eventsService = moduleRef.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(eventsController).toBeDefined();
  });

  describe('findAll', () => {
    it('should get a list of events', async () => {
      const expected: EventEntity[] = [{
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
      const result = eventsController.findAll();
      await expect(result).resolves.toEqual(expected);
    });
  })

  describe('create', () => {
    it('should create a new event', async () => {
      const newEvent = {
        user: {
          id: "11111111-1111-1111-1111-111111111111"
        },
        consents: [{
          id: "sms_notifications", 
          enabled: true
        }]
      };

      await eventsController.create(newEvent);

      expect(eventsService.create).toBeCalledTimes(1);
    });
  })

  describe('deleteEvent', () => {
    it('should return that it deleted an event', async () => {
      const expected = { deleted: true };
      const id: string = "11111111-1111-1111-1111-111111111111";

      const result = eventsController.delete(id);

      await expect(result).resolves.toEqual(expected);
    });
  })
});
