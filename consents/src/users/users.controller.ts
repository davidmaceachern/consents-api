import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './dto/user.interface';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
/**
 * Controller class allows us to define how our users
 * can interact with the REST API.
 */
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({
    description: 'gets all available users'
  })
  @ApiOkResponse({
    description: 'successfully found and fetched all users',
    type: [UserDto]
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get()
  @ApiOperation({
    description: 'Find a user by id'
  })
  @ApiOkResponse({
    description: 'successfully found and fetched the requested consent user',
    type: [UserDto],
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    description: 'create a new consent user',
  })
  @ApiOkResponse({
    description: 'successfully created a new user',
    type: [UserDto],
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put()
  @ApiOperation({
    description: 'update an existing consent user',
  })
  @ApiOkResponse({
    description: 'successfully updated consent user',
    type: [UserDto],
  })
  //update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  async update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    description: 'delete an existing consent user',
  })
  @ApiOkResponse({
    description: 'successfully deleted consent user',
    type: [UserDto],
  })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
