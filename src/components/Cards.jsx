export function CardSites({data, onOpenModal}) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                {data.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Código: {data.code}</p>
            
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                    onClick={() => onOpenModal(data)}
                    className={data.active ? "px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors":
                        "px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"}
                >
                    Ver detalles
                </button>
            </div>
        </div>
    )
}