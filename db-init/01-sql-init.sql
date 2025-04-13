-- -------------------------------------------------------------
-- TablePlus 6.4.4(604)
--
-- https://tableplus.com/
--
-- Database: myclassroomdb
-- Generation Time: 2025-04-13 23:05:02.8170
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS announcement_announcementid_seq;

-- Table Definition
CREATE TABLE "public"."announcement" (
    "announcementid" int4 NOT NULL DEFAULT nextval('announcement_announcementid_seq'::regclass),
    "courseid" int4 NOT NULL,
    "title" varchar(100) NOT NULL,
    "content" text,
    "createdby" int4,
    "createdat" timestamp,
    PRIMARY KEY ("announcementid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS assignment_assignmentid_seq;

-- Table Definition
CREATE TABLE "public"."assignment" (
    "assignmentid" int4 NOT NULL DEFAULT nextval('assignment_assignmentid_seq'::regclass),
    "title" varchar(255) NOT NULL,
    "description" text,
    "duedate" timestamp,
    "resources" text,
    "assignmenttype" varchar(50),
    "gradereleased" bool,
    "defaultgrade" numeric(5,2),
    "courseid" int4 NOT NULL,
    "createdby" int4,
    "createdat" timestamp,
    PRIMARY KEY ("assignmentid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS comment_commentid_seq;

-- Table Definition
CREATE TABLE "public"."comment" (
    "commentid" int4 NOT NULL DEFAULT nextval('comment_commentid_seq'::regclass),
    "content" text NOT NULL,
    "postedby" int4,
    "postedat" timestamp,
    "parentid" int4,
    "parenttype" varchar(50),
    PRIMARY KEY ("commentid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS course_courseid_seq;

-- Table Definition
CREATE TABLE "public"."course" (
    "courseid" int4 NOT NULL DEFAULT nextval('course_courseid_seq'::regclass),
    "name" varchar(100) NOT NULL,
    "code" varchar(50) NOT NULL,
    "description" text,
    "startdate" date,
    "enddate" date,
    "createdby" int4,
    "createdat" timestamp,
    PRIMARY KEY ("courseid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."courseparticipation" (
    "userid" int4 NOT NULL,
    "courseid" int4 NOT NULL,
    "role" varchar(50),
    "enrollmentdate" timestamp,
    PRIMARY KEY ("userid","courseid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS grade_gradeid_seq;

-- Table Definition
CREATE TABLE "public"."grade" (
    "gradeid" int4 NOT NULL DEFAULT nextval('grade_gradeid_seq'::regclass),
    "submissionid" int4 NOT NULL,
    "gradeseq" int4 NOT NULL,
    "score" numeric(5,2),
    "feedback" text,
    "gradedby" int4,
    "gradedat" timestamp,
    PRIMARY KEY ("gradeid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS material_materialid_seq;

-- Table Definition
CREATE TABLE "public"."material" (
    "materialid" int4 NOT NULL DEFAULT nextval('material_materialid_seq'::regclass),
    "courseid" int4 NOT NULL,
    "title" varchar(100) NOT NULL,
    "type" varchar(100) NOT NULL,
    "description" text,
    "filepath" varchar(255),
    "createdby" int4,
    "createdat" timestamp,
    PRIMARY KEY ("materialid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS submission_submissionid_seq;

-- Table Definition
CREATE TABLE "public"."submission" (
    "submissionid" int4 NOT NULL DEFAULT nextval('submission_submissionid_seq'::regclass),
    "assignmentid" int4 NOT NULL,
    "studentid" int4 NOT NULL,
    "submitteddate" timestamp,
    "filepath" text,
    PRIMARY KEY ("submissionid")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS "User_userid_seq";

-- Table Definition
CREATE TABLE "public"."User" (
    "userid" int4 NOT NULL DEFAULT nextval('"User_userid_seq"'::regclass),
    "name" varchar(100) NOT NULL,
    "email" varchar(100) NOT NULL,
    "password" varchar(255) NOT NULL,
    "createdat" timestamp,
    PRIMARY KEY ("userid")
);

ALTER TABLE "public"."announcement" ADD FOREIGN KEY ("createdby") REFERENCES "public"."User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."announcement" ADD FOREIGN KEY ("courseid") REFERENCES "public"."course"("courseid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."assignment" ADD FOREIGN KEY ("courseid") REFERENCES "public"."course"("courseid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."assignment" ADD FOREIGN KEY ("createdby") REFERENCES "public"."User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."comment" ADD FOREIGN KEY ("postedby") REFERENCES "public"."User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."course" ADD FOREIGN KEY ("createdby") REFERENCES "public"."User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;


-- Indices
CREATE UNIQUE INDEX course_code_key ON public.course USING btree (code);
ALTER TABLE "public"."courseparticipation" ADD FOREIGN KEY ("userid") REFERENCES "public"."User"("userid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."courseparticipation" ADD FOREIGN KEY ("courseid") REFERENCES "public"."course"("courseid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."grade" ADD FOREIGN KEY ("gradedby") REFERENCES "public"."User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."grade" ADD FOREIGN KEY ("submissionid") REFERENCES "public"."submission"("submissionid") ON DELETE CASCADE ON UPDATE CASCADE;


-- Indices
CREATE UNIQUE INDEX grade_submissionid_gradeseq_key ON public.grade USING btree (submissionid, gradeseq);
ALTER TABLE "public"."material" ADD FOREIGN KEY ("createdby") REFERENCES "public"."User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."material" ADD FOREIGN KEY ("courseid") REFERENCES "public"."course"("courseid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."submission" ADD FOREIGN KEY ("assignmentid") REFERENCES "public"."assignment"("assignmentid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."submission" ADD FOREIGN KEY ("studentid") REFERENCES "public"."User"("userid") ON DELETE CASCADE ON UPDATE CASCADE;


-- Indices
CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
