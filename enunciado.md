## **Proyecto: Desarrollo de Aplicación Web – Monitoreo de Sensores**

⏳ **Duración: semanas 12 a 22 (RA1)**

🎯 **Objetivo:** Aplicar conocimientos sobre desarrollo de aplicaciones web y
consumo de APIs REST para implementar una aplicación cliente que interactúe con
un servicio backend real desarrollado en FastAPI.

---

1. **Trabajo grupal (2–3 personas)**
2. **Proyecto:** Desarrollar una **aplicación web en React** que consuma el
   [**backend ULA Monitors**](https://ulamonitors-uat-back.grye.org/docs),
implementando el panel de administración de una empresa que opera sensores de
oxígeno disuelto en centros de cultivo.

---

### **📋 Instrucciones Generales**

1. Consumir el API entregado (basado en FastAPI y MongoDB).
2. Crear un repositorio donde almacenarán el código del proyecto (React + Vite).
3. Desplegar la aplicación en **Vercel**.
4. No se debe modificar el backend. El objetivo es construir un **frontend
   funcional**.
5. Cada grupo recibe sus propias credenciales.

---

### **📡 Enunciado**

Se requiere desarrollar una aplicación web que permita al administrador
supervisar el estado de los sensores instalados en los centros de cultivo.

El sistema debe consumir los endpoints del backend, mostrando la información en
una interfaz moderna y fácil de usar. La aplicación **lee** casi todo: su única
escritura es abrir una intervención cuando detecta un problema.

Los usuarios deben poder:

* Autenticarse con usuario y contraseña, y mantener la sesión.
* Listar los centros con buscador, filtro por zona y paginación.
* Ver el detalle de un centro con sus sensores y el estado de cada uno.
* Ver el detalle de un sensor con un gráfico histórico de sus mediciones.
* Ver de un vistazo cuántos sensores están sin transmitir y cuántos fuera de
rango, y navegar a esos listados.
* Abrir una intervención sobre un centro o un sensor, indicando el motivo.
* Listar las intervenciones con filtro por estado.

El API ya dispone de las siguientes rutas:

* `/token` → autenticación, devuelve un JWT
* `/sites` → listar centros y ver su detalle
* `/sensors` → listar sensores, filtrar por estado
* `/measurements` y `/measurements/overview` → mediciones y datos para gráficos
* `/interventions` → listar y abrir intervenciones

El objetivo del proyecto es construir la aplicación cliente que consuma
correctamente este flujo.

**No existe un endpoint que entregue el dashboard armado.** El resumen se
construye en el frontend combinando las rutas anteriores.

---

### **🧠 Requerimientos mínimos**

* Pantalla de login y manejo del token en las peticiones siguientes.
* Vista de listado de centros con buscador y paginación.
* Vista de detalle de centro con sus sensores y estado.
* Vista de detalle de sensor con gráfico de mediciones.
* Formulario para abrir una intervención.
* Vista de listado de intervenciones.
* Manejo correcto del estado y asincronía (React Hooks).
* Diseño coherente y navegación clara.

El API habla en hora de Chile en los dos sentidos: se consulta en hora chilena
y responde en hora chilena. No hay conversiones que hacer.

---

💬 **Fechas e Instrucciones de Entrega:**

1. **Avance 1 (15%)**

   * **Fecha:** POR DEFINIR
   * **Descripción:** Presentación de avance.

2. **Avance 2 (15%)**

   * **Fecha:** POR DEFINIR
   * **Descripción:** Presentación de avance.

3. **Entrega Web (20%)**

   * **Fecha:** POR DEFINIR
   * **Descripción:** Entrega del url de la página levantada en `producción` de
   la aplicación desarrollada + url del repositorio en github del código fuente
   implementado.
