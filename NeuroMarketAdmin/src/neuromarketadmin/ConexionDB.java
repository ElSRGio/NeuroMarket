package neuromarketadmin;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * ConexionDB — Gestiona la conexión JDBC a PostgreSQL NeuroMarket.
 * Cambia los valores de URL, USER y PASSWORD según el entorno.
 */
public class ConexionDB {

    // ─── Configuración ───────────────────────────────────────────────
    private static final String URL  = "jdbc:postgresql://localhost:5432/neuromarket_v2";
    private static final String USER = "postgres";
    private static final String PASS = "3809";
    // ─────────────────────────────────────────────────────────────────

    public static Connection conectar() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver PostgreSQL no encontrado. Agrega el .jar a Libraries.", e);
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }

    /** Prueba rápida de conexión — devuelve true si OK */
    public static boolean probar() {
        try (Connection c = conectar()) {
            return c != null && !c.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }
}
