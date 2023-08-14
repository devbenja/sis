import { useState } from 'react';
import { IoMdTrash } from 'react-icons/io';
import { BiEdit } from "react-icons/bi";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export const CardsProductos = ({ nombre, descripcion, stock, id, precioC, precioV, update }) => {

    const [nombreProducto, setNombreProducto] = useState('');
    const [descrip, setDescrip] = useState('');
    const [precioCompra, setPrecioCompra] = useState('');
    const [precioVenta, setPrecioVenta] = useState('');

    const [isOpen, setIsOpen] = useState(false);

    const [mensajeExitoso, setMensajeExitoso] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [mostrarAlertaExitosa, setMostrarAlertaExitosa] = useState(false);
    const [mostrarAlertaError, setMostrarAlertaError] = useState(false);

    const handleNombreProductoChange = (event) => {
        setNombreProducto(event.target.value);
    };

    const handleDescripcionChange = (event) => {
        setDescrip(event.target.value);
    };

    const handlePrecioCompraChange = (event) => {
        setPrecioCompra(event.target.value);
    };

    const handlePrecioVentaChange = (event) => {
        setPrecioVenta(event.target.value);
    };

    // Abrir el modal
    const openModal = () => {
        setIsOpen(true);
        setNombreProducto(nombre);
        setDescrip(descripcion);
        setPrecioCompra(precioC);
        setPrecioVenta(precioV);
    };

    // Cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };


    // Funcion que crea una alerta y la muestra
    const mostrarSweetAlert = async () => {
        const MySwal = withReactContent(Swal);
        const result = await MySwal.fire({
            title: 'Eliminar Producto',
            text: `¿Seguro de eliminar el Producto ${nombre}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            handleSubmitDelete();
        }
    };

    // Funcion que hace la peticion delete
    const handleSubmitDelete = async () => {

        try {

            const response = await fetch('http://localhost:5000/api/DeleteProducto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Producto Eliminado', `El producto ${nombre}  fue eliminado`, 'success');
            } else {
                alert(data.mensaje)
            }

        } catch (error) {
            console.log(error);
        }

        update(true)

    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Realizar la solicitud de actualización al backend utilizando fetch
            const response = await fetch(
                `http://localhost:5000/api/ActualizarProducto/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ nombreProducto, descrip, precioCompra, precioVenta }),
                }
            );

            if (response.ok) {

                const data = await response.json();

                setMensajeExitoso(data.message);
                setMostrarAlertaExitosa(true);
                setNombreProducto('');
                setDescrip('');
                setPrecioCompra('');
                setPrecioVenta('');

                setTimeout(() => {
                    setMostrarAlertaExitosa(false);
                }, 2000);

                setMostrarAlertaError(false)
            } else {
                console.error("Error al actualizar el producto:", response.statusText);
                setMensajeError("Error al actualizar el producto");
                setMostrarAlertaError(true);
                setMensajeExitoso('');
                setMostrarAlertaExitosa(false);
            }
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            setMensajeError(error)
            setMostrarAlertaError(true);

        }

        update(true);

    };

    return (
        <tbody>
            <tr>
                <td className="border px-6 py-4 text-center">{id}</td>
                <td className="border px-6 py-4">{nombre}</td>
                <td className="border px-6 py-4">{descripcion}</td>
                <td className="border px-6 py-4 text-center">{stock}</td>
                <td className="border px-6 py-4 text-center">{precioC} C$</td>
                <td className="border px-6 py-4 text-center">{precioV} C$</td>
                <td className="border px-5 py-3 flex items-center justify-center">
                    <button className="flex items-center ml-5 bg-red-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <IoMdTrash className='w-15' onClick={mostrarSweetAlert} />
                    </button>
                    <button className="flex items-center ml-5 bg-green-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <BiEdit className='w-15' onClick={openModal}/>
                    </button>
                </td>
            </tr>
            {
                isOpen && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 modal-backdrop bg-black bg-opacity-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-2/5 mx-auto">

                            <h2 className="text-xl font-semibold mb-10">Editar Producto</h2>

                            {mostrarAlertaExitosa && (
                                <div className="mt-5 flex bg-green-100 rounded-lg p-4 mb-4 text-sm text-green-700" role="alert">
                                    <svg className="w-5 h-5 inline mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                                    <div>
                                        <span className="font-medium">{mensajeExitoso}</span>
                                    </div>
                                </div>
                            )}

                            {mostrarAlertaError && (

                                <div className="mt-5 flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700" role="alert">
                                    <svg className="w-5 h-5 inline mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                                    <div>
                                        <span className="font-medium">{mensajeError}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Nombre Producto</label>
                                    <input
                                        value={nombreProducto}
                                        onChange={handleNombreProductoChange}
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="mb-7">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Descripcion</label>
                                    <textarea
                                        value={descrip}
                                        onChange={handleDescripcionChange}
                                        type="text"
                                        id="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="mb-7">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Precio Compra</label>
                                    <input
                                        value={precioCompra}
                                        onChange={handlePrecioCompraChange}
                                        type="text"
                                        id="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="mb-7">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Precio Venta</label>
                                    <input
                                        value={precioVenta}
                                        onChange={handlePrecioVentaChange}
                                        type="text"
                                        id="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3 sm:justify-center lg:justify-end">
                                    <button
                                        type="submit"
                                        className="mr-3 bg-green-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                                    >
                                        Guardar Cambios
                                    </button>
                                    <button
                                        className="bg-gray-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                                        onClick={closeModal}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                )
            }
        </tbody>
    )
}