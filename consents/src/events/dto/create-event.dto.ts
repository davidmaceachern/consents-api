import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object
 * "Sometimes you want to change the shape of the data that you send to client."
 * https://docs.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
 */

export class CreateEventDto {
    @ApiProperty({
        example: "00000000-0000-0000-0000-000000000000",
        description: 'A valid uuid that identifies the user.',
    })
    readonly user: { id: string };
    readonly consents: Array<any>;
}
