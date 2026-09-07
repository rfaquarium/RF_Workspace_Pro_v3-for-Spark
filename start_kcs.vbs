Set WshShell = CreateObject("WScript.Shell")
' Thiet lap thu muc lam viec ve thu muc du an Rich Fish
WshShell.CurrentDirectory = "C:\Users\ADMIN\RF_Workspace_Pro"
' Chay ngam an hoan toan cua so cmd (tham so 0), ghi log ra server.log
WshShell.Run "cmd /c "".\venv\Scripts\python.exe server_kcs.py > server.log 2>&1""", 0, False
