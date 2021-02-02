import { ConsentChangedEvent } from './consent-changed.event';

describe('ConsentChangedEvent', () => {
  it('should create a ConsentChangedEvent instance', () => {
    const createEventDto = { 
        user: { id: "1ou324ou2o5u25" },
        consents: []
    };
    const event = new ConsentChangedEvent(createEventDto);
    expect(event.userID).toBe("1ou324ou2o5u25");
    expect(event instanceof ConsentChangedEvent).toBe(true);
  });
});