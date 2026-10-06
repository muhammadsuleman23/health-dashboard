import os
import time
import platform
import psutil
from flask import Flask, jsonify, render_template

app = Flask(__name__)
DISK_PATH = "C:\\" if os.name == "nt" else "/"

psutil.cpu_percent(interval=None)
for p in psutil.process_iter():
    try:
        p.cpu_percent(None)
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        pass


def get_temps():
    if not hasattr(psutil, "sensors_temperatures"):
        return {}
    try:
        temps = psutil.sensors_temperatures()
        return {k: v[0].current for k, v in temps.items() if v}
    except Exception:
        return {}


def top_processes(n=5):
    procs = []
    for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            procs.append(p.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    procs.sort(key=lambda x: x["cpu_percent"] or 0, reverse=True)
    return procs[:n]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/stats")
def stats():
    net = psutil.net_io_counters()
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage(DISK_PATH)
    return jsonify({
        "time": time.time(),
        "host": platform.node(),
        "os": platform.platform(),
        "uptime": int(time.time() - psutil.boot_time()),
        "cpu": psutil.cpu_percent(interval=None),
        "cores": psutil.cpu_count(),
        "ram": mem.percent,
        "ram_used": round(mem.used / 1024**3, 2),
        "ram_total": round(mem.total / 1024**3, 2),
        "disk": disk.percent,
        "disk_used": round(disk.used / 1024**3, 1),
        "disk_total": round(disk.total / 1024**3, 1),
        "net_sent": net.bytes_sent,
        "net_recv": net.bytes_recv,
        "temps": get_temps(),
        "processes": top_processes(),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
