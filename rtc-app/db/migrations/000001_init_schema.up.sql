CREATE TABLE "users" (
  "id" serial NOT NULL,
  "username" varchar UNIQUE PRIMARY KEY NOT NULL,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "middle_name" varchar,
  "email" varchar UNIQUE NOT NULL,
  "hashed_password" varchar NOT NULL,
  "quote" varchar(200),
  "bio" varchar(200),
  "date_of_birth" date NOT NULL,
  "avatar" varchar NOT NULL,
  "banner" varchar,
  "profile_complete" BOOLEAN NOT NULL DEFAULT 'false', 
  "password_changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z',
  "created_at" timestamptz NOT NULL DEFAULT 'now()',
  "updated_at" timestamptz NOT NULL DEFAULT 'now()'
);

CREATE TABLE "meets" (
  "id" varchar PRIMARY KEY,
  "title" varchar,
  "description" varchar,
  "recording" varchar,
  "author" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT 'now()',
  "updated_at" timestamptz NOT NULL DEFAULT 'now()'
);

CREATE INDEX ON "users" ("username");

CREATE INDEX ON "meets" ("id");

ALTER TABLE "meets" ADD CONSTRAINT "user_meets" FOREIGN KEY ("author") REFERENCES "users" ("username");