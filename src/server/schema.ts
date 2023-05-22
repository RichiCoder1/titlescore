import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, customType, primaryKey } from 'drizzle-orm/sqlite-core';

const datetime = customType<{ data: Date; driverData: string }>({
    dataType() {
        return 'TEXT';
    },
    fromDriver(value: string): Date {
        return new Date(value);
    },
});

export const contest = sqliteTable('contests', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    creatorId: text('creator_id').notNull(),
    startsAt: datetime('starts_at').notNull(),
    endsAt: datetime('ends_at').notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});

export const contestant = sqliteTable('contestants', {
    contest_id: integer('contest_id')
        .notNull()
        .references(() => contest.id),
    name: text('name').notNull(),
    stageName: text('stage_name').notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});

export const criteria = sqliteTable('criteria', {
  contest_id: integer('contest_id')
      .notNull()
      .references(() => contest.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  weight: integer('weight').notNull(),
  createdAt: datetime('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
});

export const score = sqliteTable('scores', {
  contest_id: integer('contest_id')
      .notNull()
      .references(() => contest.id),
  contestant_id: integer('contestant_id')
      .notNull(),
  criteria_id: integer('criteria_id')
      .notNull()
      .references(() => criteria.contest_id),
  score: integer('score').notNull().default(0),
  comment: text('comment').notNull().default(''),
  createdAt: datetime('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
}, table => ({
  pk: primaryKey(table.contest_id, table.contestant_id, table.criteria_id)
}));