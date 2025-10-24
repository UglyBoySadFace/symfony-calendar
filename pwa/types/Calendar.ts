import { Item } from "./item";

export class Calendar implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public title?: string,
    public color?: string,
    public timezone?: string,
    public description?: string,
    public members?: string[],
    public slug?: string,
    public owner?: string,
    public events?: string[],
    public createdAt?: Date,
    public updatedAt?: Date
  ) {
    this["@id"] = _id;
  }
}
