-- Custom SQL migration file, put your code below! --
INSERT INTO 
    roles (id, name)
VALUES
    (1, 'user'),
    (2, 'expert'),
    (3, 'admin');