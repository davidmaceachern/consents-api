import { Test, TestingModule } from '@nestjs/testing';
import { User, IUserResponseArray } from './dto/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const user1 = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "beauvoir@didomi.com",
  consents: []
};

const user2 = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "dumont@didomi.com",
  consents: []
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: {
          findAll: jest.fn().mockResolvedValue([user1, user2]),
          findOne: jest.fn().mockResolvedValue(user1),
          create: jest.fn().mockResolvedValue(user2),
          update: jest.fn().mockResolvedValue(user2),
          delete: jest.fn().mockResolvedValue({ deleted: true }),
        },
      },
      ],
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('findAll', () => {
    it('should get a list of users', async () => {
      const expected: User[] = [{
        id: "00000000-0000-0000-0000-000000000000",
        email: "beauvoir@didomi.com",
        consents: []
      }, {
        id: "11111111-1111-1111-1111-111111111111",
        email: "dumont@didomi.com",
        consents: []
      }];
      const result = usersController.findAll();
      await expect(result).resolves.toEqual(expected);
    });
  })
  describe('findOne', () => {
    it('should get a single user using their ID', async () => {
      const expected = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "beauvoir@didomi.com",
        consents: []
      };
      const id = "00000000-0000-0000-0000-000000000000";

      const result = usersController.findOne(id);

      await expect(result).resolves.toEqual(expected);
    });
  })
  describe('createUser', () => {
    it('should create a new user', async () => {
      const expected = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "dumont@didomi.com",
        consents: []
      };

      const newUser = { email: "dumont@didomi.com" };
      const result = usersController.create(newUser);

      await expect(result).resolves.toEqual(expected);
    });
  })

  describe('updateUser', () => {
    it('should update a new user', async () => {
      const expected: User = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "dumont@didomi.com",
        consents: []
      };

      const userToBeUpdated: UpdateUserDto = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "dumont@didomi.com",
      };

      const result = usersController.update(userToBeUpdated);

      await expect(result).resolves.toEqual(expected);
    });
  });

  describe('deleteUser', () => {
    it('should return that it deleted a user', async () => {
      const expected = { deleted: true };
      const id: string = "11111111-1111-1111-1111-111111111111";

      const result = usersController.delete(id);

      await expect(result).resolves.toEqual(expected);
    });
  })
});
