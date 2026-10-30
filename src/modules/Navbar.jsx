import { useState } from "react"
import { NavLink } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"

const navigation = [
  { name: "Inicio", href: "/home" },
  { name: "Centros", href: "/sites" },
  { name: "Intervenciones", href: "/interventions" },
  { name: "Medidas", href: "/measurements" },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const linkStyles = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    }`

  const mobileLinkStyles = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    }`

  return (
    <header className="sticky top-0 z-50">
      <nav className="shadow border-b border-gray-200 dark:border-gray-800 w-full bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="hidden md:flex space-x-2 items-center flex-1">
              {navigation.map((item) =>
                item.subItems ? (
                  <div key={item.name} className="relative group">
                    <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      {item.name}
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.href}
                          className={({ isActive }) =>
                            `px-4 py-3 text-sm transition-colors ${
                              isActive
                                ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                            }`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink key={item.name} to={item.href} className={linkStyles}>
                    {item.name}
                  </NavLink>
                )
              )}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <ThemeToggle />
              <div className="flex md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Abrir menú principal</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {navigation.map((item) => (
              <div key={item.name}>
                <NavLink
                  to={item.href}
                  className={mobileLinkStyles}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </NavLink>
                {item.subItems && (
                  <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 ml-3">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400 font-bold"
                              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar