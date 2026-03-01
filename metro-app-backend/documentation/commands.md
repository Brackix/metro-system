# Comandos útiles para iniciar el proyecto.

### Para establecer el proyecto se usa el siguiente comando:
```bash
npm run setup
```
se ejecuta una vez, luego se verifican y se ajustan las credenciales en el `.env` que lo creará automaticamente a partir del `.env.example`.

luego se ejecuta una segunda vez para configurar todo el entorno completamente.

### Para construir una build
```bash
npm run build
```

### Para iniciar builds de producción
```bash
npm run start
```

### Para correr un entorno de desarrollo
```bash
npm run dev
```
### Para verificar tu conección entre el ORM y la base de datos
```bash
npm run check-db
```
### Para limpiar todo el entorno (borra todos los paquetes y configuraciones)
```bash
npm run clean
```