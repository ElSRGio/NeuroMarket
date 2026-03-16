package neuromarketadmin;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

/**
 * LoginFrame — Pantalla de inicio de sesión del backoffice NeuroMarket Admin.
 * Credenciales hardcodeadas para uso interno del equipo de trabajo.
 */
public class LoginFrame extends JFrame {

    // Credenciales de administrador (cambiar en producción)
    private static final String ADMIN_USER = "admin";
    private static final String ADMIN_PASS = "neuro2024";

    private JTextField txtUsuario;
    private JPasswordField txtPassword;
    private JButton btnEntrar;
    private JLabel lblStatus;

    public LoginFrame() {
        setTitle("NeuroMarket Admin — Acceso");
        setSize(400, 320);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setResizable(false);
        initUI();
    }

    private void initUI() {
        // Panel principal con fondo blanco
        JPanel panel = new JPanel();
        panel.setLayout(null);
        panel.setBackground(Color.WHITE);
        add(panel);

        // ─── Logo / Título ───────────────────────────────────────────
        JLabel lblTitulo = new JLabel("NeuroMarket Admin", SwingConstants.CENTER);
        lblTitulo.setBounds(0, 25, 400, 32);
        lblTitulo.setFont(new Font("SansSerif", Font.BOLD, 22));
        lblTitulo.setForeground(new Color(0x22c55e));
        panel.add(lblTitulo);

        JLabel lblSub = new JLabel("Panel de Administración de Datos", SwingConstants.CENTER);
        lblSub.setBounds(0, 60, 400, 18);
        lblSub.setFont(new Font("SansSerif", Font.PLAIN, 12));
        lblSub.setForeground(new Color(0x6b7280));
        panel.add(lblSub);

        // ─── Usuario ─────────────────────────────────────────────────
        JLabel lblU = new JLabel("Usuario:");
        lblU.setBounds(70, 100, 260, 18);
        lblU.setFont(new Font("SansSerif", Font.BOLD, 12));
        panel.add(lblU);

        txtUsuario = new JTextField();
        txtUsuario.setBounds(70, 120, 260, 32);
        txtUsuario.setFont(new Font("SansSerif", Font.PLAIN, 13));
        txtUsuario.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0xd1d5db)),
            BorderFactory.createEmptyBorder(4, 8, 4, 8)
        ));
        panel.add(txtUsuario);

        // ─── Contraseña ───────────────────────────────────────────────
        JLabel lblP = new JLabel("Contraseña:");
        lblP.setBounds(70, 162, 260, 18);
        lblP.setFont(new Font("SansSerif", Font.BOLD, 12));
        panel.add(lblP);

        txtPassword = new JPasswordField();
        txtPassword.setBounds(70, 182, 260, 32);
        txtPassword.setFont(new Font("SansSerif", Font.PLAIN, 13));
        txtPassword.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0xd1d5db)),
            BorderFactory.createEmptyBorder(4, 8, 4, 8)
        ));
        txtPassword.addKeyListener(new KeyAdapter() {
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_ENTER) autenticar();
            }
        });
        panel.add(txtPassword);

        // ─── Botón ────────────────────────────────────────────────────
        btnEntrar = new JButton("Entrar →");
        btnEntrar.setBounds(70, 228, 260, 36);
        btnEntrar.setBackground(new Color(0x22c55e));
        btnEntrar.setForeground(Color.WHITE);
        btnEntrar.setFont(new Font("SansSerif", Font.BOLD, 14));
        btnEntrar.setFocusPainted(false);
        btnEntrar.setBorderPainted(false);
        btnEntrar.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btnEntrar.addActionListener(e -> autenticar());
        panel.add(btnEntrar);

        // ─── Status ───────────────────────────────────────────────────
        lblStatus = new JLabel("", SwingConstants.CENTER);
        lblStatus.setBounds(70, 270, 260, 18);
        lblStatus.setFont(new Font("SansSerif", Font.PLAIN, 11));
        lblStatus.setForeground(new Color(0xef4444));
        panel.add(lblStatus);
    }

    private void autenticar() {
        String user = txtUsuario.getText().trim();
        String pass = new String(txtPassword.getPassword());

        if (user.equals(ADMIN_USER) && pass.equals(ADMIN_PASS)) {
            lblStatus.setForeground(new Color(0x22c55e));
            lblStatus.setText("Conectando...");
            btnEntrar.setEnabled(false);

            SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
                protected Boolean doInBackground() { return ConexionDB.probar(); }
                protected void done() {
                    try {
                        if (get()) {
                            dispose();
                            new MainFrame().setVisible(true);
                        } else {
                            lblStatus.setForeground(new Color(0xef4444));
                            lblStatus.setText("No se pudo conectar a la base de datos");
                            btnEntrar.setEnabled(true);
                        }
                    } catch (Exception ex) {
                        lblStatus.setText("Error: " + ex.getMessage());
                        btnEntrar.setEnabled(true);
                    }
                }
            };
            worker.execute();
        } else {
            lblStatus.setForeground(new Color(0xef4444));
            lblStatus.setText("Usuario o contraseña incorrectos");
            txtPassword.setText("");
        }
    }
}
