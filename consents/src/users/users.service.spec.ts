import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './dto/user.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

const user: User = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "beauvoir@didomi.com",
  consents: []
};

const userArray = [{
  id: "00000000-0000-0000-0000-000000000000",
  email: "beauvoir@didomi.com",
  consents: []
}, {
  id: "11111111-1111-1111-1111-111111111111",
  email: "dumont@didomi.com",
  consents: []
}]

const userEntities = [{
  userID: "00000000-0000-0000-0000-000000000000",
  email: "beauvoir@didomi.com",
  previouslyGivenConsent: false,
  smsNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  createdAt: "2021-01-26T11:12:09+0000",
  lastModifiedAt: "2021-01-26T11:12:09+0000"
}, {
  userID: "11111111-1111-1111-1111-111111111111",
  email: "dumont@didomi.com",
  previouslyGivenConsent: false,
  smsNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  createdAt: "2021-01-26T11:12:09+0000",
  lastModifiedAt: "2021-01-26T11:12:09+0000"
}]

const userEntity = {
  userID: "00000000-0000-0000-0000-000000000000",
  email: "beauvoir@didomi.com",
  previouslyGivenConsent: false,
  smsNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  createdAt: "2021-01-26T11:12:09+0000",
  lastModifiedAt: "2021-01-26T11:12:09+0000"
};

// const userEntityDifferentID = {
//   userID: "00000000-0000-0000-0000-222222222222",
//   email: "beauvoir@didomi.com",
//   previouslyGivenConsent: false,
//   smsNotificationsEnabled: false,
//   emailNotificationsEnabled: false,
//   createdAt: "2021-01-26T11:12:09+0000",
//   lastModifiedAt: "2021-01-26T11:12:09+0000"
// };

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<UserEntity>;
  let eventEmitter: EventEmitter2
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(userEntities),
            findOne,
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue({ deleted: true })
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn()
          }
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findAll', () => {

    it('should return an array of users', async () => {
      const expected = userArray;

      const result = usersService.findAll();

      await expect(result).resolves.toEqual(expected);
    });
  });

  describe('findOne', () => {

    beforeEach(() => {
      findOne.mockReturnValue(Promise.resolve(userEntity));
    })

    it('should get a single user by id', async () => {
      const expected = user;
      const repoSpy = jest.spyOn(usersRepository, "findOne");

      const result = await usersService.findOne("00000000-0000-0000-0000-000000000000");

      expect(result).toEqual(expected);
      expect(repoSpy).toBeCalledWith("00000000-0000-0000-0000-000000000000");
    });
  });

  describe('create', () => {
    describe('should', () => {
      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      })

      it('successfully create a user', async () => {
        const repoSpy = jest.spyOn(usersRepository, "findOne");
        const userToBeCreated = { email: 'dumont@didomi.io' };

        const result = await usersService.create(userToBeCreated);

        expect(repoSpy).toBeCalledWith({ where: { email: "dumont@didomi.io" } });
        expect(usersRepository.save).toBeCalledTimes(1);
        expect(result).toHaveProperty("email", "dumont@didomi.io")
      });

      it('throw a 422 error when email is not valid', async () => {
        const userToBeCreated = { email: 'dumontdidomi.io' };

        await expect(usersService.create(userToBeCreated)).rejects.toThrowError(UnprocessableEntityException);
        await expect(usersService.create(userToBeCreated)).rejects.toThrowError("Email address provided is not valid: dumontdidomi.io.");
      });

    });

    describe('should', () => {

      beforeEach(() => {
        findOne.mockReturnValue(Promise.resolve(userEntity));
      })

      it('throw a 422 error when the email is not unique', async () => {
        const userToBeCreated = { email: 'dumont@didomi.io' };

        await expect(usersService.create(userToBeCreated)).rejects.toThrowError(UnprocessableEntityException);
        await expect(usersService.create(userToBeCreated)).rejects.toThrowError("Email must be unique: dumont@didomi.io.");
      });
    });
  });

  describe('update', () => {

    describe('should', () => {

      beforeEach(() => {
        findOne.mockReturnValue(Promise.resolve(userEntity));
      })

      it('return the updated user when succesfully updated', async () => {
        const expected: User = user;
        const userToBeUpdated: UpdateUserDto = {
          id: "00000000-0000-0000-0000-000000000000",
          email: "beauvoir@didomi.com"
        }
        const result = await usersService.update(userToBeUpdated);
        expect(result).toEqual(expected);
        expect(usersRepository.update).toBeCalledTimes(1);
      });
    });

    describe('should', () => {

      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      })

      it('throw not found exception when the user does not exist', async () => {
        const userToBeUpdated: UpdateUserDto = {
          id: "00000000-0000-0000-0000-000000000000",
          email: "beauvoir@didomi.com"
        }
        await expect(usersService.update(userToBeUpdated)).rejects.toThrowError(NotFoundException);
      });
    });
    // describe('should', () => {

    //   beforeEach(() => {
    //     findOne.mockReturnValue(Promise.resolve(userEntity)).mockReturnValueOnce(Promise.resolve(userEntityDifferentID));
    //   })

    //   it.only('throw 422 exception when the new email is not unique', async () => {
    //     const userToBeUpdated: UpdateUserDto = {
    //       id: "00000000-0000-0000-0000-000000000000",
    //       email: "beauvoir@didomi.com"
    //     }
    //     await expect(usersService.update(userToBeUpdated)).rejects.toThrowError(UnprocessableEntityException);
    //   });
    // });
  });

  describe('delete', () => {

    describe('should', () => {

      it('successfully delete a user', async () => {
        const expected = { deleted: true };
        const result = await usersService.delete("00000000-0000-0000-0000-000000000000");
        expect(result).toEqual(expected);
        expect(eventEmitter.emit).toBeCalledTimes(1);
      });

      it('should return {deleted: false, message: err.message}', async () => {
        const repoSpy = jest
          .spyOn(usersRepository, 'delete')
          .mockRejectedValueOnce(new Error('Bad Delete Method.'));
        expect(usersService.delete("a bad uuid")).resolves.toEqual({
          deleted: false,
          message: 'Bad Delete Method.',
        });
        expect(repoSpy).toBeCalledWith("a bad uuid");
        expect(repoSpy).toBeCalledTimes(1);
      });
    });
  });
});