-- Custom SQL migration file, put your code below! --
INSERT INTO 
    "interview_session_statuses" (id, status)
VALUES
    (1, 'active'),
    (2, 'complete'),
    (3, 'canceled');
