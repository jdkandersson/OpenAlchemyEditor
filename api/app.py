"""Flask application."""

import connexion
import flask_cors
from library import config

app = connexion.FlaskApp(__name__, specification_dir="openapi/")
app.add_api("editor.yaml")
flask_cors.CORS(
    app.app,
    resources="*",
    origins=config.get_env().access_control_allow_origin,
    allow_headers=config.get_env().access_control_allow_headers,
)
