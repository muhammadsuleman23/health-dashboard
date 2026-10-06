# System Health Dashboard

A lightweight, real-time system monitoring dashboard for Linux, built with Python, Flask, and Chart.js.

![Dashboard](docs/dashboard.png)

## Features
- Live CPU, RAM, and disk usage with color-coded thresholds
- Real-time network throughput graph
- Top 5 CPU-intensive processes
- Auto-refresh every 2 seconds via a JSON API (`/api/stats`)

## Tech Stack
Python, Flask, psutil, JavaScript, Chart.js

## How to Run
```bash
git clone https://github.com/muhammadsuleman23/health-dashboard.git
cd health-dashboard
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Then open `http://localhost:5000` in your browser.

## Stress Test
```bash
sudo apt install stress
stress --cpu 4 --timeout 60
```

## Notes
Temperature sensors are usually not exposed inside virtual machines, so that card shows N/A on a VM.

## Future Improvements
- Threshold alerts (email/Telegram)
- Docker deployment
- Historical metrics storage

## Author
Muhammad Suleman
