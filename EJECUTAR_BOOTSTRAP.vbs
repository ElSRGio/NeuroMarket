Set oShell = CreateObject("WScript.Shell")
Set oFS = CreateObject("Scripting.FileSystemObject")

scriptDir = oFS.GetParentFolderName(WScript.ScriptFullName)

' Open CMD, go to project folder, run bootstrap, and stay open to show results
Dim cmd
cmd = "cmd.exe /k cd /d """ & scriptDir & """ && python bootstrap.py && echo. && echo LISTO - Todos los archivos fueron creados."

oShell.Run cmd, 1, False
