import { ConsentUserDeletedEvent } from './consent-user-deleted.event';

describe('ConsentUserDeletedEvent', () => {
  it('should create a ConsentUserDeletedEvent instance', () => {
    const id = "00000000-0000-0000-0000-000000000000"; 
    const event = new ConsentUserDeletedEvent(id);
    expect(event.id).toBe("00000000-0000-0000-0000-000000000000");
    expect(event instanceof ConsentUserDeletedEvent).toBe(true);
  });
});