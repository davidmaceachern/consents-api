import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object
 * "Sometimes you want to change the shape of the data that you send to client."
 * https://docs.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
 */

export class CreateUserDto {
    @ApiProperty({
        example: 'beauvoir@didomi.io',
        description: 'A valid email address that identifies the user.',
    })
    // @IsEmail() // TODO Fix decorator
    readonly email: string;
}