; NeuroMarket Admin — Script de instalador Inno Setup
; Genera un instalador profesional .exe que instala el programa en cualquier PC

#define MyAppName "NeuroMarket Admin"
#define MyAppVersion "1.0"
#define MyAppPublisher "NeuroMarket — Ingeniería en Sistemas 2026"
#define MyAppExeName "NeuroMarketAdmin.exe"

[Setup]
AppId={{A1B2C3D4-1234-5678-ABCD-NEUROMARKET01}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\NeuroMarketAdmin
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=.\installer
OutputBaseFilename=NeuroMarketAdmin_Setup_v1.0
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear acceso directo en el Escritorio"; GroupDescription: "Iconos adicionales:"; Flags: unchecked

[Files]
; El .exe generado por Launch4j
Source: "dist\NeuroMarketAdmin.exe"; DestDir: "{app}"; Flags: ignoreversion

; El driver JDBC — NetBeans lo copia aquí automáticamente
Source: "dist\lib\*.jar"; DestDir: "{app}\lib"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\{#MyAppName}";           Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Desinstalar NeuroMarket Admin"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}";     Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Abrir NeuroMarket Admin"; Flags: nowait postinstall skipifsilent
