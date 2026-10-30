import { getSite } from '../api/sites'
import { useEffect, useState } from 'react'

export function SiteTableRow({ site, summary, onOpenModal }) {
    const loadingSensors = !summary
    const hasAlerts = summary?.out_of_range > 0 || summary?.no_data > 0

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-100 font-medium">
                {site.name}
            </td>
            <td className="py-3 px-4 border-b dark:border-gray-600">
                {site.isSiteActive ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Activo</span>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Inactivo</span>
                )}
            </td>
            <td className="py-3 px-4 border-b dark:border-gray-600">
                {loadingSensors ? (
                    <span className="text-xs text-gray-400 flex items-center gap-2 animate-pulse">
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        Verificando sensores...
                    </span>
                ) : summary.total === 0 ? (
                    <span className="text-xs text-gray-400">Sin sensores</span>
                ) : (
                    <div className="flex flex-col gap-1 items-start">
                        {!hasAlerts ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Normal ({summary.ok})
                            </span>
                        ) : (
                            <>
                                {summary.out_of_range > 0 && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span> {summary.out_of_range} Fuera de rango
                                    </span>
                                )}
                                {summary.no_data > 0 && (
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-gray-500"></span> {summary.no_data} Sin transmitir
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                )}
            </td>
            <td className="py-3 px-4 border-b dark:border-gray-600 text-center">
                <button
                    onClick={() => onOpenModal(site)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
                >
                    Ver Detalles
                </button>
            </td>
        </tr>
    )
}