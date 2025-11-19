const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");
const service = require("../services/recibos.service");

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const desde = req.query.desde || null;
    const hasta = req.query.hasta || null;
    const search = req.query.search || null;

    const data = await service.listar({ desde, hasta, search });

    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar recibos", error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) return res.status(400).json({ message: "ID inválido" });

    const item = await service.obtenerPorId(id);
    if (!item) return res.status(404).json({ message: "Recibo no encontrado" });

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener recibo", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { monto, fecha_pago, numero_recibo } = req.body || {};

    if (!monto || !fecha_pago || !numero_recibo) {
      return res.status(400).json({ message: "monto, fecha_pago y numero_recibo son obligatorios" });
    }

    const nuevo = await service.crear({ monto, fecha_pago, numero_recibo });
    return res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El número de recibo ya existe" });
    }
    return res.status(500).json({ message: "Error al crear recibo", error: err.message });
  }
};

// NUEVA FUNCIÓN: Generar PDF
exports.descargarPdf = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Buscamos los datos completos del recibo (copia similar a la lógica de listar pero para uno solo)
    const [rows] = await pool.execute(
      `
      SELECT 
        r.*, 
        COALESCE(
          CONCAT(p_arr.nombres, ' ', p_arr.apellidos),
          CONCAT(p_sol.nombres, ' ', p_sol.apellidos),
          CONCAT(p_tras.nombres, ' ', p_tras.apellidos),
          'Desconocido'
        ) AS pagador,
        CASE
          WHEN a.id IS NOT NULL THEN CONCAT('Arrendamiento Nicho ', IFNULL(n_arr.numero, '?'))
          WHEN s.id IS NOT NULL THEN CONCAT('Compra Nicho ', IFNULL(n_sol.numero, '?'))
          WHEN t.id IS NOT NULL THEN 'Traspaso de Título'
          ELSE 'Pago General'
        END AS concepto
      FROM recibos r
      LEFT JOIN arrendamientos a ON a.recibo_id = r.id
      LEFT JOIN propietarios p_arr ON a.propietario_id = p_arr.id
      LEFT JOIN nichos n_arr ON a.nicho_id = n_arr.id
      LEFT JOIN solicitudes_compra s ON s.recibo_id = r.id
      LEFT JOIN propietarios p_sol ON s.propietario_id = p_sol.id
      LEFT JOIN nichos n_sol ON s.nicho_id = n_sol.id
      LEFT JOIN traspasos t ON t.recibo_id = r.id
      LEFT JOIN propietarios p_tras ON t.nuevo_propietario_id = p_tras.id
      WHERE r.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).send("Recibo no encontrado");
    }

    const recibo = rows[0];

    // Formateamos la fecha y el monto para mostrar
    const fechaPago = new Date(recibo.fecha_pago).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const montoFormateado = `Q ${Number(recibo.monto).toFixed(2)}`;

    // 2. Crear el documento PDF con un layout más profesional
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Configurar headers para que el navegador sepa que es un PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=recibo-${recibo.numero_recibo}.pdf`);

    doc.pipe(res); // Enviamos el PDF directo a la respuesta

    // --- DISEÑO MEJORADO DEL RECIBO ---

    doc.fillColor('#333333').font('Helvetica');

    // Encabezado principal
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('CEMENTERIO MUNICIPAL', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(16)
      .font('Helvetica')
      .text('COMPROBANTE DE PAGO', { align: 'center' })
      .moveDown(1.5);

    // Línea divisoria
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown(1);

    // Información del recibo
    doc.fontSize(12).font('Helvetica');
    const infoY = doc.y;
    doc.text('Recibo No.:', 50, infoY);
    doc.font('Helvetica-Bold').text(`${recibo.numero_recibo}`, 150, infoY);

    const fechaY = doc.y + 15;
    doc.font('Helvetica').text('Fecha de Pago:', 50, fechaY);
    doc.font('Helvetica-Bold').text(`${fechaPago}`, 150, fechaY);
    doc.moveDown(2);

    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown(1.5);

    // Detalles principales
    doc.fontSize(14).font('Helvetica');
    const detailsY = doc.y;

    doc.text('Recibimos de:', 50, detailsY);
    doc.font('Helvetica-Bold').text(`${recibo.pagador}`, 200, detailsY);

    const amountY = doc.y + 15;
    doc.font('Helvetica').text('La cantidad de:', 50, amountY);
    doc.fillColor('#166534').font('Helvetica-Bold').text(`${montoFormateado}`, 200, amountY);
    doc.fillColor('#333333');

    const conceptY = doc.y + 15;
    doc.font('Helvetica').text('Por concepto de:', 50, conceptY);
    doc.font('Helvetica-Bold').text(`${recibo.concepto}`, 200, conceptY);
    doc.moveDown(2);

    // Pie de página / notas
    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown(1);

    doc
      .fontSize(10)
      .font('Helvetica-Oblique')
      .text(
        'Este recibo es un comprobante de pago válido para los registros del cementerio municipal.',
        50,
        doc.y,
        { align: 'center' }
      )
      .moveDown(2);

    // Espacio para firmas
    const lineY = doc.page.height - 120;
    doc
      .moveTo(120, lineY)
      .lineTo(320, lineY)
      .stroke();
    doc.text('Firma Autorizada', 170, lineY + 10);

    doc.end();
  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).send('Error interno del servidor al generar PDF');
  }
};

