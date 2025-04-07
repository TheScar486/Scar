import pymysql
from fpdf import FPDF

# Conexión a MySQL
conexion = pymysql.connect(
    host='localhost',
    user='root',
    password=r'450642Osr$_&',
    db='base_de_datos',
    port=3307
)
cursor = conexion.cursor()

cursor.execute("SELECT id, numero_pedido, estado, creado_por, grupo, fecha_creacion FROM pedidos")
pedidos = cursor.fetchall()

# Clase PDF con diseño bonito
class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.set_text_color(255, 255, 255)
        self.set_fill_color(30, 60, 120)  # azul oscuro
        self.cell(0, 12, 'REPORTE DE PEDIDOS', 0, 1, 'C', fill=True)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 10)
        self.set_text_color(100)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

# Crear PDF en modo vertical (portrait)
pdf = PDF()  # No necesitamos orientation='P' porque es el valor por defecto
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.set_font('Arial', 'B', 10)

# Colores del encabezado
pdf.set_fill_color(30, 60, 120)
pdf.set_text_color(255, 255, 255)

# Encabezados con anchos ajustados para formato vertical
headers = ["ID", "Pedido", "Estado", "Creado por", "Grupo", "Fecha creación"]
widths = [10, 25, 35, 45, 35, 45]

for i in range(len(headers)):
    pdf.cell(widths[i], 10, headers[i], border=0, align='C', fill=True)
pdf.ln()

# Cuerpo de la tabla
pdf.set_font('Arial', '', 9)
fill = False

for fila in pedidos:
    pdf.set_fill_color(245, 245, 245) if fill else pdf.set_fill_color(255, 255, 255)
    pdf.set_text_color(0)

    pdf.cell(widths[0], 8, str(fila[0]), border=0, align='C', fill=True)
    pdf.cell(widths[1], 8, str(fila[1]), border=0, align='C', fill=True)
    pdf.cell(widths[2], 8, str(fila[2]), border=0, align='C', fill=True)
    pdf.cell(widths[3], 8, str(fila[3]), border=0, align='C', fill=True)
    pdf.cell(widths[4], 8, str(fila[4]) if fila[4] else '-', border=0, align='C', fill=True)
    pdf.cell(widths[5], 8, str(fila[5]), border=0, align='C', fill=True)
    pdf.ln()
    fill = not fill

# Guardar PDF
pdf.output("pedidos_vertical.pdf")
conexion.close()

print("✅ PDF 'pedidos_vertical.pdf' generado en modo vertical con estilo 🎨")
