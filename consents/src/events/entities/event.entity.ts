import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "event" })
export class EventEntity {

  @PrimaryGeneratedColumn("uuid") 
  eventID: string;
  
  @Column() 
  userID: string;
  
  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" }) 
  timestamp: Date;

  @Column()
  changeDescription: string;
}