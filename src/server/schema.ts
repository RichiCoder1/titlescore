import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  customType,
  primaryKey,
} from "drizzle-orm/sqlite-core";

const datetime = customType<{ data: Date; driverData: string }>({
  dataType() {
    return "TEXT";
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
});

export const contests = sqliteTable("contests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").default(""),
  creatorId: text("creator_id").notNull(),
  startsAt: datetime("starts_at").notNull(),
  endsAt: datetime("ends_at").notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const contestants = sqliteTable("contestants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contestId: integer("contest_id")
    .notNull()
    .references(() => contests.id),
  name: text("name").notNull(),
  stageName: text("stage_name").notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const criteria = sqliteTable("criteria", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contestId: integer("contest_id")
    .notNull()
    .references(() => contests.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  weight: integer("weight").notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const scores = sqliteTable(
  "scores",
  {
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.id),
    contestantId: integer("contestant_id").notNull(),
    criteriaId: integer("criteria_id")
      .notNull()
      .references(() => criteria.contestId),
    score: integer("score").notNull().default(0),
    comment: text("comment").notNull().default(""),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey(table.contestId, table.contestantId, table.criteriaId),
  })
);
