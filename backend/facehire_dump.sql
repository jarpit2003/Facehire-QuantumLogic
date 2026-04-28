--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    resume_score double precision,
    test_score double precision,
    interview_score double precision,
    hr_interview_score double precision,
    final_score double precision,
    resume_weight integer NOT NULL,
    test_weight integer NOT NULL,
    stage character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    matched_skills json,
    missing_skills json,
    applied_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    resume_text text
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: hr_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hr_users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hr_users OWNER TO postgres;

--
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    job_id uuid NOT NULL,
    application_id uuid,
    round_number integer NOT NULL,
    interviewer_id uuid,
    status character varying(50) NOT NULL,
    scheduled_at timestamp with time zone,
    meet_link character varying(500),
    notes text,
    score double precision,
    feedback text
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    form_url character varying(1000),
    published_platforms json,
    created_by uuid,
    deadline timestamp with time zone,
    status character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, job_id, candidate_id, resume_score, test_score, interview_score, hr_interview_score, final_score, resume_weight, test_weight, stage, status, matched_skills, missing_skills, applied_at, updated_at) FROM stdin;
f5d4bfb3-4e92-4fc3-b017-1e7adc9b13ec	4f4a1a6f-ae23-442c-9136-766616d1e28c	58af9a93-542e-4ac5-b559-8b2a51edcaca	36	\N	\N	\N	36	60	40	applied	active	[]	["FastAPI"]	2026-04-22 12:16:53.071398+05:30	2026-04-22 12:16:53.071398+05:30
b02f51c9-70b6-4fcf-a2be-9462e44ac297	4f4a1a6f-ae23-442c-9136-766616d1e28c	e664aa8b-593c-48ad-8da7-a073ff84739b	37	\N	\N	\N	37	60	40	applied	active	[]	["FastAPI"]	2026-04-22 12:16:58.162832+05:30	2026-04-22 12:16:58.162832+05:30
ebbee9f5-33dd-4924-b343-b0370461c64b	4f4a1a6f-ae23-442c-9136-766616d1e28c	9f106094-fd0d-47a7-bf73-d46f9d4cc755	46	\N	\N	\N	46	60	40	applied	active	[]	["FastAPI"]	2026-04-22 12:17:00.850752+05:30	2026-04-22 12:17:00.850752+05:30
9202950a-0af2-4704-9fbe-1529b5cc5283	4f4a1a6f-ae23-442c-9136-766616d1e28c	b365957e-6b1b-4b36-a496-db7bca6ec07a	72	\N	\N	\N	72	60	40	interview_1	active	["FastAPI"]	[]	2026-04-22 12:16:55.471695+05:30	2026-04-22 12:18:21.523917+05:30
3bd830ca-6c1f-44af-8fb9-d2547d8b4f71	4f901170-b7da-49e2-ba57-9472b81736da	b365957e-6b1b-4b36-a496-db7bca6ec07a	32	\N	\N	\N	32	60	40	applied	active	[]	["Spring Boot", "Node.js"]	2026-04-22 12:24:33.362251+05:30	2026-04-22 12:24:33.362251+05:30
e6706b80-9a93-435a-afe0-766db9a35bfc	4f901170-b7da-49e2-ba57-9472b81736da	58af9a93-542e-4ac5-b559-8b2a51edcaca	32	\N	\N	\N	32	60	40	applied	active	[]	["Spring Boot", "Node.js"]	2026-04-22 12:24:41.01683+05:30	2026-04-22 12:24:41.01683+05:30
f0c7bd02-ee53-4f6c-a28c-8728dc7a71ed	4f901170-b7da-49e2-ba57-9472b81736da	9f106094-fd0d-47a7-bf73-d46f9d4cc755	63	\N	\N	\N	63	60	40	rejected	rejected	["Node.js"]	["Spring Boot"]	2026-04-22 12:24:38.437011+05:30	2026-04-22 13:41:48.926312+05:30
b0f5543e-7d24-4703-a47b-e214d8de950c	a017495f-e8f1-4a20-942d-4ece179fd9a4	b365957e-6b1b-4b36-a496-db7bca6ec07a	31	\N	78	\N	49.8	60	40	interview_1	active	[]	["Spring Boot"]	2026-04-27 12:17:51.863004+05:30	2026-04-27 12:25:33.431189+05:30
b4a35ac7-b605-484b-94e5-73092ffc99ab	4f901170-b7da-49e2-ba57-9472b81736da	e664aa8b-593c-48ad-8da7-a073ff84739b	34	19	\N	\N	28	60	40	interview_1	active	[]	["Spring Boot", "Node.js"]	2026-04-22 12:24:35.852164+05:30	2026-04-22 13:59:28.070609+05:30
2d95a9d2-f5d6-4765-909b-351b52bbab10	4f901170-b7da-49e2-ba57-9472b81736da	58af9a93-542e-4ac5-b559-8b2a51edcaca	32	\N	\N	\N	32	60	40	test_sent	active	[]	["Spring Boot", "Node.js"]	2026-04-22 12:24:30.890852+05:30	2026-04-22 14:19:54.884765+05:30
fa467137-26ef-438f-8de8-b84ba41badb3	7a9b790c-042d-4502-ae7a-65ad5a33c76b	58af9a93-542e-4ac5-b559-8b2a51edcaca	31	\N	\N	\N	31	60	40	applied	active	[]	["CNN", "LangChain"]	2026-04-23 12:39:09.176308+05:30	2026-04-23 12:39:09.176308+05:30
c4a4e3ff-59de-4f88-8ebd-f572c4d745bc	7a9b790c-042d-4502-ae7a-65ad5a33c76b	e664aa8b-593c-48ad-8da7-a073ff84739b	31	\N	\N	\N	31	60	40	applied	active	[]	["CNN", "LangChain"]	2026-04-23 12:39:14.527118+05:30	2026-04-23 12:39:14.527118+05:30
71f3d690-7cc3-4faf-8f02-4e0136564ffc	7a9b790c-042d-4502-ae7a-65ad5a33c76b	9f106094-fd0d-47a7-bf73-d46f9d4cc755	42	\N	5	\N	27.2	60	40	interview_1	active	[]	["CNN", "LangChain"]	2026-04-23 12:39:16.948236+05:30	2026-04-23 13:08:44.543024+05:30
4c24f2e7-0706-4d3b-9935-6754cb614171	7a9b790c-042d-4502-ae7a-65ad5a33c76b	b365957e-6b1b-4b36-a496-db7bca6ec07a	51	54	\N	\N	52.2	60	40	rejected	rejected	["LangChain"]	["CNN"]	2026-04-23 12:39:11.754419+05:30	2026-04-23 17:43:10.249521+05:30
11e4fe0c-c1de-4cf3-9535-ae0caf2d5c89	a017495f-e8f1-4a20-942d-4ece179fd9a4	58af9a93-542e-4ac5-b559-8b2a51edcaca	61	\N	\N	\N	61	60	40	applied	active	["Python", "C++"]	["Spring Boot"]	2026-04-24 16:22:23.241843+05:30	2026-04-24 16:22:23.241843+05:30
5335f60b-62d4-4951-8647-826bce58293d	a017495f-e8f1-4a20-942d-4ece179fd9a4	e664aa8b-593c-48ad-8da7-a073ff84739b	62	\N	\N	\N	62	60	40	applied	active	["Python", "C++"]	["Spring Boot"]	2026-04-24 16:22:29.11585+05:30	2026-04-24 16:22:29.11585+05:30
ded7cadc-ee7f-4fa5-870e-d1a5485eb389	a017495f-e8f1-4a20-942d-4ece179fd9a4	9f106094-fd0d-47a7-bf73-d46f9d4cc755	60	\N	\N	\N	60	60	40	applied	active	["C++"]	["Python", "Spring Boot"]	2026-04-24 16:22:31.673922+05:30	2026-04-24 16:22:31.673922+05:30
2c44b046-06d1-4c62-b60d-810ebdfc561a	a017495f-e8f1-4a20-942d-4ece179fd9a4	b365957e-6b1b-4b36-a496-db7bca6ec07a	62	78	\N	\N	68.4	60	40	tested	active	["Python", "C++"]	["Spring Boot"]	2026-04-24 16:22:26.632744+05:30	2026-04-24 16:24:04.203172+05:30
d4f78527-07a6-41e1-ac59-0b7263fef65c	a017495f-e8f1-4a20-942d-4ece179fd9a4	58af9a93-542e-4ac5-b559-8b2a51edcaca	32	\N	\N	\N	32	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:17:48.791214+05:30	2026-04-27 12:17:48.791214+05:30
082c0c8d-8dd9-412a-983d-af46e3e62bb5	a017495f-e8f1-4a20-942d-4ece179fd9a4	e664aa8b-593c-48ad-8da7-a073ff84739b	33	\N	\N	\N	33	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:17:54.510081+05:30	2026-04-27 12:17:54.510081+05:30
61e18e2b-922e-4b8f-b130-142003b2a6d9	a017495f-e8f1-4a20-942d-4ece179fd9a4	9f106094-fd0d-47a7-bf73-d46f9d4cc755	44	\N	\N	\N	44	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:17:57.2673+05:30	2026-04-27 12:17:57.2673+05:30
5b444579-6e23-4039-88c0-085f7df3a4c8	a017495f-e8f1-4a20-942d-4ece179fd9a4	58af9a93-542e-4ac5-b559-8b2a51edcaca	32	\N	\N	\N	32	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:19:43.036934+05:30	2026-04-27 12:19:43.036934+05:30
61550d71-98c7-4a29-bc45-4aac2d56e611	a017495f-e8f1-4a20-942d-4ece179fd9a4	b365957e-6b1b-4b36-a496-db7bca6ec07a	31	\N	\N	\N	31	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:19:45.842002+05:30	2026-04-27 12:19:45.842002+05:30
e96653da-0e88-4fca-9f1b-27199b3a6fba	a017495f-e8f1-4a20-942d-4ece179fd9a4	e664aa8b-593c-48ad-8da7-a073ff84739b	33	\N	\N	\N	33	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:19:49.346+05:30	2026-04-27 12:19:49.346+05:30
faf07159-7416-44df-a15f-2caf8d1af789	a017495f-e8f1-4a20-942d-4ece179fd9a4	9f106094-fd0d-47a7-bf73-d46f9d4cc755	44	\N	\N	\N	44	60	40	applied	active	[]	["Spring Boot"]	2026-04-27 12:19:52.178649+05:30	2026-04-27 12:19:52.178649+05:30
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, full_name, email, phone, resume_text) FROM stdin;
58af9a93-542e-4ac5-b559-8b2a51edcaca	RELEV ANT COURSEWORK	be22@thapar.edu	+91-78142-92589	Anshul Mahajan amahajan2 be22@thapar.edu | +91-78142-92589 | Git Hub | Linked In | Leet Code\nEDUCATION\nB.E. in Computer Science , Thapar Institute of Engineering and Technology CGPA: 7.29 2022-2026\nClass XII, DAV Senior Secondary School, Qadian, Gurdaspur 98% 2022\nEXPERIENCE\nSoftware Development Intern, KOMPTE Sportech Pvt. Ltd. Jun 2025 - Jul 2025\n- Developed and optimized backend software modules in Python, C++, and SQL , improving execution efficiency by 20%.\n- Designed, tested, and deployed
b365957e-6b1b-4b36-a496-db7bca6ec07a	temp DeepResume (1)	pekumardeep2003@gmail.com	8278279630	Deep\n/envel pekumardeep2003@gmail.com | phone8278279630 | /linkedinlinkedin | /github Deep841 | /gl be Portfolio\nEducation\nThapar Institute of Engineering & Technology, Patiala Aug 2024 - May 2026\nMaster of Computer Applications (MCA) CGPA: 8.53\nKurukshetra University, Kurukshetra Aug 2021 - July 2024\nBachelor of Science (B.Sc.) Percentage: 64.2%\nExperience\nTrainee Software Engineer | Mphasis Limited Feb 2026 - Present\n- Training in MG Python 2026 batch; working with Python (Pandas, Num Py), dat
e664aa8b-593c-48ad-8da7-a073ff84739b	SAKSHAM KUMAR JHA	sakshamjhakumar004@gmail.com	+91 83604-85813	SAKSHAM KUMAR JHA\n/ne+91 83604-85813 sakshamjhakumar004@gmail.com / nedn Linkedin\nEducation\nCourse Year Institute CGPA/%\nB.E. Electronics & Computer Engg. 2022-2026 Thapar Institute of Engg. & Tech., Patiala 7.42 CGPA\nSenior Secondary (Class XII) 2020-2022 Govt. Model Sr. Sec. School, Chandigarh 88.4%\nSecondary (Class X) 2019-2020 St. Soldier Intl. Convent School, Mohali 91.8%\nTechnical\nSkills\nProgramming Languages: C, C++, SQL, Python\nWeb Technologies: HTML, CSS, Java Script, React.js\nSoftware
9f106094-fd0d-47a7-bf73-d46f9d4cc755	Toshar Bhardwaj	petosharbhardwaj10@gmail.com	6283960150	Toshar Bhardwaj\n phone6283960150 /envel petosharbhardwaj10@gmail.com /linkedinlinkedin.com / in / toshar10 /githubgithub.com / Tx Vegeta\nEducation\nThapar Institute of Engineering and T echnology Aug 2022 - June 2026\nBachelor of Technology in Computer Engineering Patiala, Punjab, India\nRelevant Coursework\n- Operating Systems\n- Database Management Systems\n- Object-Oriented Programming\n- Computer Networks\nProjects\nW allet App - Basic T ransaction System | React, Express.js, Mongo DB, Docker github.
\.


--
-- Data for Name: hr_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hr_users (id, email, hashed_password, full_name, role, is_active, created_at) FROM stdin;
4551302e-4bf4-43c5-900e-406edca24fdb	test@test.com	$2b$12$m7cW1D66ADb.6pgZ0fjO6eVcV12wDWdvE1kguoXVAYdiAdQDJvoAm	Test User	hr	t	2026-04-21 12:10:54.128082+05:30
3ff3d6ba-bafe-4da2-b0c5-90cbd998ace7	arpit.jain1@mphasis.com	$2b$12$XhHkOfHaikjKYH7i/12MVezLnW1GCFE/p9BDuPe4uWJwZrGTLPdri	A	hr	t	2026-04-21 06:46:55.502194+05:30
6190e25c-9593-4595-a0f8-261dae2c3382	statuscheck@test.com	$2b$12$PDuF35xcIj8bLCtd/0sR1uV8gNBqK3QXn82hllz3z.Q5q2N6EI/Pa	Status Check	hr	t	2026-04-21 06:59:31.210357+05:30
29085259-d9a8-4b30-a55a-fd2f5845f2e3	jainarpit053@gmail.com	$2b$12$c/YpejeDyqdP7H8RmWPviumAvHDP0JoPN8A/E8ttQzEgYVTFK9ELq	Sam	hr	t	2026-04-22 12:15:39.939273+05:30
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, candidate_id, job_id, application_id, round_number, interviewer_id, status, scheduled_at, meet_link, notes, score, feedback) FROM stdin;
b8fcadd9-20c9-4386-9bd3-288aee8ebf91	b365957e-6b1b-4b36-a496-db7bca6ec07a	4f4a1a6f-ae23-442c-9136-766616d1e28c	9202950a-0af2-4704-9fbe-1529b5cc5283	1	\N	scheduled	2026-04-23 10:00:00+05:30	\N	\N	\N	\N
796f386a-fce6-426b-b144-0563521d62c6	e664aa8b-593c-48ad-8da7-a073ff84739b	4f901170-b7da-49e2-ba57-9472b81736da	b4a35ac7-b605-484b-94e5-73092ffc99ab	1	\N	scheduled	2026-04-23 10:00:00+05:30	\N	\N	\N	\N
202aed32-9bb7-4b99-8763-ec948f59f0e6	9f106094-fd0d-47a7-bf73-d46f9d4cc755	7a9b790c-042d-4502-ae7a-65ad5a33c76b	71f3d690-7cc3-4faf-8f02-4e0136564ffc	1	\N	completed	2026-04-24 10:00:00+05:30	bhawsjn	\N	5	\N
8f760ef8-978d-4104-9ef8-547fd09924b3	b365957e-6b1b-4b36-a496-db7bca6ec07a	7a9b790c-042d-4502-ae7a-65ad5a33c76b	4c24f2e7-0706-4d3b-9935-6754cb614171	1	\N	scheduled	2026-04-24 10:00:00+05:30	\N	\N	\N	\N
f64cfd0c-0cbd-4354-b805-6a907053cf9b	b365957e-6b1b-4b36-a496-db7bca6ec07a	a017495f-e8f1-4a20-942d-4ece179fd9a4	b0f5543e-7d24-4703-a47b-e214d8de950c	1	\N	completed	2026-04-28 10:00:00+05:30	\N	\N	78	\N
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, description, form_url, published_platforms, created_by, deadline, status, created_at) FROM stdin;
9049c55b-fd73-425f-9cbb-cc8c63f15e75	Test Job	Test JD	\N	[]	4551302e-4bf4-43c5-900e-406edca24fdb	\N	draft	2026-04-21 06:53:42.483678+05:30
5e356203-1f9a-40aa-99ba-a59a8e7173d4	Sde1	Spring boot	\N	[]	3ff3d6ba-bafe-4da2-b0c5-90cbd998ace7	\N	draft	2026-04-21 09:34:50.998561+05:30
570c8079-754b-4305-a388-b8346ad0cb8b	SDE(NODE)	NODE.JS,DATA STRCUTRE AND ALGO	\N	[]	3ff3d6ba-bafe-4da2-b0c5-90cbd998ace7	\N	draft	2026-04-21 10:22:57.526378+05:30
4f4a1a6f-ae23-442c-9136-766616d1e28c	Sde2	Fastapi + internship experience	\N	[]	29085259-d9a8-4b30-a55a-fd2f5845f2e3	\N	draft	2026-04-22 12:16:26.249493+05:30
4f901170-b7da-49e2-ba57-9472b81736da	Sde3	Spring boot+Nodejs	\N	["linkedin", "naukri"]	29085259-d9a8-4b30-a55a-fd2f5845f2e3	\N	draft	2026-04-22 12:23:36.476509+05:30
7a9b790c-042d-4502-ae7a-65ad5a33c76b	Data Scientist	CNN Langchain Langraph	\N	["linkedin"]	29085259-d9a8-4b30-a55a-fd2f5845f2e3	\N	draft	2026-04-23 12:38:45.95044+05:30
a017495f-e8f1-4a20-942d-4ece179fd9a4	Sde4	Spring boot	\N	["linkedin"]	29085259-d9a8-4b30-a55a-fd2f5845f2e3	\N	draft	2026-04-24 15:04:33.238028+05:30
\.


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_email_key UNIQUE (email);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: hr_users hr_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hr_users
    ADD CONSTRAINT hr_users_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: ix_applications_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_applications_job_id ON public.applications USING btree (job_id);


--
-- Name: ix_hr_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_hr_users_email ON public.hr_users USING btree (email);


--
-- Name: applications applications_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: interviews interviews_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id);


--
-- Name: interviews interviews_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.hr_users(id);


--
-- PostgreSQL database dump complete
--

