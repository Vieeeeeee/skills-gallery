import subprocess
import time
import os

pid_file = "/tmp/skills_gallery_vite.pid"
log_file = "/tmp/skills_gallery_vite.log"

if os.path.exists(pid_file):
    try:
        with open(pid_file, "r") as f:
            old_pid = int(f.read().strip())
        os.kill(old_pid, 9)
    except Exception:
        pass

with open(log_file, "w") as out:
    proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
        stdout=out,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
        start_new_session=True
    )

with open(pid_file, "w") as f:
    f.write(str(proc.pid))

print(f"Vite dev server daemon started with PID {proc.pid}")
