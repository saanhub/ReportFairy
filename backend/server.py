from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

import sqlite3
import pandas as pd
import sqlite3
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

#print("aaaaa")
app = Flask(__name__)
CORS(app)


@app.route('/api/query', methods=['POST'])
def handle_query():
# Establish connection with SQLite database
    data = request.json
    message = data["message"]
    df = pd.read_csv('supermarket_sales.csv')
    connection = sqlite3.connect('demo.db')
    df.to_sql('supermarket_sales', connection, if_exists='replace', index=False)
    cursor = connection.cursor()

    #print(message)

    start_index = message.find("SELECT")
    end_index = message.find(";")

    # Extract the substring
    shortened_message = message[start_index:end_index+1]

    print("shortened_message: ", shortened_message)

    
    invoice_id_to_query = '631-41-3108'
    cursor.execute(shortened_message)
    #cursor.execute("SELECT City FROM supermarket_sales WHERE Invoice_ID = ?;", (invoice_id_to_query,))
    result = cursor.fetchone()
    #cursor.close()

    # data = request.json
    # invoice_id = data.get('invoice_id')
    #value = 200
    return jsonify(result[0]), 200

    if invoice_id:
        cursor = connection.cursor()
        invoice_id_to_query = '631-41-3108'
        cursor.execute("SELECT City FROM supermarket_sales WHERE Invoice_ID = ?;", (invoice_id_to_query,))
        result = cursor.fetchone()
        #cursor.close()

        if result:
            return jsonify({'city': result[0]})
        else:
            return jsonify({'error': 'No record found for the given Invoice ID.'}), 404
    else:
        return jsonify({'error': 'Invoice ID not provided.'}), 400
    
#For Image    
@app.route('/api/image/', methods=['GET'])
def get_image():
    connection = sqlite3.connect('demo.db')
    cursor = connection.cursor()
    cursor.execute("""
        SELECT City, AVG(gross_income) AS gross_income
        FROM supermarket_sales
        GROUP BY City
    """)
    results = cursor.fetchall()
    cursor.close()
    connection.close()
    df = pd.DataFrame(results, columns=['City', 'gross_income'])
    sns.barplot(x='City', y='gross_income', data=df)
    plt.xlabel('City')
    plt.ylabel('Gross Income')
    plt.title('Gross Income by City')
    plt.savefig('total_rating_by_city.jpg')

    connection = sqlite3.connect('demo.db')
    cursor = connection.cursor()
    cursor.execute("""
        SELECT City, AVG(gross_income) AS gross_income
        FROM supermarket_sales
        GROUP BY City
    """)
    results = cursor.fetchall()
    cursor.close()
    connection.close()
    df = pd.DataFrame(results, columns=['City', 'gross_income'])
    sns.barplot(x='City', y='gross_income', data=df)
    plt.xlabel('City')
    plt.ylabel('Gross Income')
    plt.title('Gross Income by City')
    plt.savefig('total_rating_by_city.jpg')
    image_path = 'total_rating_by_city.jpg'
    return send_file(image_path, mimetype='image/jpg'), 200

@app.route('/api/image2/', methods=['GET'])
def get_image2():
    connection = sqlite3.connect('demo.db')
    cursor = connection.cursor()
    cursor.execute("""
        SELECT Branch, AVG(Rating) AS Avg_Rating
        FROM supermarket_sales
        GROUP BY Branch
    """)
    results = cursor.fetchall()
    cursor.close()
    connection.close()
    df = pd.DataFrame(results, columns=['Branch', 'Avg_Rating'])
    plt.figure(figsize=(8, 6))
    plt.pie(df['Avg_Rating'], labels=df['Branch'], autopct='%1.1f%%', startangle=140)
    plt.title('Average Rating for Each Branch')
    plt.savefig('average_rating_for_each_branch_pie_chart.jpg')
    image_path = 'average_rating_for_each_branch_pie_chart.jpg'
    return send_file(image_path, mimetype='image/jpg'), 200


if __name__ == '__main__':
    app.run(debug=True)
