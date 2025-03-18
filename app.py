from flask import Flask, render_template, flash, redirect, session, url_for, request, jsonify

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # For flashing messages

@app.route("/")
def signup():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return render_template("create_account.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if 'user_id' in session:
        return redirect(url_for('home'))
    if request.method == "POST":
        data = request.get_json()
        user_id = data.get('user_id')
        session['user_id'] = user_id  # Set the user_id in session after login
        return jsonify({"message": "Login successful"}), 200
    return render_template("login_page.html")

@app.route("/home")
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("home.html")

@app.route("/logout")
def logout():
    session.pop('user_id', None)
    flash("You have been logged out.")
    return redirect(url_for('login'))

@app.route("/query")
def query():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("query.html")

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    user_id = data.get('user_id')
    session['user_id'] = user_id  # Set the user_id in session after registration
    return jsonify({"message": "Registration successful"}), 200

@app.route("/upload-book")
def upload_book():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("book-upload.html")

@app.route("/book-details")
def book_details():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    book_id = request.args.get('id')
    return render_template("book-details.html", book_id=book_id)

if __name__ == "__main__":
    app.run(debug=True)