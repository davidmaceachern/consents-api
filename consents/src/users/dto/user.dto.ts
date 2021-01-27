import { IsArray, IsEmail, IsString } from 'class-validator';

/**
 * Data transfer object
 * "Sometimes you want to change the shape of the data that you send to client."
 * https://docs.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
 */

export class UserDto {
    @IsString()
    readonly id: string;

    @IsEmail()
    readonly email: string;

    @IsArray()
    readonly consents: [];
}