import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { IUserRequestBody, User } from '../src/users/dto/user.interface';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/users/entities/user.entity';
import { EventEntity } from '../src/events/entities/event.entity';

/**
 * End to End test cases that verify the API's behaviour is correct
 * from a users perspective. Intended to be run locally 
 * against a local instance of Postgres.
 */

describe('Consents API (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let eventRepository: Repository<EventEntity>;

  async function dropRecords() {
    await getConnection().synchronize(true);
  }

  async function closeDbConnection() {
    await getConnection().close();
  }

  beforeAll(done => {
    done()
  })

  beforeEach(async (done) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get('UserEntityRepository');
    eventRepository = moduleFixture.get('EventEntityRepository');
    await app.init();
    done()
  });

  afterAll(async (done) => {
    await app.close();
    await closeDbConnection();
    done()
  });

  describe('Should', () => {
    beforeEach(async (done) => {
      await dropRecords();
      done();
    });

    it('allow the user to create multiple events that, when applied in the order of their creation, will generate their current consent status.', async () => {
      const newUser: IUserRequestBody = { email: 'dumont@didomi.io' };

      const server = request(app.getHttpServer())

      // Create a new user
      const newUserRequest = await server
        .post('/users/')
        .send(newUser)
        .expect(201);
      expect(newUserRequest.body).toHaveProperty("id");
      expect(newUserRequest.body.email).toBe("dumont@didomi.io");
      expect(newUserRequest.body).toHaveProperty("consents", []);

      // Grab the id that was generated for use in the event creation
      const userID = newUserRequest.body.id;

      const newEvent = {
        user: { id: userID },
        consents: [
          {
            id: "email_notifications",
            enabled: true
          }
        ]
      };

      // Create a new event for the created user
      await server
        .post('/events/')
        .send(newEvent)
        .expect(201);

      const secondNewEvent = {
        user: { id: userID },
        consents: [
          {
            "id": "email_notifications",
            "enabled": false
          },
          {
            "id": "sms_notifications",
            "enabled": true
          }
        ]
      };

      // Create a second new event for the created user
      await server
        .post('/events/')
        .send(secondNewEvent)
        .expect(201);

      // Check the user entity updated the consent status correctly
      await server
        .get(`/users/${userID}`)
        .expect(200)
        .expect({
          "id": userID,
          "email": "dumont@didomi.io",
          "consents": [
            {
              "id": "email_notifications",
              "enabled": false
            },
            {
              "id": "sms_notifications",
              "enabled": true
            }
          ]
        });
    });

    it('update the users consent status and last modified time when a new consent event is created.', async () => {
      const newUser: IUserRequestBody = { email: 'dumont@didomi.io' };

      const server = request(app.getHttpServer())

      // Create a new user
      const newUserRequest = await server
        .post('/users/')
        .send(newUser)
        .expect(201);
      expect(newUserRequest.body.email).toBe("dumont@didomi.io");

      // Grab the id that was generated for use in the event creation
      const newEvent = {
        user: { id: newUserRequest.body.id },
        consents: [
          {
            id: "sms_notifications",
            enabled: true
          }
        ]
      };

      // Check the last modified date is equal to created date
      const userEntity = await userRepository.findOne(newUserRequest.body.id);
      expect(userEntity.lastModifiedAt).toEqual(userEntity.createdAt);

      // Create a new event for the created user
      await server
        .post('/events/')
        .send(newEvent)
        .expect(201);

      // Directly read from userEntity from the DB to check their status
      const updatedUserEntity = await userRepository.findOne(newUserRequest.body.id);
      expect(updatedUserEntity.previouslyGivenConsent).toBe(true);
      expect(updatedUserEntity.smsNotificationsEnabled).toBe(true);
      expect(updatedUserEntity.emailNotificationsEnabled).toBe(false);

      // Check the last modifed date is not equal to the created date
      expect(updatedUserEntity.lastModifiedAt).not.toEqual(updatedUserEntity.createdAt);
    });

    it('delete all the users events when the user is deleted.', async () => {
      // Create a new user
      const newUser: IUserRequestBody = { email: 'dumont@didomi.io' };

      const server = request(app.getHttpServer())

      const newUserRequest = await server
        .post('/users/')
        .send(newUser)
        .expect(201);
      expect(newUserRequest.body.email).toBe("dumont@didomi.io");

      const userID = newUserRequest.body.id;

      const newEvent1 = {
        user: { id: userID },
        consents: [
          {
            id: "sms_notifications",
            enabled: true
          }
        ]
      };

      await server
        .post('/events/')
        .send(newEvent1)
        .expect(201);

      const newEvent2 = {
        user: { id: userID },
        consents: [
          {
            id: "email_notifications",
            enabled: true
          }
        ]
      };

      await server
        .post('/events/')
        .send(newEvent2)
        .expect(201);

      // Check the events exist for the user
      const eventEntities: EventEntity[] = await eventRepository.find({ userID: userID });
      expect(eventEntities.length).toBe(2);

      // Check the user handled updating the users consent status
      const userEntity: UserEntity[] = await userRepository.find({ userID: userID });
      expect(userEntity[0].previouslyGivenConsent).toBe(true);

      // Delete the user
      await server
        .delete(`/users/${userID}`)
        .expect(200)
        .expect({ deleted: true });

      // Verify the events entity acts upon the user being deleted.
      const eventEntities2: EventEntity[] = await eventRepository.find({ userID: userID });
      expect(eventEntities2.length).toBe(0);
    });

    it('return 201 with no consents when a user is successfully created', async () => {
      const newUser: IUserRequestBody = { email: 'dumont@didomi.io' };
      const server = request(app.getHttpServer());

      const newUserRequest = await server
        .post('/users/')
        .send(newUser)
        .expect(201);

      expect(newUserRequest.body.email).toBe("dumont@didomi.io");
      expect(newUserRequest.body.consents.length).toBe(0);
    });

    it('return 422 when creating a user that already exists', async () => {
      const newUser: IUserRequestBody = { email: 'dumont@didomi.io' };
      const server = request(app.getHttpServer())

      const newUserRequest = await server
        .post('/users/')
        .send(newUser)
        .expect(201);

      expect(newUserRequest.body.email).toBe("dumont@didomi.io");
      expect(newUserRequest.body.consents.length).toBe(0);
      await server
        .post('/users/')
        .send(newUser)
        .expect(422);
    });

    it('return 422 when the email provided is not a valid email', async () => {
      const newUserInvalidEmail: IUserRequestBody = { email: 'dumont@' };
      const server = request(app.getHttpServer())
      await server
        .post('/users/')
        .send(newUserInvalidEmail)
        .expect(422);
    });

    it('return 200 when fetching all users successfully.', async () => {
      const newUser: IUserRequestBody = { email: 'dumont@didomi.io' };
      const newUser2: IUserRequestBody = { email: 'beauvoir@outlook.com' };
      const newUser3: IUserRequestBody = { email: 'arthus-bertrand@aol.net' };

      const server = request(app.getHttpServer())
      await server
        .post('/users/')
        .send(newUser)
        .expect(201);
      await server
        .post('/users/')
        .send(newUser2)
        .expect(201);
      await server
        .post('/users/')
        .send(newUser3)
        .expect(201);
      const fetchAllUsersRequest = await server
        .get('/users/')
        .expect(200);
      expect(fetchAllUsersRequest.body.length).toBe(3);
    });
  });
});
