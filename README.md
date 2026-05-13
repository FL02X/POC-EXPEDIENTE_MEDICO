Expediente Clínico Electrónico para SISTEMAS DISTRIBUIDOS en ITSON Navojoa

Proyecto es un PoC de un sistema de expediente clínico hecho con microservicios, Docker y Next.js.

Requisitos:
- Instalar Docker Desktop.
- Abrir Docker Desktop y dejarlo encendido.
- El node 18 o mas 


PASOS...
- Abrir el proyecto
- npm install
- Crear el archivo .env en la carpeta infra
- Dentro de la carpeta infra, haz una copia de "env.example" y cambia el nombre de la copia a ".env"


- Ejecuta este comando desde la raíz del proyecto:
docker compose up --build
(PUEDE TARDAR MINUTOS...)



-- Abrir el sistema

Cuando termine de levantar todo, pon esta dirección en el navegador:
http://localhost:3000


Qué hace cada parte:
frontend: es la página del naveador.
gateway: recibe las peticiones del frontend y las manda al microservicio.
auth: revisa si la autenticación es válida.
cedula: revisa si la cédula tiene un formato correcto.
expediente: regresa los datos del expediente clínico.
websocket: manda avisos en tiempo real.
rabbitmq: sirve para mandar eventos entre servicios sin que todo dependa de una sola llamada.

PUERTOS

Frontend: 3000
Gateway: 4000
Auth: 4001
Expediente: 4002
Cédula: 4003
WebSocket: 4004
RabbitMQ panel: 15672


PORTAL PACIENTE
Usuario: `Juan Pérez`
Contraseña: `1234`

PORTAL HOSPITAL
cédula:  12345678
ID del paciente;  1.



PANEL RABBITMQ
http://localhost:15672

Usuario: guest
Contraseña: guest

