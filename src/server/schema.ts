import { relations } from "drizzle-orm";
import {
  integer,
  text,
  primaryKey,
  pgTable,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const contests = pgTable("contests", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").default(""),
  creatorId: text("creator_id").notNull(),
  startsAt: date("starts_at").notNull(),
  endsAt: date("ends_at").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contestMembers = pgTable(
  "contest_members",
  {
    userId: text("user_id").notNull(),
    contestId: text("contest_id").notNull(),
    displayName: text("display_name").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.contestId),
  })
);

export const contestants = pgTable("contestants", {
  id: text("id").primaryKey(),
  contestId: text("contest_id")
    .notNull()
    .references(() => contests.id),
  name: text("name").notNull(),
  stageName: text("stage_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const criteria = pgTable("criteria", {
  id: text("id").primaryKey(),
  contestId: text("contest_id")
    .notNull()
    .references(() => contests.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  weight: integer("weight").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scores = pgTable(
  "scores",
  {
    contestId: text("contest_id")
      .notNull()
      .references(() => contests.id),
    contestantId: text("contestant_id")
      .notNull()
      .references(() => contestants.id),
    criteriaId: text("criteria_id")
      .notNull()
      .references(() => criteria.id),
    judgeId: text("judge_id").notNull(),
    score: integer("score").default(0),
    comment: text("comment").default(""),
    submittedAt: timestamp("submitted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.judgeId, table.contestantId, table.criteriaId),
  })
);

export const scoreRelations = relations(scores, ({ one }) => ({
  judge: one(contestMembers, {
    fields: [scores.judgeId],
    references: [contestMembers.userId],
  }),
  contestant: one(contestants, {
    fields: [scores.contestantId],
    references: [contestants.id],
  }),
}));

export const contestantRelations = relations(contestants, ({ many }) => ({
  scores: many(scores),
}));

export const judgeRelations = relations(contestMembers, ({ many }) => ({
  scores: many(scores),
}));
