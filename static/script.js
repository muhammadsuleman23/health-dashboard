const MAX_POINTS = 30;
let prevNet = null;

function makeChart(id, datasets) {
  return new Chart(document.getElementById(id), {
    type: "line",
    data: { labels: [], datasets },
    options: {
      animation: false,
      scales: {
        y: { beginAtZero: true, ticks: { color: "#94a3b8" }, grid: { color: "#334155" } },
        x: { display: false },
      },
      plugins: { legend: { labels: { color: "#e2e8f0" } } },
      elements: { point: { radius: 0 }, line: { tension: 0.3 } },
    },
  });
}

const usageChart = makeChart("usageChart", [
  { label: "CPU %", data: [], borderColor: "#38bdf8" },
  { label: "RAM %", data: [], borderColor: "#f472b6" },
]);
usageChart.options.scales.y.max = 100;

const netChart = makeChart("netChart", [
  { label: "Download", data: [], borderColor: "#22c55e" },
  { label: "Upload", data: [], borderColor: "#facc15" },
]);

function push(chart, label, values) {
  chart.data.labels.push(label);
  values.forEach((v, i) => chart.data.datasets[i].data.push(v));
  if (chart.data.labels.length > MAX_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(d => d.data.shift());
  }
  chart.update();
}

function setBar(id, pct) {
  const el = document.getElementById(id);
  el.style.width = pct + "%";
  el.style.background = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
}

function fmtUptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function esc(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

async function update() {
  try {
    const r = await fetch("/api/stats");
    const s = await r.json();

    document.getElementById("meta").textContent = `${s.host} | ${s.os} | Uptime: ${fmtUptime(s.uptime)}`;
    document.getElementById("cpu").textContent = s.cpu.toFixed(1) + "%";
    document.getElementById("cores").textContent = s.cores + " cores";
    document.getElementById("ram").textContent = s.ram.toFixed(1) + "%";
    document.getElementById("ram-detail").textContent = `${s.ram_used} / ${s.ram_total} GB`;
    document.getElementById("disk").textContent = s.disk.toFixed(1) + "%";
    document.getElementById("disk-detail").textContent = `${s.disk_used} / ${s.disk_total} GB`;
    setBar("cpu-bar", s.cpu); setBar("ram-bar", s.ram); setBar("disk-bar", s.disk);

    const temps = Object.values(s.temps);
    document.getElementById("temp").textContent = temps.length ? temps[0].toFixed(0) + "°C" : "N/A";

    const label = new Date().toLocaleTimeString();
    push(usageChart, label, [s.cpu, s.ram]);

    if (prevNet) {
      const dt = s.time - prevNet.time;
      push(netChart, label, [
        ((s.net_recv - prevNet.recv) / dt / 1024).toFixed(1),
        ((s.net_sent - prevNet.sent) / dt / 1024).toFixed(1),
      ]);
    }
    prevNet = { time: s.time, recv: s.net_recv, sent: s.net_sent };

    document.getElementById("proc-body").innerHTML = s.processes.map(p =>
      `<tr><td>${p.pid}</td><td>${esc(p.name || "")}</td><td>${(p.cpu_percent || 0).toFixed(1)}</td><td>${(p.memory_percent || 0).toFixed(1)}</td></tr>`
    ).join("");
  } catch (e) {
    document.getElementById("meta").textContent = "Unable to reach server...";
  }
}

update();
setInterval(update, 2000);
