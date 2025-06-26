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



--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public."User" (userid, name, email, password, createdat) FROM stdin;
1	Gail Harrison	1@example.org	$2a$10$i2aWADQWjph9xQIza8P5tumy0fJVtg30zIPDjE.x1Ymn6R9fJ0TSa	2025-02-16 18:56:27
2	Michelle George	2@example.com	$2a$10$i2aWADQWjph9xQIza8P5tumy0fJVtg30zIPDjE.x1Ymn6R9fJ0TSa	2025-02-16 18:56:27
3	Mr. Scott Kim	3@example.org	$2a$10$i2aWADQWjph9xQIza8P5tumy0fJVtg30zIPDjE.x1Ymn6R9fJ0TSa	2025-02-16 18:56:27
4	John Shepard	4@example.org	$2a$10$i2aWADQWjph9xQIza8P5tumy0fJVtg30zIPDjE.x1Ymn6R9fJ0TSa	2025-02-16 18:56:27
5	Vincent Le	judy73@martinez.com	XokGnStqFZ7-	2024-07-23 16:53:44
6	Tyler Clayton	benjaminrichard@perry.info	qj=GjBOB79BC3	2023-08-17 02:32:49
7	Mary Hays	kavila@gmail.com	i49pu#ADjP5	2024-12-02 04:47:43
8	Tracy Sosa	cfox@arroyo.net	^IX58L=381EME	2025-01-05 11:39:01
9	Jason Sandoval	courtneybenitez@reynolds.com	@bgPu93dz0	2024-02-18 12:04:23
10	Charles Brown	philipkelly@gmail.com	D*tBe&g@UC4	2023-05-16 00:31:32
11	Tammy Wu	williammcdaniel@yahoo.com	E5kFT9ePko	2024-08-17 00:27:43
12	Michael Williams MD	harrisbrad@garcia-scott.org	*M3=JvyTzTD	2022-08-17 19:06:25
13	Daniel Lee	pmarks@yahoo.com	1N%g9!rDav	2024-03-31 18:33:34
14	Katherine Perry	colemichael@hernandez.com	eL*@tq9ry6	2024-03-03 09:41:13
15	Wendy Gonzales	lori29@castro.com	7lw0C+rt4LtiL	2025-01-20 15:34:54
16	Lawrence Silva	coxjill@gmail.com	nhyWAw0%Ks4	2024-09-11 03:02:35
17	Tiffany Duarte	amanda87@smith.com	&Wku=%&^=ZqW	2022-09-22 09:03:31
18	Gilbert Harris	katherine42@lee-lopez.net	53xz9fgYZj	2023-12-25 19:01:31
19	Samantha Ware	ypacheco@foster.biz	Ye9x92Lu7T	2022-08-28 11:46:54
20	Amanda Price	campbellallison@edwards-scott.biz	cSIk%rqPt*U	2024-11-29 01:36:54
21	Ashley Moran	jillian38@gmail.com	dX&CkQxTUn	2022-09-30 22:25:06
22	Allison Barrera	hodgesangelica@ruiz.org	^_+seql7U2T	2022-09-29 22:06:14
23	Justin Allison	kvaughan@smith.com	DBOhvLVw%pDf*	2022-10-27 15:41:08
24	Zachary Warren	chad74@yahoo.com	7=GjezJNjkG%-q	2023-08-25 00:46:57
25	Jessica Scott	zhangandrea@smith.info	T%@zFZdvNqxO	2022-09-21 20:37:18
26	Christy May	sherry06@yahoo.com	0io9Hm5Uv&jd	2022-06-19 19:12:19
27	Gregory Meyer	donna92@gmail.com	0#RP8U&UesoWf	2023-08-27 20:55:24
28	Lisa Ali	chenjames@mejia.biz	n+l9*2h=z24iH5	2023-12-17 11:08:24
29	Kyle Meadows	jeffrey53@shepherd-garcia.info	+A#D0vToSuq	2022-06-27 19:56:49
30	Vanessa Beck	michellefisher@gmail.com	oD8MB5@+bT	2023-10-09 10:31:13
31	Edward Phillips	jessica98@torres.com	3nAPG3*CFVy	2025-06-08 13:17:12
32	Mike Ortiz	smartinez@lee.com	9CaI2DxaaUAd2	2022-10-10 18:18:48
33	Joe Ingram	yburke@hotmail.com	ARhOQoskmo6	2023-12-15 08:21:54
34	Michael Fowler	mckeemichael@gmail.com	M47DaFW4zk-n	2024-01-11 03:27:26
35	Richard Sullivan	richardwatson@morris.com	v3mf8Sud-uYl#T	2022-11-08 20:12:59
36	Brandy Garcia	yortega@yahoo.com	Uo@ZvUrswf=j	2024-12-25 21:11:55
37	Robert Diaz	duartechad@hotmail.com	1qZ-@akBI3H	2024-02-13 00:37:40
38	Lori Webb	pauljohn@grant.net	2$$^V1jUODcST	2022-11-03 19:35:55
39	Samantha Green DDS	brockryan@hampton-wolfe.com	Tln1ICEMWrWgP	2023-05-24 05:55:16
40	Samantha Charles	lindseyjohn@yahoo.com	KOS87I-tLD4	2025-04-24 12:30:20
41	Terry Johnson	wpineda@gmail.com	yqCJ+SC_1+	2024-01-20 09:47:34
42	Christine Benson	danielbrooks@marsh-taylor.com	CUl=Buo!B6Ld	2024-08-30 22:05:54
43	Courtney Reed	thomasrodriguez@martinez.com	JYzVfo%2pSD!It	2022-07-27 07:28:30
44	Breanna Miller	jfranklin@gmail.com	UPK4vw7+VIHlx	2022-07-30 08:32:41
45	Joe Mason	aliciapatton@hotmail.com	mn!DiURcP6	2024-03-08 08:13:19
46	John Brown	josephjohn@knight.biz	INJqGmWPLW_d!g	2022-12-20 03:41:18
47	Stephen Gomez DVM	ohall@brooks.com	HWjRom#NWLT*9&	2023-05-30 08:27:05
48	Madison Ross DVM	dpeterson@yahoo.com	dddzHka#E&Zz=m	2023-03-12 05:09:58
49	Tammy Harmon	brightkatie@hotmail.com	bA-S6SPYr*	2024-05-19 20:19:22
50	Jacob Jenkins	matthew73@hotmail.com	kzq6*iZuugA2$	2023-08-27 03:13:22
51	Brian Green	ymartin@yahoo.com	mb4%45cVURb+4m	2023-08-31 11:22:14
52	Holly Rasmussen MD	amandasteele@lin.net	@tuV*qctUw*dJ	2024-04-11 17:41:25
53	Aaron Johnson	hoffmanmichelle@yahoo.com	-O7AQ#j*ob	2025-02-25 03:13:47
54	Christopher Little	rebeccaowens@phillips.net	xKOOO*C5R51fm	2022-08-29 01:36:49
55	Chad Summers	55@example.com	$2a$10$i2aWADQ	2025-02-16 18:56:27
56	Rachel Patel	56@example.com	Wjph9xQIza8P	2025-02-16 18:56:27
57	Todd Carpenter	57@example.org	5tumy0fJV	2025-02-16 18:56:27
58	Jasmine Ortega	58@example.net	Vtg30zIPDjE.	2025-02-16 18:56:27
59	Carlos Nguyen	59@example.org	E.x1Ymn6R9fJ0TSa	2025-02-16 18:56:27
60	Leah Morrison	60@example.com	i2aWADQWjph9x	2025-02-16 18:56:27
\.


--
-- Data for Name: course; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.course (courseid, name, code, description, startdate, enddate, createdby, createdat) FROM stdin;
1	Introduction to Public Policy	PPOL101	An overview of public policy processes, stakeholders, and outcomes. Students explore the formation and implementation of policy at various levels of government.	2025-02-16	2026-02-16	2	2025-02-16 18:56:34
2	Government and Politics	GOVT202	This course examines the structure and function of governments, the political process, and the role of citizens in democratic systems. Topics include elections, institutions, and political theory.	2025-02-16	2026-02-16	3	2025-02-16 18:56:34
3	Effective Communication Skills	COMM110	Focuses on developing clear and persuasive communication in both personal and professional settings. Includes verbal and non-verbal strategies, presentations, and active listening.	2025-02-16	2026-02-16	1	2025-02-16 18:56:34
4	Modern History and Society	HIST215	Explores key historical events of the 20th and 21st centuries and their impacts on contemporary society. Emphasis on critical thinking and historical interpretation.	2025-02-16	2026-02-16	2	2025-02-16 18:56:34
5	Fundamentals of Architecture	ARCH101	Introduces architectural design principles, materials, and construction basics. Students engage in hands-on activities to understand spatial planning and environmental design.	2025-02-16	2026-02-16	4	2025-02-16 18:56:34
6	Project Management Basics	PMGT100	Covers essential project management concepts including planning, scheduling, budgeting, and team coordination. Prepares students for entry-level roles or certification.	2025-02-16	2026-02-16	1	2025-02-16 18:56:34
\.


--
-- Data for Name: announcement; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.announcement (announcementid, courseid, title, content, createdby, createdat) FROM stdin;
1	1	Welcome to Public Policy	Welcome to the course! We will explore how public policy is developed and implemented.	2	2025-02-16 19:10:27
2	1	Reading Assignment Week 1	Please read Chapters 1 to 3 of the policy textbook before our next session.	2	2025-02-16 19:10:27
3	1	Case Study Discussion	Be prepared to discuss real-world policy cases in class. Participation is key.	2	2025-02-16 19:10:27
4	2	Course Overview	We cover the structure of government, political theory, and current issues.	3	2025-02-16 19:10:27
5	2	Exam Schedule Posted	The midterm and final exam dates are now available on the course portal.	3	2025-02-16 19:10:27
6	2	Debate Sign-Up	Students are required to sign up for one of the political debates next week.	3	2025-02-16 19:10:27
7	3	Welcome to Communication Skills	Excited to help you build strong communication and presentation skills.	1	2025-02-16 19:10:28
8	3	First Assignment Due	Your first speech outline is due next Monday. Submit it via the portal.	1	2025-02-16 19:10:28
9	3	Peer Feedback Sessions	This week we start giving feedback on your mock presentations. Come prepared.	1	2025-02-16 19:10:28
10	4	Course Introduction	We dive into key events shaping modern society through historical analysis.	2	2025-02-16 19:10:29
11	4	Reading List Uploaded	Check the course page for the full list of required readings.	2	2025-02-16 19:10:29
12	4	Group Project Topics Released	Select your topic for the group presentation by Friday.	2	2025-02-16 19:10:29
13	5	Welcome to Fundamentals of Architecture	This course will provide the basics of design, space planning, and materials.	4	2025-02-16 19:10:29
14	5	Studio Safety Guidelines	Please review the studio safety rules before the next practical session.	4	2025-02-16 19:10:29
15	5	Submission Deadlines	Update: All design sketches are due by next Wednesday. No extensions.	4	2025-02-16 19:10:29
16	6	Getting Started with Project Management	This course introduces project planning, scheduling, and leadership fundamentals.	1	2025-02-16 19:10:30
17	6	Project Team Assignments	Your project groups have been posted—check the announcements tab.	1	2025-02-16 19:10:30
18	6	Tool Demo This Week	This Thursday, we will demo tools like Gantt charts and time tracking apps.	1	2025-02-16 19:10:30
\.


--
-- Data for Name: assignment; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.assignment (assignmentid, title, description, duedate, resources, assignmenttype, gradereleased, defaultgrade, courseid, createdby, createdat) FROM stdin;
1	Policy Brief Submission	Submit a 2-page brief analyzing a recent public policy decision.	2026-03-15 23:59:00	test/sample_material.pdf	Online	f	0.00	1	2	2025-02-16 19:10:36
2	Midterm Essay: Role of Government	Write a 1500-word essay on the evolving role of federal governments in modern democracies.	2026-03-20 23:59:00	test/sample_material.pdf	Offline	f	0.00	2	3	2025-02-16 19:10:36
3	Presentation: Communication Styles	Prepare a 10-minute presentation comparing direct vs indirect communication styles.	2026-03-10 23:59:00	test/sample_material.pdf	Online	f	0.00	3	1	2025-02-16 19:10:36
4	Timeline of Historical Events	Create a timeline of key global events from 1945 to 2000 and analyze their social impact.	2026-03-18 23:59:00	test/sample_material.pdf	Offline	f	0.00	4	2	2025-02-16 19:10:36
5	Design Sketch Assignment	Submit a floor plan sketch for a single-room building using basic architectural conventions.	2026-03-25 23:59:00	test/sample_material.pdf	Offline	f	0.00	5	4	2025-02-16 19:10:36
6	Project Scope Document	Upload a project scope statement for a sample IT deployment project.	2026-03-12 23:59:00	test/sample_material.pdf	Online	f	0.00	6	1	2025-02-16 19:10:36
\.


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.comment (commentid, content, postedby, postedat, parentid, parenttype) FROM stdin;
1	This material really clarified the lecture.	5	2025-02-17 09:00:00	1	Material
2	Thanks for the resource! Can we get a version with notes?	7	2025-02-17 09:15:00	2	Material
3	Will the exam cover everything in this guide?	6	2025-02-18 10:30:00	3	Material
4	This announcement was really helpful, thanks!	4	2025-02-18 11:20:00	6	Announcement
5	Can we have a summary of key points in this announcement?	6	2025-02-18 12:00:00	7	Announcement
6	Is this assignment graded on a curve?	9	2025-02-19 08:45:00	1	Assignment
7	When will the solutions be released?	10	2025-02-19 09:10:00	2	Assignment
8	Good job on the submission! Very clear layout.	14	2025-02-19 10:30:00	1	Submission
9	I had trouble with formatting, how did you fix yours?	17	2025-02-19 11:00:00	1	Submission
10	Can TAs provide feedback on our drafts?	55	2025-02-20 08:00:00	1	Material
11	Looking forward to the review session.	60	2025-02-20 08:30:00	12	Material
12	Thanks for clarifying the deadline!	20	2025-02-20 09:00:00	10	Announcement
\.

--
-- Data for Name: courseparticipation; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.courseparticipation (userid, courseid, role, enrollmentdate) FROM stdin;
2	1	Professor	2025-02-16 18:56:34
5	1	student	2025-02-20 10:15:00
7	1	student	2025-02-20 10:15:00
9	1	student	2025-02-20 10:15:00
11	1	student	2025-02-20 10:15:00
14	1	student	2025-02-20 10:15:00
16	1	student	2025-02-20 10:15:00
17	1	student	2025-02-20 10:15:00
19	1	student	2025-02-20 10:15:00
20	1	student	2025-02-20 10:15:00
55  1   TA 2025-02-20 10:15:00
3	2	Professor	2025-02-16 18:56:34
4	2	student	2025-02-20 10:16:00
6	2	student	2025-02-20 10:16:00
8	2	student	2025-02-20 10:16:00
10	2	student	2025-02-20 10:16:00
12	2	student	2025-02-20 10:16:00
13	2	student	2025-02-20 10:16:00
18	2	student	2025-02-20 10:16:00
22	2	student	2025-02-20 10:16:00
23	2	student	2025-02-20 10:16:00
56  2   TA 2025-02-20 10:16:00
1	3	Professor	2025-02-16 18:56:34
6	3	student	2025-02-21 09:05:00
10	3	student	2025-02-21 09:05:00
12	3	student	2025-02-21 09:05:00
15	3	student	2025-02-21 09:05:00
17	3	student	2025-02-21 09:05:00
20	3	student	2025-02-21 09:05:00
22	3	student	2025-02-21 09:05:00
24	3	student	2025-02-21 09:05:00
25	3	student	2025-02-21 09:05:00
57  3   TA 2025-02-21 10:17:00
2	4	Professor	2025-02-16 18:56:34
5	4	student	2025-02-21 09:10:00
8	4	student	2025-02-21 09:10:00
11	4	student	2025-02-21 09:10:00
13	4	student	2025-02-21 09:10:00
15	4	student	2025-02-21 09:10:00
18	4	student	2025-02-21 09:10:00
21	4	student	2025-02-21 09:10:00
26	4	student	2025-02-21 09:10:00
28	4	student	2025-02-21 09:10:00
58  4   TA 2025-02-21 10:18:00
4	5	Professor	2025-02-16 18:56:34
1	5	student	2025-02-21 10:00:00
6	5	student	2025-02-21 10:00:00
7	5	student	2025-02-21 10:00:00
10	5	student	2025-02-21 10:00:00
13	5	student	2025-02-21 10:00:00
14	5	student	2025-02-21 10:00:00
16	5	student	2025-02-21 10:00:00
22	5	student	2025-02-21 10:00:00
29	5	student	2025-02-21 10:00:00
59  5   TA 2025-02-21 10:19:00
1	6	Professor	2025-02-16 18:56:34
5	6	student	2025-02-21 10:05:00
8	6	student	2025-02-21 10:05:00
11	6	student	2025-02-21 10:05:00
18	6	student	2025-02-21 10:05:00
20	6	student	2025-02-21 10:05:00
24	6	student	2025-02-21 10:05:00
26	6	student	2025-02-21 10:05:00
27	6	student	2025-02-21 10:05:00
30	6	student	2025-02-21 10:05:00
60  6   TA 2025-02-21 10:05:00
\.


--
-- Data for Name: submission; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.submission (submissionid, assignmentid, studentid, submitteddate, filepath) FROM stdin;
1	1	5	2026-03-14 14:10:00	test/sample_submission.pdf
2	1	6	2026-03-15 09:45:12	test/sample_submission.pdf
3	2	10	2026-03-19 18:20:43	test/sample_submission.pdf
4	2	12	2026-03-20 22:30:11	test/sample_submission.pdf
5	3	8	2026-03-09 13:05:20	test/sample_submission.pdf
6	3	9	2026-03-10 10:00:00	test/sample_submission.pdf
7	4	11	2026-03-17 16:55:40	test/sample_submission.pdf
8	4	13	2026-03-18 08:30:00	test/sample_submission.pdf
9	5	14	2026-03-24 19:44:22	test/sample_submission.pdf
10	5	15	2026-03-25 21:10:15	test/sample_submission.pdf
11	6	16	2026-03-11 17:00:00	test/sample_submission.pdf
12	6	17	2026-03-12 20:15:33	test/sample_submission.pdf
\.


--
-- Data for Name: grade; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.grade (gradeid, submissionid, gradeseq, score, feedback, gradedby, gradedat) FROM stdin;
1	1	1	85.00	Well-structured policy brief, shows strong analysis.	55	2026-03-16 08:30:00
2	2	1	78.50	Solid draft, but requires stronger argument in conclusion.	2	2026-03-16 10:15:00
3	3	1	92.00	Excellent essay with clear insights.	56	2026-03-20 09:00:00
4	4	1	68.00	Good attempt, needs better structure and clarity.	3	2026-03-20 23:50:00
5	5	1	88.00	Clear presentation with engaging examples.	55	2026-03-11 14:20:00
6	6	1	95.00	Outstanding timeline and analysis.	57	2026-03-17 11:45:00
7	7	1	82.00	Strong design sketch but lacks dimensions.	58	2026-03-24 16:10:00
8	8	1	90.00	Clean layout, meets all requirements.	4	2026-03-25 09:00:00
9	9	1	73.50	Solid collaboration, but documentation unclear.	59	2026-03-12 13:25:00
10	10	1	79.00	Good initial research; expand references.	4	2026-03-13 20:00:00
11	11	1	87.00	Nice use of tools and clear scope.	60	2026-03-12 22:00:00
12	12	1	91.00	Thorough report and professional format.	1	2026-03-13 08:00:00
\.

--
-- Data for Name: material; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.material (materialid, courseid, title, type, description, filepath, createdby, createdat) FROM stdin;
1	1	Introduction to Course	Lecture Notes	Course overview and objectives.	test/sample_material.pdf	2	2025-02-16 10:00:00
2	1	Setup Guide	Instructions	Environment setup and dependencies.	test/sample_material.pdf	55	2025-02-17 11:30:00
3	2	Week 1 Slides	Lecture Notes	Introduction to fundamental concepts.	test/sample_material.pdf	3	2025-02-16 10:10:00
4	2	Example Problems	Practice Set	Problems for self-study.	test/sample_material.pdf	56	2025-02-18 09:15:00
5	3	Lab Manual	Lab Notes	Instructions for Lab 1 experiments.	test/sample_material.pdf	1	2025-02-17 12:00:00
6	3	Reading List	Reference	Required and recommended readings.	test/sample_material.pdf	57	2025-02-18 13:40:00
7	4	Project Guidelines	Project	Structure, expectations, and grading.	test/sample_material.pdf	2	2025-02-16 14:00:00
8	4	Workshop Notes	Workshop	Summary of hands-on session.	test/sample_material.pdf	58	2025-02-19 15:10:00
9	5	Research Methods	Reading	Approaches to data collection.	test/sample_material.pdf	4	2025-02-17 09:30:00
10	5	Assignment Templates	Template	Starter files for assignments.	test/sample_material.pdf	59	2025-02-19 16:20:00
11	6	Final Review Slides	Review	Overview of exam topics.	test/sample_material.pdf	1	2025-02-20 11:00:00
12	6	Help Session Recording	Recording	Q&A session with TAs.	test/sample_material.pdf	60	2025-02-21 14:00:00
\.


--
-- Name: User_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public."User_userid_seq"', 115, true);


--
-- Name: announcement_announcementid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.announcement_announcementid_seq', 25, true);


--
-- Name: assignment_assignmentid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.assignment_assignmentid_seq', 25, true);


--
-- Name: comment_commentid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.comment_commentid_seq', 6134, true);


--
-- Name: course_courseid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.course_courseid_seq', 5, true);


--
-- Name: grade_gradeid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.grade_gradeid_seq', 9537, true);


--
-- Name: material_materialid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.material_materialid_seq', 25, true);


--
-- Name: submission_submissionid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.submission_submissionid_seq', 5248, true);


--
-- PostgreSQL database dump complete
--

