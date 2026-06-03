-- =========================
-- RESTAURANT
-- =========================
CREATE TABLE Restaurant (
    idRest NUMBER PRIMARY KEY,
    nomRest VARCHAR2(100),
    latitude NUMBER(10,6),
    longitude NUMBER(10,6),
    ouverture DATE,
    fermeture DATE
);

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
    nom VARCHAR2(100)
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
INSERT INTO Restaurant VALUES (
1, 'Raya Lobo', 48.68935979118905, 6.193760651987925,
TO_DATE('2000-01-01 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2000-01-01 02:00','YYYY-MM-DD HH24:MI')
);

-- Raya Grand Coeur
INSERT INTO Restaurant VALUES (
2, 'Raya Grand Coeur', 48.685602998293156, 6.181655473425948,
TO_DATE('2000-01-01 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2000-01-01 02:00','YYYY-MM-DD HH24:MI')
);

-- Maxi Kebab
INSERT INTO Restaurant VALUES (
3, 'Maxi Kebab', 48.68301276711423, 6.166123341310241,
TO_DATE('2000-01-01 12:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2000-01-01 02:00','YYYY-MM-DD HH24:MI')
);

-- Mont Liban
INSERT INTO Restaurant VALUES (
4, 'Mont Liban', 48.69175656079658, 6.184146426654587,
TO_DATE('2000-01-01 18:30','YYYY-MM-DD HH24:MI'),
TO_DATE('2000-01-01 23:00','YYYY-MM-DD HH24:MI')
);

-- Petite Cuillère
INSERT INTO Restaurant VALUES (
5, 'Petite Cuillère', 48.69822406530596, 6.178486131098204,
TO_DATE('2000-01-01 18:30','YYYY-MM-DD HH24:MI'),
TO_DATE('2000-01-01 23:00','YYYY-MM-DD HH24:MI')
);

-- Funky Tacos
INSERT INTO Restaurant VALUES (
6, 'Funky Tacos', 48.69359799344546, 6.190498415447689,
TO_DATE('2000-01-01 17:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2000-01-01 00:00','YYYY-MM-DD HH24:MI')
);
