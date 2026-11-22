import os
import socket

from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route("/")
def home():
    return render_template(
        "index.html",
        vinstore_url=os.getenv("VINSTORE_URL", "/projects/vinstore/"),
        games_url=os.getenv("GAMES_URL", "/projects/games/"),
        lyrics_url=os.getenv("LYRICS_URL", "/static/projects/animasi-lirik/I-miss-you.py"),
    )


@app.route("/projects/vinstore/")
def vinstore_project():
    return send_from_directory(
        "static/projects/vinstore", "index.html", mimetype="text/html"
    )


@app.route("/projects/games/")
def games_project():
    return send_from_directory(
        "static/projects/games", "index.html", mimetype="text/html"
    )


@app.route("/projects/lyrics/")
def lyrics_project():
    return send_from_directory(
        "static/projects/animasi-lirik", "index.html", mimetype="text/html"
    )


@app.route("/projects/lyrics/<path:filename>")
def lyrics_asset(filename):
    return send_from_directory("static/projects/animasi-lirik", filename)


@app.route("/projects/vinstore/<path:filename>")
def vinstore_asset(filename):
    return send_from_directory("static/projects/vinstore", filename)


@app.route("/projects/games/<path:filename>")
def games_asset(filename):
    return send_from_directory("static/projects/games", filename)


def find_available_port(preferred_port=5000):
    for port in range(preferred_port, preferred_port + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            if server_socket.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise RuntimeError("Tidak ada port tersedia di rentang 5000-5099")


if __name__ == "__main__":
    port = find_available_port()
    print(f"Website berjalan di http://127.0.0.1:{port}/")
    app.run(host="127.0.0.1", port=port, debug=True)
