import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object
 * "Sometimes you want to change the shape of the data that you send to client."
 * https://docs.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
 */

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        example: '00000000-0000-0000-0000-000000000000',
        description: 'The unique ID the system provided when the user was created.',
    })

    readonly id: string;
    
    @ApiProperty({
        example: 'beauvoir@didomi.io',
        description: 'A valid email address that identifies the user.',
    })
    readonly email: string;
}