import { Item } from "./item";

export class Event implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public calendar?: string,
    public startsAt?: Date,
    public endsAt?: Date,
    public title?: string,
    public timezone?: string,
    public allDay?: boolean,
    public duration?: string,
    public rrule?: string,
    public exRule?: string,
    public exDates?: any,
    public organizer?: string,
    public attendees?: string[],
    public description?: string,
    public location?: string,
    public latLng?: any,
    public conferenceUrl?: string,
    public status?: any,
    public private?: boolean,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {
    this["@id"] = _id;
  }
}
