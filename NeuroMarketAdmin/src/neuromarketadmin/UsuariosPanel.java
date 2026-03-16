package neuromarketadmin;

import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;
import java.sql.*;

/**
 * UsuariosPanel — Gestión de usuarios: ver, cambiar plan y desactivar cuentas.
 * No permite crear cuentas (eso lo hace el registro en la web).
 */
public class UsuariosPanel extends JPanel {

    private JTable tabla;
    private DefaultTableModel modelo;
    private JComboBox<String> cboPlan;
    private JTextField txtNombre, txtEmail;
    private JButton btnActualizar, btnEliminar;
    private JLabel lblStatus;
    private String idSeleccionado = null;

    public UsuariosPanel() {
        setLayout(new BorderLayout(8, 8));
        setBackground(new Color(0xf9fafb));
        setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        initUI();
        cargarTabla();
    }

    private void initUI() {
        // ─── Tabla ────────────────────────────────────────────────────
        String[] cols = {"ID","Nombre","Email","Plan","Creado"};
        modelo = new DefaultTableModel(cols, 0) {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        tabla = new JTable(modelo);
        tabla.setFont(new Font("SansSerif", Font.PLAIN, 12));
        tabla.setRowHeight(24);
        tabla.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 11));
        tabla.getTableHeader().setBackground(new Color(0xf3f4f6));
        tabla.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        tabla.getColumnModel().getColumn(0).setMinWidth(0);
        tabla.getColumnModel().getColumn(0).setMaxWidth(0); // ocultar UUID
        tabla.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) llenarForm();
        });

        // Color por plan
        tabla.setDefaultRenderer(Object.class, new DefaultTableCellRenderer() {
            public Component getTableCellRendererComponent(JTable t, Object v,
                    boolean sel, boolean foc, int r, int c) {
                Component comp = super.getTableCellRendererComponent(t, v, sel, foc, r, c);
                if (!sel) {
                    Object plan = modelo.getValueAt(r, 3);
                    if ("pro".equals(plan)) comp.setBackground(new Color(0xf0fdf4));
                    else if ("enterprise".equals(plan)) comp.setBackground(new Color(0xeff6ff));
                    else comp.setBackground(Color.WHITE);
                }
                return comp;
            }
        });

        JScrollPane scroll = new JScrollPane(tabla);
        scroll.setPreferredSize(new Dimension(860, 260));
        scroll.setBorder(BorderFactory.createLineBorder(new Color(0xe5e7eb)));
        add(scroll, BorderLayout.NORTH);

        // ─── Formulario ───────────────────────────────────────────────
        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(Color.WHITE);
        form.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0xe5e7eb)),
            BorderFactory.createEmptyBorder(16, 16, 16, 16)
        ));

        GridBagConstraints gc = new GridBagConstraints();
        gc.insets = new Insets(6, 8, 6, 8);
        gc.anchor = GridBagConstraints.WEST;
        gc.fill = GridBagConstraints.HORIZONTAL;

        // Nombre
        gc.gridx = 0; gc.gridy = 0; gc.weightx = 0;
        form.add(lbl("Nombre:"), gc);
        gc.gridx = 1; gc.weightx = 1;
        txtNombre = campo();
        txtNombre.setEditable(false);
        txtNombre.setBackground(new Color(0xf3f4f6));
        form.add(txtNombre, gc);

        // Email
        gc.gridx = 2; gc.weightx = 0;
        form.add(lbl("Email:"), gc);
        gc.gridx = 3; gc.weightx = 1;
        txtEmail = campo();
        txtEmail.setEditable(false);
        txtEmail.setBackground(new Color(0xf3f4f6));
        form.add(txtEmail, gc);

        // Plan
        gc.gridx = 0; gc.gridy = 1; gc.weightx = 0;
        form.add(lbl("Plan:"), gc);
        gc.gridx = 1; gc.weightx = 0.5;
        cboPlan = new JComboBox<>(new String[]{"basic","pro","enterprise"});
        cboPlan.setFont(new Font("SansSerif", Font.PLAIN, 13));
        form.add(cboPlan, gc);

        // Botones
        JPanel botones = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        botones.setBackground(Color.WHITE);

        btnActualizar = boton("✏️ Cambiar Plan", new Color(0x3b82f6));
        btnEliminar   = boton("🗑 Eliminar Usuario", new Color(0xef4444));
        btnActualizar.setEnabled(false);
        btnEliminar.setEnabled(false);

        btnActualizar.addActionListener(e -> cambiarPlan());
        btnEliminar.addActionListener(e -> eliminar());

        botones.add(btnActualizar);
        botones.add(btnEliminar);

        gc.gridx = 0; gc.gridy = 2; gc.gridwidth = 4;
        form.add(botones, gc);

        lblStatus = new JLabel(" ");
        lblStatus.setFont(new Font("SansSerif", Font.PLAIN, 11));
        gc.gridy = 3;
        form.add(lblStatus, gc);

        add(form, BorderLayout.CENTER);
    }

    // ─── Lógica ───────────────────────────────────────────────────────

    private void cargarTabla() {
        modelo.setRowCount(0);
        String sql = "SELECT id, name, email, plan_type, created_at FROM users ORDER BY created_at DESC";
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                modelo.addRow(new Object[]{
                    rs.getString("id"), rs.getString("name"), rs.getString("email"),
                    rs.getString("plan_type"),
                    rs.getTimestamp("created_at").toString().substring(0, 10)
                });
            }
            status("✔ " + modelo.getRowCount() + " usuarios cargados.", new Color(0x22c55e));
        } catch (SQLException e) {
            status("Error: " + e.getMessage(), new Color(0xef4444));
        }
    }

    private void llenarForm() {
        int fila = tabla.getSelectedRow();
        if (fila < 0) return;
        idSeleccionado = (String) modelo.getValueAt(fila, 0);
        txtNombre.setText((String) modelo.getValueAt(fila, 1));
        txtEmail.setText((String) modelo.getValueAt(fila, 2));
        cboPlan.setSelectedItem(modelo.getValueAt(fila, 3));
        btnActualizar.setEnabled(true);
        btnEliminar.setEnabled(true);
    }

    private void cambiarPlan() {
        if (idSeleccionado == null) return;
        String nuevoPlan = (String) cboPlan.getSelectedItem();
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement(
                 "UPDATE users SET plan_type = CAST(? AS plan_type_enum), updated_at = NOW() WHERE id = CAST(? AS uuid)")) {
            // Si no tiene ENUM, usar texto plano
            ps.setString(1, nuevoPlan);
            ps.setString(2, idSeleccionado);
            ps.executeUpdate();
            status("✔ Plan actualizado a '" + nuevoPlan + "'.", new Color(0x22c55e));
            cargarTabla();
        } catch (SQLException e) {
            // Intentar con ENUM de Sequelize
            try (Connection c = ConexionDB.conectar();
                 PreparedStatement ps = c.prepareStatement(
                     "UPDATE users SET plan_type = ?, updated_at = NOW() WHERE id = CAST(? AS uuid)")) {
                ps.setString(1, nuevoPlan);
                ps.setString(2, idSeleccionado);
                ps.executeUpdate();
                status("✔ Plan actualizado a '" + nuevoPlan + "'.", new Color(0x22c55e));
                cargarTabla();
            } catch (SQLException ex) {
                status("Error: " + ex.getMessage(), new Color(0xef4444));
            }
        }
    }

    private void eliminar() {
        if (idSeleccionado == null) return;
        int conf = JOptionPane.showConfirmDialog(this,
            "¿Eliminar usuario " + txtEmail.getText() + "?\nTambién se eliminarán sus análisis.",
            "Confirmar", JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (conf != JOptionPane.YES_OPTION) return;
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement(
                 "DELETE FROM users WHERE id = CAST(? AS uuid)")) {
            ps.setString(1, idSeleccionado);
            ps.executeUpdate();
            idSeleccionado = null;
            txtNombre.setText(""); txtEmail.setText("");
            btnActualizar.setEnabled(false); btnEliminar.setEnabled(false);
            status("✔ Usuario eliminado.", new Color(0x22c55e));
            cargarTabla();
        } catch (SQLException e) {
            status("Error: " + e.getMessage(), new Color(0xef4444));
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────
    private JLabel lbl(String t) {
        JLabel l = new JLabel(t);
        l.setFont(new Font("SansSerif", Font.BOLD, 11));
        l.setForeground(new Color(0x374151));
        return l;
    }
    private JTextField campo() {
        JTextField f = new JTextField(18);
        f.setFont(new Font("SansSerif", Font.PLAIN, 12));
        f.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0xd1d5db)),
            BorderFactory.createEmptyBorder(3, 6, 3, 6)
        ));
        return f;
    }
    private JButton boton(String texto, Color bg) {
        JButton b = new JButton(texto);
        b.setBackground(bg);
        b.setForeground(Color.WHITE);
        b.setFont(new Font("SansSerif", Font.BOLD, 12));
        b.setFocusPainted(false);
        b.setBorderPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setPreferredSize(new Dimension(160, 34));
        return b;
    }
    private void status(String msg, Color color) {
        lblStatus.setText(msg);
        lblStatus.setForeground(color);
    }
}
