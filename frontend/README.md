 Proiect Tehnologii Web – Aplicație de planificare a task-urilor
Descriere generală

Acest proiect reprezintă o aplicație web de tip Task Planner, realizată în cadrul disciplinei Tehnologii Web.
Aplicația permite crearea, alocarea, monitorizarea și finalizarea task-urilor într-o organizație simplificată, având roluri bine definite și un flux clar de lucru.

Aplicația este construită pe o arhitectură client–server, cu:

frontend SPA realizat în React

backend RESTful realizat în Node.js + Express

bază de date relațională (SQLite) accesată prin ORM (Sequelize)

 Obiectivul aplicației

Scopul principal al aplicației este planificarea activităților (task-urilor) și urmărirea progresului acestora, respectând un flux de lucru realist și coerent:

OPEN → PENDING → COMPLETED → CLOSED

Aplicația implementează toate cerințele din tema propusă și reflectă o logică de business clară, similară aplicațiilor reale de task management.

 Roluri în aplicație

Aplicația are trei tipuri de utilizatori:

 Administrator (ADMIN)

există un singur administrator

poate crea utilizatori de tip MANAGER sau EXECUTOR

vede lista tuturor utilizatorilor

nu creează și nu gestionează task-uri

 Manager (MANAGER)

poate crea task-uri (stare inițială: OPEN)

poate aloca task-uri executorilor (stare: PENDING)

poate vedea toate task-urile create de el și status-urile lor

poate închide task-uri finalizate (stare: CLOSED)

poate consulta:

istoricul propriu de task-uri

istoricul task-urilor pentru un executor din echipa sa

 Executor (EXECUTOR)

are obligatoriu un manager alocat

vede task-urile care îi sunt atribuite

poate marca task-urile ca fiind realizate (stare: COMPLETED)

poate consulta istoricul propriu de task-uri

 Logica aplicației

Fiecare executor este asociat unui manager

Doar managerul care a creat un task îl poate aloca sau închide

Executorul poate modifica doar task-urile care îi sunt atribuite

Accesul la rute este protejat prin JWT + role-based access

Interfața afișează doar funcționalitățile permise rolului autentificat

🛠️ Tehnologii utilizate
Backend

Node.js

Express

Sequelize (ORM)

SQLite

JWT (autentificare)

bcrypt (hash parole)

Frontend

React

React Router

SPA (Single Page Application)

Fetch API

 Persistența datelor

Datele sunt stocate într-o bază de date relațională SQLite, gestionată prin Sequelize.
La prima rulare, aplicația inițializează automat baza de date și creează utilizatori demo:

Admin

Manager

Executor

 Securitate

autentificare pe bază de JSON Web Token

parolele sunt stocate hash-uite

rutele sunt protejate în funcție de rol

accesul neautorizat este blocat atât în backend, cât și în frontend