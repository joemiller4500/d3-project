import numpy as np
import pandas as pd
import datetime as dt


import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template

#################################################
# Database Setup
#################################################
rds_connection_string = "postgres:postgres@localhost:5432/bars_db"
engine = create_engine(f'postgresql://{rds_connection_string}')

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

@app.route("/")
def welcome():
    # return render_template("index.html")
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/all_data<br/>"
        f"/api/v1.0/location_data<br/>"
        f"/api/v1.0/rating_data<br/>"
        f"/api/v1.0/category_data<br/>"
        f"/api/v1.0/category_count_data<br/>"
    )

@app.route("/api/v1.0/all_data")
def getdata():
    res = session.execute('SELECT * FROM "bars_sf" ')
    ret = []
    for x in res:
        ret.append(list(x))
    print(ret)
    return jsonify(ret)

@app.route("/api/v1.0/location_data")
def locationData():
    res = session.execute('SELECT "name", "latitude", "longitude" FROM "bars_sf" ')
    ret = []
    for x in res:
        ret.append(list(x))
    print(ret)
    return jsonify(ret)

@app.route("/api/v1.0/rating_data")
def ratingData():
    res = session.execute('SELECT "name", "latitude", "longitude", "rating" FROM "bars_sf" ')
    ret = []
    for x in res:
        ret.append(list(x))
    print(ret)
    return jsonify(ret)


@app.route("/api/v1.0/category_data")
def categoryData():
    res = session.execute('SELECT "name", "category", "latitude", "longitude" FROM "bars_sf" ')
    ret = []
    for x in res:
        ret.append(list(x))
    print(ret)
    return jsonify(ret)

@app.route("/api/v1.0/category_count_data")
def categoryCountData():
    res = session.execute('SELECT "index", "category" FROM "category_count" ')
    ret = []
    for x in res:
        ret.append(list(x))
    print(ret)
    return jsonify(ret)

if __name__ == '__main__':
    app.run(debug=True)

