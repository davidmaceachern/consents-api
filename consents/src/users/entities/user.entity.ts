import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeUpdate } from 'typeorm';
import { EventEntity } from '../../events/entities/event.entity';

/**
 * The Entity represents the shape of the
 * database table in Postgres. 
 */

@Entity({ name: "user" })
export class UserEntity {

  @PrimaryGeneratedColumn("uuid")
  userID: string;

  @Column()
  email: string;

  @Column("boolean", { default: false })
  previouslyGivenConsent: boolean = false;

  @Column("boolean", { default: false })
  smsNotificationsEnabled: boolean = false;

  @Column("boolean", { default: false })
  emailNotificationsEnabled: boolean = false;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastModifiedAt: Date;

  @OneToMany(type => EventEntity, Event => Event.userID)
  events: EventEntity[];

  @BeforeUpdate()
  updateTimestamp() {
    this.lastModifiedAt = new Date;
  }
}