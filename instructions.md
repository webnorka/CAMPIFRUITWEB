# Guía de Gestión de CAMPIFRUITWEB

Este documento explica cómo gestionar el proyecto en desarrollo, producción y despliegue a un VPS.

## 🚀 Entorno de Desarrollo

Para trabajar en el proyecto localmente con recarga en vivo (HMR):

1. **Instalar dependencias** (si es la primera vez):
   ```bash
   cd app
   npm install
   ```

2. **Lanzar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   El sitio estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🏗️ Producción (Local con Docker)

Si quieres probar la versión de producción antes de subirla al VPS:

1. **Construir y levantar el contenedor**:
   ```bash
   cd app
   docker compose up --build -d
   ```

2. **Acceder a la app**:
   Estará disponible en [http://localhost:3000](http://localhost:3000) (mapeado al puerto 3001 del contenedor).

---

## 🔄 Reiniciar el sistema

Si has hecho cambios y necesitas reiniciar:

- **Desarrollo**: Detén el comando `npm run dev` con `Ctrl + C` y vuelve a ejecutarlo.
- **Producción (Docker)**:
  ```bash
  docker compose restart
  ```
  O si has cambiado archivos que requieren reconstruir la imagen:
  ```bash
  docker compose up --build -d
  ```

---

## 🌐 Despliegue a VPS

Para llevar el proyecto a un servidor VPS, el método más recomendado es mediante Docker:

### 1. Preparación en el VPS
Asegúrate de tener instalado:
- Docker y Docker Compose.
- Git.

### 2. Subir el código
Puedes usar Git para clonar el repositorio en el VPS:
```bash
git clone <url-de-tu-repo>
cd CAMPIFRUITWEB/app
```

O usar `scp` para copiar los archivos manualmente:
```bash
scp -r ./app usuario@tu-vps:/ruta/destino
```

### 3. Levantar en el VPS
Una vez dentro de la carpeta `CAMPIFRUITWEB` en el VPS (en la raíz del proyecto):
```bash
docker compose -f docker-compose-vps.yml up --build -d
```

### 4. Acceso externo
El servidor escuchará en el puerto `3000`. Recuerda abrirlo en el firewall del VPS:
```bash
sudo ufw allow 3000
```

> [!TIP]
> Para producción real, se recomienda usar **Nginx** como proxy inverso para apuntar tu dominio (ej. `campifruit.com`) al puerto `3000` y gestionar certificados SSL con **Certbot**.

---

## 📁 Estructura relevante
- `app/server.js`: Servidor Node.js mínimo para servir los archivos estáticos en producción.
- `Dockerfile`: Define cómo se construye la imagen de producción (ubicado en la raíz).
- `docker-compose-vps.yml`: Gestión simplificada del contenedor para VPS.

---

## 🛠️ Configuración en Dokploy

Si estás usando Dokploy, asegúrate de configurar estos parámetros:
- **Build Type**: Dockerfile
- **Dockerfile Path**: `Dockerfile` (en la raíz)
- **Build Path**: `.` (en la raíz)
