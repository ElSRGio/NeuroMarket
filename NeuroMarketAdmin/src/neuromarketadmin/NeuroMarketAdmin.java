package neuromarketadmin;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;

public class NeuroMarketAdmin {
    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {}

        SwingUtilities.invokeLater(() -> {
            new LoginFrame().setVisible(true);
        });
    }
}
