# XAIZA Admin — Backoffice Java

Panel de administración de escritorio para inyectar y gestionar datos de la plataforma XAIZA 2.0.

---

## Credenciales de acceso

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `neuro2024` |

> Solo el equipo de trabajo debe tener acceso a este programa.

---

## Antes de compilar: Agregar el driver JDBC de PostgreSQL

1. Descarga el driver desde: https://jdbc.postgresql.org/download/
   - Descarga `postgresql-42.x.x.jar`

2. En NetBeans:
   - Click derecho en **Libraries** dentro de tu proyecto
   - Selecciona **Add JAR/Folder**
   - Selecciona el archivo `.jar` que descargaste
   - Click **OK**

3. Compila y corre el proyecto (botón ▶ verde en NetBeans)

---

## Estructura del proyecto

```
src/neuromarketadmin/
├── NeuroMarketAdmin.java  ← Entry point (main)
├── ConexionDB.java        ← Conexión JDBC a PostgreSQL
├── LoginFrame.java        ← Pantalla de login
├── MainFrame.java         ← Ventana principal con pestañas
├── MunicipiosPanel.java   ← CRUD para tabla municipios (datos INEGI)
└── UsuariosPanel.java     ← Gestión de usuarios (cambiar plan, eliminar)
```

---

## Módulos disponibles

| Pestaña | Responsable | Qué hace |
|---------|-------------|----------|
| 🏙 Municipios | Giovanni | Insertar/editar/eliminar datos INEGI por municipio |
| 👥 Usuarios | Admin | Cambiar plan (basic/pro/enterprise), eliminar cuentas |

---

## Convertir a .exe con Launch4j

1. Compila en NetBeans: Click derecho en proyecto → **Clean and Build**
2. El `.jar` aparece en `dist/NeuroMarketAdmin.jar`
3. Descarga Launch4j: https://launch4j.sourceforge.net/
4. En Launch4j:
   - **Output file**: `NeuroMarketAdmin.exe`
   - **Jar**: apunta a `dist/NeuroMarketAdmin.jar`
   - **Min JRE version**: `11`
5. Click **Build wrapper** → obtienes el `.exe`

---

## Configuración de BD (ConexionDB.java)

Para conectar desde otras computadoras, cambiar en `ConexionDB.java`:

```java
// Local (desarrollo):
private static final String URL = "jdbc:postgresql://localhost:5432/neuromarket_v2";

// Producción en la nube (Supabase/Render):
private static final String URL = "jdbc:postgresql://TU_HOST:5432/neuromarket_v2";
```

---

*XAIZA 2.0 — Ingeniería en Sistemas 2026*
