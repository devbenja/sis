import React, { useState, useEffect } from "react";
import { IoMdTrash } from "react-icons/io";
import { FaFileInvoice, FaPrint, FaEye, FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../style.css";

const VentasRealizadas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleFechaFinChange = async (e) => {
    const fechaFinSeleccionada = e.target.value;
    setFechaFin(fechaFinSeleccionada); // Actualizar el estado con la fecha seleccionada

    if (fechaInicio && fechaFinSeleccionada) {
      const fechaFinAjustada = new Date(fechaFinSeleccionada);
      fechaFinAjustada.setDate(fechaFinAjustada.getDate() + 1);
      fechaFinAjustada.setHours(0, 0, 0, 0);

      try {
        const response = await fetch(
          "http://localhost:5000/api/reporte-ventas",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fechaInicio,
              fechaFin: fechaFinAjustada.toISOString(),
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            // Mostrar SweetAlert con el mensaje de advertencia
            Swal.fire({
              icon: "warning",
              title: "No se encontraron registros",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            });
          } else {
            setVentas(data);
          }
        } else {
          console.error("Error al generar el reporte de compras");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const mostrarAlertaEliminar = (ventaId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la venta y no se podrá revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarVenta(ventaId);
      }
    });
  };

  const eliminarVenta = async (ventaId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/EliminarVenta/${ventaId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setVentas((prevVentas) =>
          prevVentas.filter((venta) => venta.Codigo !== ventaId)
        );

        Swal.fire(
          "Venta eliminada",
          "La venta ha sido eliminada correctamente",
          "success"
        );
      } else {
        console.error("Error al eliminar la venta");
      }
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
    }
  };

  useEffect(() => {
    const obtenerVentasRealizadas = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Salidas");
        const data = await response.json();
        setVentas(data);
      } catch (error) {
        console.error("Error al obtener las ventas realizadas:", error);
      }
    };

    obtenerVentasRealizadas();
  }, []);

  const obtenerDetallesVenta = async (ventaId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/DetallesVenta/${ventaId}`
      );
      const data = await response.json();
      setDetallesVenta(data);
    } catch (error) {
      console.error("Error al obtener los detalles de la venta:", error);
    }
  };

  const mostrarDetallesVenta = async (venta) => {
    setVentaSeleccionada(venta);
    await obtenerDetallesVenta(venta.Codigo);
    setMostrarDetalles(true);
  };

  const cerrarDetallesVenta = () => {
    setVentaSeleccionada(null);
    setDetallesVenta([]);
    setMostrarDetalles(false);
  };

  //!
  function drawFooter(doc, pageNumber) {
    const footerText = `Página ${pageNumber}`;
    const x = doc.internal.pageSize.getWidth() / 2;
    const y = doc.internal.pageSize.getHeight() - 10;

    // Ajustar el tamaño de fuente y el estilo
    doc.setFontSize(8);
    doc.setFont("normal");

    doc.text(footerText, x, y, { align: "center" });
  }

  const handleDownloadPDF = () => {
    const table = document.querySelector("#table");
    console.log(table);

    const columns = Array.from(
      table.querySelectorAll("thead th:not(:last-child)")
    ).map((headerCell) => headerCell.innerText.trim());

    const ventasConFechaFormateada = ventas.map((venta) => ({
      ...venta,
      FechaFormateada: new Date(venta.Fecha).toLocaleDateString(),
    }));

    const data = Array.from(table.querySelectorAll("tr"))
      .slice(1)
      .map((row) =>
        Array.from(row.querySelectorAll("td"))
          .map((cell, index) => {
            if (index === 1) {
              return ventasConFechaFormateada[row.rowIndex - 1].FechaFormateada;
            } else if (index === 2) {
              return ventas[row.rowIndex - 1].Cliente;
            } else if (index === 3) {
              return ventas[row.rowIndex - 1].Vendedor;
            } else if (index === 4) {
              return ventas[row.rowIndex - 1].Total; // Agrega la extracción del total aquí
            }
            return cell.innerText.trim();
          })
          .filter((cellText) => cellText !== "")
      );
    const totalVentas = ventas.reduce((total, venta) => total + venta.Total, 0);

    // Agregar fila de total al final de los datos
    data.push(["", "", "", "Total", totalVentas]);
    console.log("Columns:", columns);
    console.log("Data:", data);

    const doc = new jsPDF();

    // Agregar imagen de encabezado
    const headerImagePath = "./logo11.jpg"; // Reemplaza "ruta-de-la-imagen" con la ruta real de la imagen
    const imgWidth = doc.internal.pageSize.getWidth(); // Ancho de la imagen igual al ancho de la página
    const imgHeight = 50; // Altura de la imagen (puedes ajustarla según tus necesidades)
    const x = 0; // Posición horizontal de la imagen (comienza desde el borde izquierdo)
    const y = 10; // Posición vertical de la imagen
    doc.addImage(headerImagePath, "JPEG", x, y, imgWidth, imgHeight); // Agregar imagen al PDF

    // Fecha
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10); // Ajustar el tamaño de fuente
    doc.setFont("helvetica", "bold"); // Establecer el estilo de fuente en negrita

    const fechaText = "Fecha:";
    const fechaX = 10; // Posición horizontal del texto "Fecha:"
    const fechaTextWidth =
      (doc.getStringUnitWidth(fechaText) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const fechaActualX = fechaX + fechaTextWidth + 2; // Ajustar el espacio entre el texto y la fecha actual
    doc.text(fechaText, fechaX, imgHeight + 18); // Colocar el texto "Fecha:"
    doc.text(currentDate, fechaActualX, imgHeight + 18); // Colocar la fecha actual

    doc.setFont("helvetica", "normal"); // Restaurar el estilo de fuente normal

    // Texto centrado en la parte superior de la tabla
    const textoSuperior = "Reporte de Ventas";
    const textoSuperiorX = doc.internal.pageSize.getWidth() / 2;
    const textoSuperiorY = imgHeight + 25; // Ajustar la posición vertical del texto superior
    doc.setFontSize(12); // Ajustar el tamaño de fuente para el texto superior
    doc.text(textoSuperior, textoSuperiorX, textoSuperiorY, {
      align: "center",
    });

    doc.autoTable({
      head: [columns],
      body: data,
      startY: imgHeight + 30, // Ajustar la posición vertical de los datos
      didDrawCell: function (data) {
        // Dibujar bordes de las celdas
        const { table, row, column } = data;
        if (row === 0) {
          // Bordes de la fila de encabezado
          doc.setFillColor(230, 230, 230); // Color de fondo para el encabezado
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            "S"
          );
        }
        // Bordes de las celdas
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
      },
    });

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();

    // Iterar sobre cada página y agregar el pie de página
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i); // Establecer la página actual
      drawFooter(doc, i); // Agregar el pie de página
    }

    doc.save("ventas.pdf");
  };

  const generarFactura = async (venta) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/DetallesVenta/${venta.Codigo}`
      );
      const detallesVenta = await response.json();

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("SINFA", 10, 20);

      doc.setFontSize(12);
      doc.text(`Factura Nro: ${venta.Codigo}`, 10, 30);
      doc.text(`Fecha: ${new Date(venta.Fecha).toLocaleDateString()}`, 10, 40);
      doc.text(`Cliente: ${venta.Cliente}`, 10, 50);
      doc.text(`Vendedor: ${venta.Vendedor}`, 10, 60);

      const tableOptions = {
        head: [
          [
            "Producto",
            "Descripción",
            "Cantidad",
            "Precio",
            "Descuento",
            "Subtotal",
            "IVA",
            "Total",
          ],
        ],
        body: detallesVenta.map((detalle) => [
          detalle.Producto,
          detalle.Descripcion,
          detalle.Cantidad,
          `$${detalle.Precio}`,
          `$${detalle.Descuento}`,
          `$${detalle.Subtotal}`,
          `$${detalle.IVA}`,
          `$${detalle.Total}`,
        ]),
        startY: 70,
        headStyles: {
          fillColor: [30, 144, 255], // Color azul más fuerte
          textColor: [255, 255, 255],
          fontSize: 10,
          halign: "center",
          lineColor: [0, 0, 0], // Color del borde de la celda
        },
        bodyStyles: {
          fontSize: 10,
          halign: "center",
          lineColor: [0, 0, 0], // Color del borde de la celda
        },
        theme: "grid", // Elimina el borde entre filas
      };

      doc.autoTable(tableOptions);

      const total = detallesVenta.reduce(
        (total, detalle) => total + detalle.Total,
        0
      );
      const totalY = doc.autoTable.previous.finalY + 10;
      const totalX = doc.internal.pageSize.getWidth() - 10;

      const totalPagado = venta.TotalPagado;
      const cambio = totalPagado - total;
      const totalPagadoY = totalY + 10;
      const cambioY = totalPagadoY + 10;

      doc.text(`Total: $${total}`, totalX, totalY, { align: "right" });
      doc.text(`Total Pagado: $${totalPagado}`, totalX, totalPagadoY, {
        align: "right",
      });
      doc.text(`Cambio: $${cambio}`, totalX, cambioY, { align: "right" });

      // Generar Blob a partir del PDF generado
      const pdfBlob = doc.output("blob");

      // Crear un objeto URL para el Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Abrir una nueva ventana para visualizar el PDF
      const newWindow = window.open(pdfUrl, "_blank", "width=800,height=600");
      if (!newWindow) {
        console.error("No se pudo abrir la nueva ventana.");
      }
    } catch (error) {
      console.error("Error al generar la factura:", error);
    }
  };

  return (
    <div>
      <div className="md:col-span-2 col-span-2 bg-white p-5 rounded-lg shadow-lg">
        {/* new */}
        <div className="flex flex-wrap items-center justify-center">
          <div className="w-full lg:w-1/4 mb-2 sm:mr-2">
            <label
              className="text-gray-700 font-semibold mb-2"
              htmlFor="startDate"
            >
              Fecha de inicio
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 uppercase py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </label>
          </div>
          <div className="w-full lg:w-1/4 mb-2 sm:mr-4">
            <label
              className="text-gray-700 font-semibold mb-2"
              htmlFor="endDate"
            >
              Fecha de fin
              <input
                type="date"
                value={fechaFin}
                // onChange={(e) => setFechaFin(e.target.value)}
                onChange={handleFechaFinChange}
                className="w-full uppercase px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 "
                required
              />
            </label>
          </div>
          <div className="flex mt-4 items-center justify-center gap-2">
            {/*Prueba */}
            <button
              onClick={handleDownloadPDF}
              id="btnPdf"
              type="button"
              download="ventas.pdf"
              className="bg-blue-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded ms-5 mb-4"
            >
              Generar pdf
            </button>
          </div>
        </div>
        {/* arriba new */}
        <h2 className="mb-4">Ventas realizadas</h2>

        <table className="App-auto w-1/2" id="table">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 text-center border">
            <tr>
              <th scope="col" className="py-3 border">
                Código
              </th>
              <th scope="col" className="py-3 border">
                Fecha
              </th>
              <th scope="col" className="py-3 border">
                Cliente
              </th>
              <th scope="col" className="py-3 border">
                Vendedor
              </th>
              <th scope="col" className="py-3 border">
                Total
              </th>
              <th scope="col" className="py-3 border">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.Codigo} venta={venta}>
                <td className="border px-4 py-2 text-center">{venta.Codigo}</td>
                <th className="border px-4 py-2 text-center">
                  {new Date(venta.Fecha).toLocaleDateString()}
                </th>
                <td className="border px-4 py-2 text-center">
                  {venta.Cliente}
                </td>
                <td className="border px-4 py-2 text-center">
                  {venta.Vendedor}
                </td>
                <td className="border px-4 py-2 text-center">{venta.Total}</td>
                <td className="border px-4 py-2 flex justify-evenly">
                  <button
                    className="h-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => mostrarDetallesVenta(venta)}
                    title=""
                    data-title={`Detalle venta Nro. ${venta.Codigo}`}
                  >
                    <FaShoppingCart className="w-15" />
                  </button>
                  <button
                    className=" h-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => generarFactura(venta)} // Llamar a la función generarFactura
                    data-title={`Imprimir factura Nro. ${venta.Codigo}`}
                  >
                    <FaPrint className="w-15" />
                  </button>

                  <button
                    className=" h-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    // onClick={() => eliminarProducto(index)}
                    onClick={() => mostrarAlertaEliminar(venta.Codigo)}
                    data-title={`Eliminar venta Nro. ${venta.Codigo}`}
                  >
                    <IoMdTrash className="w-15" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mostrarDetalles && detallesVenta.length > 0 && (
          <div className="mt-4">
            <h3>Detalles de la Venta</h3>
            <table className="App-auto w-full">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 text-center border">
                <tr>
                  <th scope="col" className="py-3 border">
                    Codigo
                  </th>
                  <th scope="col" className="py-3 border">
                    Producto
                  </th>
                  <th scope="col" className="py-3 border">
                    Descripcion
                  </th>
                  <th scope="col" className="py-3 border">
                    Cantidad
                  </th>
                  <th scope="col" className="py-3 border">
                    Precio
                  </th>
                  <th scope="col" className="py-3 border">
                    Descuento
                  </th>
                  <th scope="col" className="py-3 border">
                    Subtotal
                  </th>
                  <th scope="col" className="py-3 border">
                    Iva
                  </th>
                  <th scope="col" className="py-3 border">
                    Total
                  </th>
                  {/* ... otras columnas de detalles ... */}
                </tr>
              </thead>
              <tbody>
                {detallesVenta.map((detalle) => (
                  <tr key={detalle.ProductoId}>
                    <td className="border px-4 py-2 text-center">
                      {detalle.IdVenta}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Producto}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Descripcion}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Cantidad}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Precio}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Descuento}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Subtotal}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.IVA}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {detalle.Total}
                    </td>
                    {/* ... otras celdas de detalles ... */}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={cerrarDetallesVenta}
            >
              Cerrar Detalles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasRealizadas;
