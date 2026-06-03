-- =========================
-- RESTAURANT (modifié)
-- =========================
CREATE TABLE Restaurant (
    idRest NUMBER PRIMARY KEY,
    nomRest VARCHAR2(100),
    latitude NUMBER(10,6),
    longitude NUMBER(10,6),
    fermeture DATE,
    ouverture DATE
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
-- RESERVATION (modifié)
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
