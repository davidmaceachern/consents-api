import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "event" })
export class EventEntity {

  @PrimaryGeneratedColumn("uuid") 
  eventID: string;
  
  @Column() 
  userID: string;
  
  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" }) 
  timestamp: Date;

  // TODO Edgecase - might be simpler to store the descriptions in a table
  @Column()
  changeDescription: string;
}