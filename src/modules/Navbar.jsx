import { NavLink } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"

const navigation = [
  { name: "Home", href: "/home" },
  { name: "Dashboard", href: "/dashboard"},
  { name: "Sensors", href: "/sensors" },
  { name: "Interventions", href: "/interventions" },
  { name: "Measurements", href: "/measurements" },
  { name: "Sites", href: "/sites"}
]

function Navbar() {
  const linkStyles = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`

  return (
    <header>
      <nav className="shadow-lg w-full top-0 z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="hidden md:flex space-x-4 items-center">
              <ThemeToggle />
              {navigation.map((item) =>
                item.subItems ? (
                  <div key={item.name} className="relative group">
                    <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
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
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar