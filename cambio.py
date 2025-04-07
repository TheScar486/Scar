import pandas as pd
import pymysql

# Leer archivo Excel modificado por el usuario
df = pd.read_excel("pedidos.xlsx")

# Conectarse a MySQL
conexion = pymysql.connect(
    host='localhost',
    user='root',
    password=r'450642Osr$_&',
    db='base_de_datos',
    port=3307
)
cursor = conexion.cursor()

# Recorrer cada fila del Excel y actualizar en MySQL
for index, row in df.iterrows():
    update_sql = """
        UPDATE pedidos
        SET estado = %s,
            grupo = %s,
            creado_por = %s
        WHERE numero_pedido = %s
    """
    valores = (
        row['estado'],
        row['grupo'],
        row['creado_por'],
        row['numero_pedido']  # Puedes usar ID si lo prefieres
    )
    cursor.execute(update_sql, valores)

conexion.commit()
conexion.close()
print("✅ Base de datos actualizada correctamente desde el Excel 🛠️")
