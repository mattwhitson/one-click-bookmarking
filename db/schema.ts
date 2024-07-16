// import { relations } from "drizzle-orm";
// import { integer, pgTable, serial, text, boolean } from "drizzle-orm/pg-core";

// export const usersTable = pgTable("users", {
//   id: serial("id").primaryKey(),
//   userId: text("user_id").notNull(),
//   name: text("name").notNull(),
//   image: text("image").notNull(),
//   email: text("email").notNull().unique(),
// });

// export const usersRelations = relations(usersTable, ({ many }) => ({
//   posts: many(bookmarkTable),
// }));

// export const bookmarkTable = pgTable("bookmarks", {
//   id: serial("id").primaryKey(),
//   categories: text("category"),
//   url: text("url").notNull(),
//   favorite: boolean("boolean").notNull().default(false),
//   userId: integer("id")
//     .notNull()
//     .references(() => usersTable.id),
// });

// export const postsRelations = relations(bookmarkTable, ({ one }) => ({
//   user: one(usersTable),
// }));

import { relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(bookmarks),
}));

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    categories: text("category"),
    url: text("url").notNull(),
    favorite: boolean("boolean").notNull().default(false),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      userIdIndex: index("user_id_index").on(table.userId),
    };
  }
);

export const postsRelations = relations(bookmarks, ({ one }) => ({
  user: one(users),
}));

// O-Auth stuff
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);
