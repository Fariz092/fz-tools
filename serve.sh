#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")"
python -m http.server 3000 --bind 0.0.0.0
