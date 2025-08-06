from flask import Flask, render_template, request, jsonify, redirect, session, send_from_directory
import mysql.connector
from flask_cors import CORS
import os
from functools import wraps

app = Flask(__name__, template_folder='html')
CORS(app)
app.secret_key = 'your_secret_key'  # Change this in production!

# -------------------- STATIC FILES --------------------

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.root_path, 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.root_path, 'js'), filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory(os.path.join(app.root_path, 'images'), filename)

# -------------------- DATABASE --------------------

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root@123',
    database='gadgetrepair'
)
cursor = conn.cursor(dictionary=True)

# -------------------- AUTH DECORATOR --------------------

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'customer_id' not in session:
            return redirect('/loginPage?next=' + request.path.lstrip('/'))
        return f(*args, **kwargs)
    return decorated_function

# -------------------- ROUTES --------------------

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/home.html')
def home_customer():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/shopHome')
def home_shop():
    if 'shop_id' in session:
        return render_template('shopHome.html')
    return redirect('/loginPage')

# -------------------- LOGIN / AUTH --------------------

@app.route('/loginPage')
def login_customer_page():
    next_page = request.args.get('next', '')
    return render_template('login.html', next=next_page)

@app.route('/login', methods=['POST'])
def login_customer():
    data = request.get_json()
    email = data['email']
    password = data['password']
    next_page = data.get('next', '')

    cursor.execute("SELECT * FROM customer WHERE email=%s AND password=%s", (email, password))
    user = cursor.fetchone()

    if user:
        session['customer_id'] = user['customer_id']
        redirect_url = f'/{next_page}' if next_page else '/home.html'
        return jsonify({'success': True, 'redirect': redirect_url})
    else:
        return jsonify({'success': False})

@app.route('/shopLogin', methods=['POST'])
def login_shop():
    data = request.get_json()
    email = data['email']
    password = data['password']

    cursor.execute("SELECT * FROM shop WHERE email=%s AND password=%s", (email, password))
    user = cursor.fetchone()

    if user:
        session['shop_id'] = user['shop_id']
        return jsonify({'success': True, 'redirect': '/shopHome'})
    else:
        return jsonify({'success': False})

@app.route('/shopLogin', methods=['GET'])
def shop_login_page():
    return render_template('shopLogin.html')

@app.route('/check_login', methods=['GET'])
def check_login():
    if 'customer_id' in session:
        return jsonify({"logged_in": True})
    else:
        return jsonify({"logged_in": False})

# -------------------- BOOK SLOT --------------------

@app.route('/bookslot')
@login_required
def bookslot():
    customer_id = session['customer_id']
    cursor.execute("SELECT name, email, phone_no, address FROM customer WHERE customer_id = %s", (customer_id,))
    customer = cursor.fetchone()
    return render_template('bookslot.html', customer=customer)

# -------------------- SIGNUP --------------------

@app.route('/signin.html', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        data = request.get_json()
        name = data['name']
        email = data['email']
        password = data['password']
        address = data['address']
        phone = data['phone']

        try:
            cursor.execute(
                "INSERT INTO customer (name, email, password, address, phone_no) VALUES (%s, %s, %s, %s, %s)",
                (name, email, password, address, phone)
            )
            conn.commit()
            return jsonify({'message': 'Registration successful!'})
        except Exception as e:
            print("Registration Error:", e)
            return jsonify({'message': 'Registration failed'}), 500

    return render_template('signin.html')

@app.route('/signinShop', methods=['GET', 'POST'])
def signinShop():
    if request.method == 'POST':
        data = request.get_json()
        name = data['name']
        email = data['email']
        password = data['password']
        address = data['address']
        phone = data['phone']

        try:
            cursor.execute(
                "INSERT INTO shop (name, email, password, address, phone_no) VALUES (%s, %s, %s, %s, %s)",
                (name, email, password, address, phone)
            )
            conn.commit()
            return jsonify({'message': 'Registration successful!'})
        except Exception as e:
            print("Registration Error:", e)
            return jsonify({'message': 'Registration failed'}), 500

    return render_template('signinShop.html')

# -------------------- MAIN --------------------

if __name__ == '__main__':
    app.run(debug=True)
