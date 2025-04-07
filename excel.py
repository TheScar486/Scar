import pymysql
import pandas as pd

# Conexión a MySQL
conexion = pymysql.connect(
    host='localhost',
    user='root',
    password=r'450642Osr$_&',
    db='base_de_datos',
    port=3307
)

# Consulta SQL
query = "SELECT id, numero_pedido, estado, creado_por, grupo, fecha_creacion FROM pedidos"

# Leer datos directamente a un DataFrame de pandas
df = pd.read_sql(query, conexion)

# Guardar como archivo Excel
df.to_excel("pedidos.xlsx", index=False, engine='openpyxl')

conexion.close()
print("✅ Archivo 'pedidos.xlsx' generado con éxito 📊")
