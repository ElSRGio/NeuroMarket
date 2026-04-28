package neuromarketadmin;

import javax.swing.*;
import java.awt.*;

/**
 * MainFrame — Ventana principal con pestañas por módulo de datos.
 */
public class MainFrame extends JFrame {

    public MainFrame() {
        setTitle("XAIZA Admin — Panel de Control");
        setSize(900, 650);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        initUI();
    }

    private void initUI() {
        // ─── Header ──────────────────────────────────────────────────
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(Color.WHITE);
        header.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, new Color(0xe5e7eb)));
        header.setPreferredSize(new Dimension(900, 56));

        JLabel titulo = new JLabel("  XAIZA Admin", SwingConstants.LEFT);
        titulo.setFont(new Font("SansSerif", Font.BOLD, 18));
        titulo.setForeground(new Color(0x22c55e));
        header.add(titulo, BorderLayout.WEST);

        JLabel usuario = new JLabel("Admin  ●  Sesión activa  ", SwingConstants.RIGHT);
        usuario.setFont(new Font("SansSerif", Font.PLAIN, 11));
        usuario.setForeground(new Color(0x6b7280));
        header.add(usuario, BorderLayout.EAST);

        add(header, BorderLayout.NORTH);

        // ─── Pestañas ────────────────────────────────────────────────
        JTabbedPane tabs = new JTabbedPane();
        tabs.setFont(new Font("SansSerif", Font.BOLD, 12));
        tabs.setBackground(new Color(0xf9fafb));

        tabs.addTab("🏙 Municipios",    new MunicipiosPanel());
        tabs.addTab("👥 Usuarios",       new UsuariosPanel());

        add(tabs, BorderLayout.CENTER);

        // ─── Footer ──────────────────────────────────────────────────
        JLabel footer = new JLabel("  XAIZA 2.0 — Backoffice v1.0  |  Equipo: Giovanni · Pamela · Ximena · Melisa", SwingConstants.LEFT);
        footer.setFont(new Font("SansSerif", Font.PLAIN, 10));
        footer.setForeground(new Color(0x9ca3af));
        footer.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(0xe5e7eb)));
        footer.setPreferredSize(new Dimension(900, 28));
        add(footer, BorderLayout.SOUTH);
    }
}
