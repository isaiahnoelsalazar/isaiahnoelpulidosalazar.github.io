import sqlite3

class EasySQL:
    def create_table(self, dbname: str, table_name: str, columns: list):
        connection = sqlite3.connect(dbname + ".db")
        sql_query = "CREATE TABLE IF NOT EXISTS " + table_name + "("
        for a in columns:
            column: dict = a
            sql_query += list(column.keys())[0] + " " + list(column.values())[0] + ", "
        sql_query = sql_query[:-2] + ")"
        connection.cursor().execute(sql_query)
        connection.commit()

    def print_table(self, dbname: str, table_name: str):
        connection = sqlite3.connect(dbname + ".db")
        print(connection.cursor().execute("SELECT * FROM " + table_name).fetchall())

    def get_table_values(self, dbname: str, table_name: str):
        connection = sqlite3.connect(dbname + ".db")
        return connection.cursor().execute("SELECT * FROM " + table_name).fetchall()

    def insert_to_table(self, dbname: str, table_name: str, values: list):
        connection = sqlite3.connect(dbname + ".db")
        sql_query = "INSERT INTO " + table_name + "("
        for a in values:
            value: dict = a
            sql_query += list(value.keys())[0] + ", "
        sql_query = sql_query[:-2] + ") VALUES ("
        for a in values:
            value: dict = a
            sql_query += "'" + str(list(value.values())[0]) + "', "
        sql_query = sql_query[:-2] + ")"
        connection.cursor().execute(sql_query)
        connection.commit()

    def delete_from_table(self, dbname: str, table_name: str, columnValuePair: dict):
        connection = sqlite3.connect(dbname + ".db")
        sql_query = "DELETE FROM " + table_name + " WHERE " + list(columnValuePair.items())[0][0] + "='" + list(columnValuePair.items())[0][1] + "'"
        connection.cursor().execute(sql_query)
        connection.commit()
    
    def clear_table(self, dbname: str, table_name: str):
        connection = sqlite3.connect(dbname + ".db")
        sql_query = "DELETE FROM " + table_name
        connection.cursor().execute(sql_query)
        connection.commit()
    
    def delete_table(self, dbname: str, table_name: str):
        connection = sqlite3.connect(dbname + ".db")
        sql_query = "DROP TABLE " + table_name
        connection.cursor().execute(sql_query)
        connection.commit()

'''
How to use:
# Import the class
from easy_sql import EasySQL

# Create an instance of the class
a = EasySQL()

# Define the columns for the table
columns = [{"fname": "text"}, {"lname": "text"}]

# Create specified table
a.create_table("sample", "sampletable", columns)

# Define the values to be inserted
values = [{"fname": "Isaiah"}, {"lname": "Salazar"}]
values1 = [{"fname": "Saia"}, {"lname": "Razalas"}]

# Insert the values into specified table
a.insert_to_table("sample", "sampletable", values)
a.insert_to_table("sample", "sampletable", values1)

# Print the values in specified table
print(a.get_table_values("sample", "sampletable"))

# Delete a column-value pair from a specified table
a.delete_from_table("sample", "sampletable", {"fname": "Saia"})
'''
