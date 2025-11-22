# backend klasöründesin:
cd ~/Documents/hardware/backend

# (opsiyonel) Eski, bozulmuş bir venv varsa silmek istersen:
# rm -rf venv

# Yeni venv oluştur (Python 3)
python3 -m venv venv
source venv/bin/activate

# prompt'ta (venv) görmen lazım:
# (venv) orhan@...

python manage.py runserver 0.0.0.0:8000
# veya
python3 manage.py runserver 0.0.0.0:8000

