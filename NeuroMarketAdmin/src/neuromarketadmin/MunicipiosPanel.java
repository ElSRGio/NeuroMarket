package neuromarketadmin;

import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;
import java.sql.*;
import java.util.Vector;

/**
 * MunicipiosPanel — CRUD completo para la tabla `municipios`.
 * Permite al equipo insertar, editar y eliminar datos INEGI.
 */
public class MunicipiosPanel extends JPanel {

    private JTable tabla;
    private DefaultTableModel modelo;

    // Campos del formulario
    private JTextField txtClave, txtNombre, txtEstado, txtPoblacion;
    private JTextField txtDensidad, txtValidacion, txtBancarizacion;
    private JTextField txtEmpleo, txtConectividad, txtGasto;
    private JButton btnGuardar, btnEditar, btnEliminar, btnLimpiar;
    private JLabel lblStatus;
    private int idSeleccionado = -1;

    public MunicipiosPanel() {
        setLayout(new BorderLayout(8, 8));
        setBackground(new Color(0xf9fafb));
        setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        initUI();
        cargarTabla();
    }

    private void initUI() {
        // ─── Tabla (parte superior) ───────────────────────────────────
        String[] columnas = {"ID","Clave INEGI","Nombre","Estado","Población",
                             "Dens.Digital","Val.Física","Bancariz.","Empleo","Conectiv.","Gasto Prom."};
        modelo = new DefaultTableModel(columnas, 0) {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        tabla = new JTable(modelo);
        tabla.setFont(new Font("SansSerif", Font.PLAIN, 12));
        tabla.setRowHeight(24);
        tabla.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 11));
        tabla.getTableHeader().setBackground(new Color(0xf3f4f6));
        tabla.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        tabla.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) llenarFormDesdeTabla();
        });

        JScrollPane scroll = new JScrollPane(tabla);
        scroll.setPreferredSize(new Dimension(860, 220));
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
        gc.insets = new Insets(5, 8, 5, 8);
        gc.anchor = GridBagConstraints.WEST;

        txtClave       = campo("Clave INEGI",    form, gc, 0, 0);
        txtNombre      = campo("Nombre",          form, gc, 1, 0);
        txtEstado      = campo("Estado",          form, gc, 2, 0);
        txtPoblacion   = campo("Población",       form, gc, 0, 1);
        txtGasto       = campo("Gasto Prom. ($)", form, gc, 1, 1);
        txtDensidad    = campo("Densidad Digital (0-100)", form, gc, 2, 1);
        txtValidacion  = campo("Validación Física (0-100)",form, gc, 0, 2);
        txtBancarizacion = campo("Bancarización (0-100)", form, gc, 1, 2);
        txtEmpleo      = campo("Empleo Formal (0-100)",   form, gc, 2, 2);
        txtConectividad = campo("Conectividad (0-100)",   form, gc, 0, 3);

        // ─── Botones ─────────────────────────────────────────────────
        JPanel botones = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        botones.setBackground(Color.WHITE);

        btnGuardar  = boton("💾 Guardar",   new Color(0x22c55e), Color.WHITE);
        btnEditar   = boton("✏️ Actualizar", new Color(0x3b82f6), Color.WHITE);
        btnEliminar = boton("🗑 Eliminar",   new Color(0xef4444), Color.WHITE);
        btnLimpiar  = boton("✖ Limpiar",    new Color(0x9ca3af), Color.WHITE);
        btnEditar.setEnabled(false);
        btnEliminar.setEnabled(false);

        btnGuardar.addActionListener(e -> guardar());
        btnEditar.addActionListener(e -> actualizar());
        btnEliminar.addActionListener(e -> eliminar());
        btnLimpiar.addActionListener(e -> limpiarForm());

        botones.add(btnGuardar);
        botones.add(btnEditar);
        botones.add(btnEliminar);
        botones.add(btnLimpiar);

        gc.gridx = 0; gc.gridy = 4; gc.gridwidth = 3; gc.fill = GridBagConstraints.HORIZONTAL;
        form.add(botones, gc);

        lblStatus = new JLabel(" ");
        lblStatus.setFont(new Font("SansSerif", Font.PLAIN, 11));
        gc.gridy = 5;
        form.add(lblStatus, gc);

        add(form, BorderLayout.CENTER);
    }

    // ─── Helpers de UI ────────────────────────────────────────────────

    private JTextField campo(String etiqueta, JPanel panel, GridBagConstraints gc, int col, int fila) {
        gc.gridwidth = 1; gc.fill = GridBagConstraints.NONE;
        gc.gridx = col; gc.gridy = fila;

        JLabel lbl = new JLabel(etiqueta + ":");
        lbl.setFont(new Font("SansSerif", Font.BOLD, 11));
        lbl.setForeground(new Color(0x374151));
        panel.add(lbl, gc);

        JTextField txt = new JTextField(12);
        txt.setFont(new Font("SansSerif", Font.PLAIN, 12));
        txt.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0xd1d5db)),
            BorderFactory.createEmptyBorder(3, 6, 3, 6)
        ));
        gc.gridy = fila + 1; // el campo va una fila más abajo... mejor hacerlo como par
        // Rediseño: label y campo en la misma celda usando un subpanel
        JPanel par = new JPanel(new BorderLayout(0, 2));
        par.setBackground(Color.WHITE);
        par.add(lbl, BorderLayout.NORTH);
        par.add(txt, BorderLayout.CENTER);
        gc.gridy = fila;
        panel.add(par, gc);
        // remover el label suelto que ya se agregó
        panel.remove(lbl);
        return txt;
    }

    private JButton boton(String texto, Color bg, Color fg) {
        JButton b = new JButton(texto);
        b.setBackground(bg);
        b.setForeground(fg);
        b.setFont(new Font("SansSerif", Font.BOLD, 12));
        b.setFocusPainted(false);
        b.setBorderPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setPreferredSize(new Dimension(130, 34));
        return b;
    }

    // ─── Lógica de BD ─────────────────────────────────────────────────

    private void cargarTabla() {
        modelo.setRowCount(0);
        String sql = "SELECT id, clave_inegi, nombre, estado, poblacion, densidad_digital, " +
                     "validacion_fisica, nivel_bancarizacion, indice_empleo, conectividad, " +
                     "gasto_promedio_mensual FROM municipios ORDER BY nombre";
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                modelo.addRow(new Object[]{
                    rs.getInt("id"), rs.getString("clave_inegi"), rs.getString("nombre"),
                    rs.getString("estado"), rs.getInt("poblacion"),
                    rs.getBigDecimal("densidad_digital"), rs.getBigDecimal("validacion_fisica"),
                    rs.getBigDecimal("nivel_bancarizacion"), rs.getBigDecimal("indice_empleo"),
                    rs.getBigDecimal("conectividad"), rs.getBigDecimal("gasto_promedio_mensual")
                });
            }
            status("✔ " + modelo.getRowCount() + " municipios cargados.", new Color(0x22c55e));
        } catch (SQLException e) {
            status("Error al cargar: " + e.getMessage(), new Color(0xef4444));
        }
    }

    private void guardar() {
        if (txtNombre.getText().isBlank() || txtEstado.getText().isBlank()) {
            status("⚠ Nombre y Estado son obligatorios.", new Color(0xf59e0b));
            return;
        }
        String sql = "INSERT INTO municipios (clave_inegi, nombre, estado, poblacion, " +
                     "densidad_digital, validacion_fisica, nivel_bancarizacion, " +
                     "indice_empleo, conectividad, gasto_promedio_mensual) " +
                     "VALUES (?,?,?,?,?,?,?,?,?,?)";
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement(sql)) {
            setParams(ps);
            ps.executeUpdate();
            status("✔ Municipio guardado correctamente.", new Color(0x22c55e));
            limpiarForm();
            cargarTabla();
        } catch (SQLException e) {
            status("Error: " + e.getMessage(), new Color(0xef4444));
        }
    }

    private void actualizar() {
        if (idSeleccionado < 0) return;
        String sql = "UPDATE municipios SET clave_inegi=?, nombre=?, estado=?, poblacion=?, " +
                     "densidad_digital=?, validacion_fisica=?, nivel_bancarizacion=?, " +
                     "indice_empleo=?, conectividad=?, gasto_promedio_mensual=? WHERE id=?";
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement(sql)) {
            setParams(ps);
            ps.setInt(11, idSeleccionado);
            ps.executeUpdate();
            status("✔ Municipio actualizado.", new Color(0x22c55e));
            limpiarForm();
            cargarTabla();
        } catch (SQLException e) {
            status("Error: " + e.getMessage(), new Color(0xef4444));
        }
    }

    private void eliminar() {
        if (idSeleccionado < 0) return;
        int conf = JOptionPane.showConfirmDialog(this,
            "¿Eliminar el municipio seleccionado?\nEsta acción no se puede deshacer.",
            "Confirmar", JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (conf != JOptionPane.YES_OPTION) return;
        try (Connection c = ConexionDB.conectar();
             PreparedStatement ps = c.prepareStatement("DELETE FROM municipios WHERE id=?")) {
            ps.setInt(1, idSeleccionado);
            ps.executeUpdate();
            status("✔ Municipio eliminado.", new Color(0x22c55e));
            limpiarForm();
            cargarTabla();
        } catch (SQLException e) {
            status("Error: " + e.getMessage(), new Color(0xef4444));
        }
    }

    private void setParams(PreparedStatement ps) throws SQLException {
        ps.setString(1, txt(txtClave));
        ps.setString(2, txtNombre.getText().trim());
        ps.setString(3, txtEstado.getText().trim());
        ps.setInt(4, intVal(txtPoblacion));
        ps.setDouble(5, dblVal(txtDensidad));
        ps.setDouble(6, dblVal(txtValidacion));
        ps.setDouble(7, dblVal(txtBancarizacion));
        ps.setDouble(8, dblVal(txtEmpleo));
        ps.setDouble(9, dblVal(txtConectividad));
        ps.setDouble(10, dblVal(txtGasto));
    }

    private void llenarFormDesdeTabla() {
        int fila = tabla.getSelectedRow();
        if (fila < 0) return;
        idSeleccionado = (int) modelo.getValueAt(fila, 0);
        txtClave.setText(strVal(modelo.getValueAt(fila, 1)));
        txtNombre.setText(strVal(modelo.getValueAt(fila, 2)));
        txtEstado.setText(strVal(modelo.getValueAt(fila, 3)));
        txtPoblacion.setText(strVal(modelo.getValueAt(fila, 4)));
        txtDensidad.setText(strVal(modelo.getValueAt(fila, 5)));
        txtValidacion.setText(strVal(modelo.getValueAt(fila, 6)));
        txtBancarizacion.setText(strVal(modelo.getValueAt(fila, 7)));
        txtEmpleo.setText(strVal(modelo.getValueAt(fila, 8)));
        txtConectividad.setText(strVal(modelo.getValueAt(fila, 9)));
        txtGasto.setText(strVal(modelo.getValueAt(fila, 10)));
        btnGuardar.setEnabled(false);
        btnEditar.setEnabled(true);
        btnEliminar.setEnabled(true);
    }

    private void limpiarForm() {
        idSeleccionado = -1;
        for (JTextField f : new JTextField[]{txtClave,txtNombre,txtEstado,txtPoblacion,
                txtDensidad,txtValidacion,txtBancarizacion,txtEmpleo,txtConectividad,txtGasto}) {
            f.setText("");
        }
        tabla.clearSelection();
        btnGuardar.setEnabled(true);
        btnEditar.setEnabled(false);
        btnEliminar.setEnabled(false);
    }

    private void status(String msg, Color color) {
        lblStatus.setText(msg);
        lblStatus.setForeground(color);
    }

    // ─── Utilidades ───────────────────────────────────────────────────
    private String txt(JTextField f) { String s = f.getText().trim(); return s.isEmpty() ? null : s; }
    private int    intVal(JTextField f) { try { return Integer.parseInt(f.getText().trim()); } catch (Exception e) { return 0; } }
    private double dblVal(JTextField f) { try { return Double.parseDouble(f.getText().trim()); } catch (Exception e) { return 0.0; } }
    private String strVal(Object v) { return v == null ? "" : v.toString(); }
}
