--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public."User" (
    userid integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    createdat timestamp without time zone
);


ALTER TABLE public."User" OWNER TO avnadmin;

--
-- Name: User_userid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public."User_userid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_userid_seq" OWNER TO avnadmin;

--
-- Name: User_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public."User_userid_seq" OWNED BY public."User".userid;


--
-- Name: announcement; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.announcement (
    announcementid integer NOT NULL,
    courseid integer NOT NULL,
    title character varying(100) NOT NULL,
    content text,
    createdby integer,
    createdat timestamp without time zone
);


ALTER TABLE public.announcement OWNER TO avnadmin;

--
-- Name: announcement_announcementid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.announcement_announcementid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcement_announcementid_seq OWNER TO avnadmin;

--
-- Name: announcement_announcementid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.announcement_announcementid_seq OWNED BY public.announcement.announcementid;


--
-- Name: assignment; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.assignment (
    assignmentid integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    duedate timestamp without time zone,
    resources text,
    assignmenttype character varying(50),
    gradereleased boolean,
    defaultgrade numeric(5,2),
    courseid integer NOT NULL,
    createdby integer,
    createdat timestamp without time zone
);


ALTER TABLE public.assignment OWNER TO avnadmin;

--
-- Name: assignment_assignmentid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.assignment_assignmentid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_assignmentid_seq OWNER TO avnadmin;

--
-- Name: assignment_assignmentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.assignment_assignmentid_seq OWNED BY public.assignment.assignmentid;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.comment (
    commentid integer NOT NULL,
    content text NOT NULL,
    postedby integer,
    postedat timestamp without time zone,
    parentid integer,
    parenttype character varying(50)
);


ALTER TABLE public.comment OWNER TO avnadmin;

--
-- Name: comment_commentid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.comment_commentid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_commentid_seq OWNER TO avnadmin;

--
-- Name: comment_commentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.comment_commentid_seq OWNED BY public.comment.commentid;


--
-- Name: course; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.course (
    courseid integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    startdate date,
    enddate date,
    createdby integer,
    createdat timestamp without time zone
);


ALTER TABLE public.course OWNER TO avnadmin;

--
-- Name: course_courseid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.course_courseid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_courseid_seq OWNER TO avnadmin;

--
-- Name: course_courseid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.course_courseid_seq OWNED BY public.course.courseid;


--
-- Name: courseparticipation; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.courseparticipation (
    userid integer NOT NULL,
    courseid integer NOT NULL,
    role character varying(50),
    enrollmentdate timestamp without time zone
);


ALTER TABLE public.courseparticipation OWNER TO avnadmin;

--
-- Name: grade; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.grade (
    gradeid integer NOT NULL,
    submissionid integer NOT NULL,
    gradeseq integer NOT NULL,
    score numeric(5,2),
    feedback text,
    gradedby integer,
    gradedat timestamp without time zone
);


ALTER TABLE public.grade OWNER TO avnadmin;

--
-- Name: grade_gradeid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.grade_gradeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grade_gradeid_seq OWNER TO avnadmin;

--
-- Name: grade_gradeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.grade_gradeid_seq OWNED BY public.grade.gradeid;


--
-- Name: material; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.material (
    materialid integer NOT NULL,
    courseid integer NOT NULL,
    title character varying(100) NOT NULL,
    type character varying(100) NOT NULL,
    description text,
    filepath character varying(255),
    createdby integer,
    createdat timestamp without time zone
);


ALTER TABLE public.material OWNER TO avnadmin;

--
-- Name: material_materialid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.material_materialid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_materialid_seq OWNER TO avnadmin;

--
-- Name: material_materialid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.material_materialid_seq OWNED BY public.material.materialid;


--
-- Name: submission; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.submission (
    submissionid integer NOT NULL,
    assignmentid integer NOT NULL,
    studentid integer NOT NULL,
    submitteddate timestamp without time zone,
    filepath text
);


ALTER TABLE public.submission OWNER TO avnadmin;

--
-- Name: submission_submissionid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.submission_submissionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submission_submissionid_seq OWNER TO avnadmin;

--
-- Name: submission_submissionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.submission_submissionid_seq OWNED BY public.submission.submissionid;


--
-- Name: User userid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public."User" ALTER COLUMN userid SET DEFAULT nextval('public."User_userid_seq"'::regclass);


--
-- Name: announcement announcementid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.announcement ALTER COLUMN announcementid SET DEFAULT nextval('public.announcement_announcementid_seq'::regclass);


--
-- Name: assignment assignmentid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.assignment ALTER COLUMN assignmentid SET DEFAULT nextval('public.assignment_assignmentid_seq'::regclass);


--
-- Name: comment commentid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comment ALTER COLUMN commentid SET DEFAULT nextval('public.comment_commentid_seq'::regclass);


--
-- Name: course courseid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.course ALTER COLUMN courseid SET DEFAULT nextval('public.course_courseid_seq'::regclass);


--
-- Name: grade gradeid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.grade ALTER COLUMN gradeid SET DEFAULT nextval('public.grade_gradeid_seq'::regclass);


--
-- Name: material materialid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.material ALTER COLUMN materialid SET DEFAULT nextval('public.material_materialid_seq'::regclass);


--
-- Name: submission submissionid; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.submission ALTER COLUMN submissionid SET DEFAULT nextval('public.submission_submissionid_seq'::regclass);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (userid);


--
-- Name: announcement announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT announcement_pkey PRIMARY KEY (announcementid);


--
-- Name: assignment assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (assignmentid);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (commentid);


--
-- Name: course course_code_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT course_code_key UNIQUE (code);


--
-- Name: course course_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (courseid);


--
-- Name: courseparticipation courseparticipation_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.courseparticipation
    ADD CONSTRAINT courseparticipation_pkey PRIMARY KEY (userid, courseid);


--
-- Name: grade grade_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT grade_pkey PRIMARY KEY (gradeid);


--
-- Name: grade grade_submissionid_gradeseq_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT grade_submissionid_gradeseq_key UNIQUE (submissionid, gradeseq);


--
-- Name: material material_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT material_pkey PRIMARY KEY (materialid);


--
-- Name: submission submission_assignmentid_studentid_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_assignmentid_studentid_key UNIQUE (assignmentid, studentid);


--
-- Name: submission submission_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_pkey PRIMARY KEY (submissionid);


--
-- Name: announcement fkannouncementcourse; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT fkannouncementcourse FOREIGN KEY (courseid) REFERENCES public.course(courseid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: announcement fkannouncementcreatedby; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT fkannouncementcreatedby FOREIGN KEY (createdby) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assignment fkassignmentcourse; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT fkassignmentcourse FOREIGN KEY (courseid) REFERENCES public.course(courseid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignment fkassignmentcreatedby; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT fkassignmentcreatedby FOREIGN KEY (createdby) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comment fkcommentuser; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT fkcommentuser FOREIGN KEY (postedby) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: course fkcoursecreatedby; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT fkcoursecreatedby FOREIGN KEY (createdby) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courseparticipation fkcourseparticipationcourse; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.courseparticipation
    ADD CONSTRAINT fkcourseparticipationcourse FOREIGN KEY (courseid) REFERENCES public.course(courseid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courseparticipation fkcourseparticipationuser; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.courseparticipation
    ADD CONSTRAINT fkcourseparticipationuser FOREIGN KEY (userid) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade fkgradegradedby; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT fkgradegradedby FOREIGN KEY (gradedby) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: grade fkgradesubmission; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT fkgradesubmission FOREIGN KEY (submissionid) REFERENCES public.submission(submissionid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: material fkmaterialcourse; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT fkmaterialcourse FOREIGN KEY (courseid) REFERENCES public.course(courseid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: material fkmaterialcreatedby; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT fkmaterialcreatedby FOREIGN KEY (createdby) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submission fksubmissionassignment; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.submission
    ADD CONSTRAINT fksubmissionassignment FOREIGN KEY (assignmentid) REFERENCES public.assignment(assignmentid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: submission fksubmissionstudent; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.submission
    ADD CONSTRAINT fksubmissionstudent FOREIGN KEY (studentid) REFERENCES public."User"(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

