import sqlite3
from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

# Use /tmp for database on Vercel/Production to avoid Read-Only filesystem errors
if os.environ.get('VERCEL'):
    DB_NAME = "/tmp/mocha.db"
else:
    DB_NAME = "mocha.db"

def init_db():
    # Only initialize if it's a new file
    if not os.path.exists(DB_NAME):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cafes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                image_url TEXT,
                address TEXT,
                rating REAL
            )
        ''')
        # Insert sample data for Belo Horizonte
        sample_cafes = [
            ("Academia do Café", "Um dos pioneiros em cafés especiais em BH. Ambiente aconchegante e torrefação própria.", -19.9329, -43.9378, "/static/assets/cafe1.jpg", "R. Antônio de Albuquerque, 749 - Savassi", 4.8),
            ("Oop Café", "Design minimalista e cafés incríveis. Ótimo lugar para trabalhar e tomar um bom espresso.", -19.9345, -43.9351, "/static/assets/cafe2.jpg", "R. Fernandes Tourinho, 143 - Savassi", 4.7),
            ("Café Magrí", "Charmoso e focado em produtores locais. Servem excelentes métodos filtrados e comidinhas.", -19.9298, -43.9392, "/static/assets/cafe3.jpg", "R. Alvarenga Peixoto, 595 - Lourdes", 4.9),
            ("Elisa Café", "Ambiente sofisticado e grãos selecionados rigorosamente. Perfeito para um encontro especial.", -19.9265, -43.9421, "/static/assets/cafe4.jpg", "R. Sergipe, 1236 - Savassi", 4.6),
        ]
        cursor.executemany('INSERT INTO cafes (name, description, lat, lng, image_url, address, rating) VALUES (?, ?, ?, ?, ?, ?, ?)', sample_cafes)
        conn.commit()
        conn.close()

# Initialize DB on startup
init_db()

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cafes')
def cafes():
    conn = get_db_connection()
    cafes_list = conn.execute('SELECT * FROM cafes').fetchall()
    conn.close()
    return render_template('cafes.html', cafes=cafes_list)

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

@app.route('/api/cafes')
def api_cafes():
    conn = get_db_connection()
    cafes_list = conn.execute('SELECT * FROM cafes').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in cafes_list])

if __name__ == '__main__':
    app.run(debug=True, port=5001)
