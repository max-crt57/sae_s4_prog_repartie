    -- =========================
    -- RESTAURANT
    -- =========================
    CREATE TABLE Restaurant (
        idRest NUMBER PRIMARY KEY,
        nomRest VARCHAR2(100),
        latitude NUMBER(10,6),
        longitude NUMBER(10,6),
        ouvertureMin NUMBER(4),
        fermetureMin NUMBER(4),

        CHECK (ouvertureMin BETWEEN 0 AND 1439),
        CHECK (fermetureMin BETWEEN 0 AND 1439)
    );

    -- Les horraires sont stockées en minutes : ouvertureMin = 1080 / 60 = 18h

    -- =========================
    -- TABLE RESTO
    -- =========================
    CREATE TABLE TableResto (
        numTable NUMBER PRIMARY KEY,
        nbPlace NUMBER,
        idRest NUMBER,
        FOREIGN KEY (idRest) REFERENCES Restaurant(idRest)
    );

    -- =========================
    -- CLIENT
    -- =========================
    CREATE TABLE Client (
        idCli NUMBER PRIMARY KEY,
        nom VARCHAR2(100),
        prenom VARCHAR2(100)
    );

    -- =========================
    -- PLAT
    -- =========================
    CREATE TABLE Plat (
        numPlat NUMBER PRIMARY KEY,
        libelle VARCHAR2(100),
        prixUnit NUMBER(10,2),
        qteStock NUMBER
    );

    -- =========================
    -- COMMANDE
    -- =========================
    CREATE TABLE Commande (
        numCom NUMBER PRIMARY KEY,
        dateCom DATE,
        nbPers NUMBER,
        dateRes DATE,
        montant NUMBER(10,2),
        numTable NUMBER,
        idCli NUMBER,
        FOREIGN KEY (numTable) REFERENCES TableResto(numTable),
        FOREIGN KEY (idCli) REFERENCES Client(idCli)
    );

    -- =========================
    -- CONTIENT
    -- =========================
    CREATE TABLE Contient (
        numCom NUMBER,
        numPlat NUMBER,
        quantite NUMBER,
        PRIMARY KEY (numCom, numPlat),
        FOREIGN KEY (numCom) REFERENCES Commande(numCom),
        FOREIGN KEY (numPlat) REFERENCES Plat(numPlat)
    );

    -- =========================
    -- RESERVATION
    -- =========================
    CREATE TABLE Reservation (
        numRes NUMBER PRIMARY KEY,
        dateRes DATE,
        nbPersonnes NUMBER,
        telephone VARCHAR2(20),
        idCli NUMBER,
        numTable NUMBER,
        FOREIGN KEY (idCli) REFERENCES Client(idCli),
        FOREIGN KEY (numTable) REFERENCES TableResto(numTable)
    );

    -- =========================
    -- INSERT RESTAURANTS
    -- =========================

    -- Raya Lobo
    INSERT INTO Restaurant (
        idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin
    ) VALUES (
        1, 'Raya Lobo', 48.68935979118905, 6.193760651987925,
        690, 1380
    );

    -- Raya Grand Coeur
    INSERT INTO Restaurant (
        idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin
    ) VALUES (
        2, 'Raya Grand Coeur', 48.685602998293156, 6.181655473425948,
        690, 1380
    );

    -- Maxi Kebab
    INSERT INTO Restaurant (
        idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin
    ) VALUES (
        3, 'Maxi Kebab', 48.68301276711423, 6.166123341310241,
        690, 1380
    );

    -- Mont Liban
    INSERT INTO Restaurant (
        idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin
    ) VALUES (
        4, 'Mont Liban', 48.69175656079658, 6.184146426654587,
        690, 1380
    );

    -- Petite Cuillère
    INSERT INTO Restaurant (
        idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin
    ) VALUES (
        5, 'Petite Cuillère', 48.69822406530596, 6.178486131098204,
        690, 1380
    );

    -- Funky Tacos
    INSERT INTO Restaurant (
        idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin
    ) VALUES (
        6, 'Funky Tacos', 48.69359799344546, 6.190498415447689,
        690, 1380
    );

    -- =========================
    -- INSERT TABLES
    -- =========================
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (1, 2, 1);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (2, 4, 1);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (3, 6, 1);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (4, 2, 2);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (5, 2, 2);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (6, 4, 2);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (7, 2, 3);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (8, 4, 3);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (9, 8, 3);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (10, 2, 4);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (11, 4, 4);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (12, 2, 5);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (13, 2, 5);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (14, 2, 6);
    INSERT INTO TableResto(numTable, nbPlace, idRest) VALUES (15, 6, 6);