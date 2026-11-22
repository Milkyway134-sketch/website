import os

from flask import Flask, send_from_directory


app = Flask(__name__)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


@app.route("/")
def home():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/<path:filename>")
def asset(filename):
    return send_from_directory(STATIC_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))
