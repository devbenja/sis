import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';
import abrirMenu from '../assets/control.png';
import home from '../assets/Chart_fill.png';
import client from '../assets/User.png';
import provider from '../assets/Chart.png';
import entrada from '../assets/Calendar.png';
import salidas from '../assets/Folder.png';
import factura from '../assets/Setting.png';
import products from '../assets/Chart.png';

export const SideBar = () => {

    const [open, setOpen] = useState(true);

    const Menus = [
        { title: "Home", src: home, to: "/" },
        { title: "Clientes", src: client, to: "/Clientes", gap: true },
        { title: "Proveedores", src: provider, to: "/Proveedores" },
        { title: "Productos", src: products, to: "/Productos" },
        { title: "Ventas", src: entrada, to: "/Ventas", gap: true },
        { title: "Compras", src: salidas,to: "/Compras" },
        { title: "Facturas", src: factura }
    ];

    return (
        <div className={`${open ? "w-60" : "w-20 "} bg-dark-purple h-screen p-5  pt-8 relative duration-300`}>
            <img
                src={abrirMenu}
                className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purpleborder-2 rounded-full  ${!open && "rotate-180"}`}
                onClick={() => setOpen(!open)}
                alt='openmenu'
            />
            <div className="flex gap-x-4 items-center">
                <img
                    src={Logo}
                    className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"}`}
                    alt='logo'
                />
                <h1 className={`text-white origin-left font-medium duration-200 ${!open && "scale-0"}`}>
                    Inventario
                </h1>
            </div>
            <ul className="pt-6">
                {Menus.map((Menu, index) => (
                    <li
                        key={index}
                        className={`flex  rounded-md p-2 mb-5 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 ${Menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-light-white"}`}
                    >
                        <img src={Menu.src} alt='icon' />
                        <Link to={Menu.to} className={`${!open && "hidden"} origin-left font-medium duration-200`}>
                            {Menu.title}
                        </Link>
                    </li>
                ))}

                <li
                        className={`flex  rounded-md p-2 mb-7 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4`}
                >
                    <img src={products} alt='icon' />
                    <a href='/Clientes' className={`${!open && "hidden"} origin-left font-medium duration-200`}>Log out</a>
                </li>   
            </ul>
            
        </div>
    )
}
