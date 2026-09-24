import { useState } from 'react'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
    { id: 'sites', icon: '⌖', label: 'Centros de cultivo' },
    { id: 'sensors', icon: '◉', label: 'Sensores' },
    { id: 'interventions', icon: '⚠', label: 'Intervenciones' },
  ]

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">🌊</div>
          <div>
            <h1>ULA</h1>
            <span>MONITORS</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="section-title">MONITOREO</span>

          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                activePage === item.id ? 'active' : ''
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button className="menu-item">
            <span className="menu-icon">⚙</span>
            <span>Configuración</span>
          </button>

          <div className="user-card">
            <div className="avatar">A</div>

            <div className="user-info">
              <strong>Administrador</strong>
              <span>Sesión activa</span>
            </div>

            <span className="status-dot"></span>
          </div>
        </div>

      </aside>


      {/* CONTENIDO PRINCIPAL */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <span className="breadcrumb">ULA MONITORS /</span>
            <strong>
              {menuItems.find(item => item.id === activePage)?.label}
            </strong>
          </div>

          <div className="topbar-right">

            <div className="connection">
              <span className="connection-dot"></span>
              Sistema operativo
            </div>

            <button className="notification">
              🔔
              <span className="notification-badge">3</span>
            </button>

          </div>

        </header>


        {/* DASHBOARD */}
        {activePage === 'dashboard' && (
          <Dashboard setActivePage={setActivePage} />
        )}

        {/* CENTROS */}
        {activePage === 'sites' && (
          <SitesPage />
        )}

        {/* SENSORES */}
        {activePage === 'sensors' && (
          <SensorsPage />
        )}

        {/* INTERVENCIONES */}
        {activePage === 'interventions' && (
          <InterventionsPage />
        )}

      </main>
    </div>
  )
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ setActivePage }) {
  return (
    <div className="content">

      <div className="page-header">

        <div>
          <p className="eyebrow">MONITOREO GENERAL</p>

          <h2>Resumen operacional</h2>

          <p>
            Supervisa el estado de los centros y sensores
            en tiempo real.
          </p>
        </div>

        <div className="date-box">
          <span>HOY</span>
          <strong>24 SEP 2026</strong>
        </div>

      </div>


      {/* TARJETAS */}
      <div className="stats-grid">

        <StatCard
          icon="⌖"
          title="Centros de cultivo"
          value="12"
          description="Centros monitoreados"
          type="blue"
        />

        <StatCard
          icon="◉"
          title="Sensores activos"
          value="84"
          description="Sensores registrados"
          type="green"
        />

        <StatCard
          icon="!"
          title="Sin transmisión"
          value="3"
          description="Requieren revisión"
          type="orange"
          onClick={() => setActivePage('sensors')}
        />

        <StatCard
          icon="⚠"
          title="Fuera de rango"
          value="2"
          description="Requieren intervención"
          type="red"
          onClick={() => setActivePage('sensors')}
        />

      </div>


      {/* CONTENIDO */}
      <div className="dashboard-grid">

        {/* ESTADO */}
        <section className="panel">

          <div className="panel-header">

            <div>
              <h3>Estado de sensores</h3>
              <p>Resumen de las últimas mediciones</p>
            </div>

            <span className="live-badge">
              <span></span>
              EN VIVO
            </span>

          </div>


          <div className="sensor-status">

            <div className="status-row">
              <div className="status-name">
                <span className="big-status green"></span>
                <span>Normales</span>
              </div>

              <strong>79</strong>
            </div>

            <div className="progress">
              <div
                className="progress-fill green-fill"
                style={{ width: '94%' }}
              ></div>
            </div>


            <div className="status-row">
              <div className="status-name">
                <span className="big-status orange"></span>
                <span>Sin transmisión</span>
              </div>

              <strong>3</strong>
            </div>

            <div className="progress">
              <div
                className="progress-fill orange-fill"
                style={{ width: '4%' }}
              ></div>
            </div>


            <div className="status-row">
              <div className="status-name">
                <span className="big-status red"></span>
                <span>Fuera de rango</span>
              </div>

              <strong>2</strong>
            </div>

            <div className="progress">
              <div
                className="progress-fill red-fill"
                style={{ width: '2%' }}
              ></div>
            </div>

          </div>

        </section>


        {/* ALERTAS */}
        <section className="panel">

          <div className="panel-header">

            <div>
              <h3>Alertas recientes</h3>
              <p>Eventos que requieren atención</p>
            </div>

            <button
              className="text-button"
              onClick={() => setActivePage('interventions')}
            >
              Ver todas →
            </button>

          </div>


          <div className="alert-list">

            <Alert
              type="red"
              title="Sensor fuera de rango"
              location="Centro Chiloé Norte · OX-014"
              time="Hace 8 min"
            />

            <Alert
              type="orange"
              title="Sensor sin transmisión"
              location="Centro Puerto Montt · OX-027"
              time="Hace 17 min"
            />

            <Alert
              type="orange"
              title="Sensor sin transmisión"
              location="Centro Aysén · OX-041"
              time="Hace 26 min"
            />

          </div>

        </section>

      </div>


      {/* CENTROS */}
      <section className="panel sites-panel">

        <div className="panel-header">

          <div>
            <h3>Centros de cultivo</h3>
            <p>Estado actual de los centros monitoreados</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setActivePage('sites')}
          >
            Ver centros →
          </button>

        </div>


        <div className="site-cards">

          <SiteCard
            name="Chiloé Norte"
            location="Región de Los Lagos"
            sensors="18 sensores"
            status="normal"
          />

          <SiteCard
            name="Puerto Montt"
            location="Región de Los Lagos"
            sensors="24 sensores"
            status="warning"
          />

          <SiteCard
            name="Aysén"
            location="Región de Aysén"
            sensors="21 sensores"
            status="normal"
          />

          <SiteCard
            name="Quellón"
            location="Región de Los Lagos"
            sensors="21 sensores"
            status="danger"
          />

        </div>

      </section>

    </div>
  )
}


/* =========================================================
   COMPONENTES
========================================================= */

function StatCard({
  icon,
  title,
  value,
  description,
  type,
  onClick
}) {

  return (
    <div
      className={`stat-card ${type}`}
      onClick={onClick}
    >

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-arrow">↗</span>

      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-description">
        {description}
      </div>

    </div>
  )
}


function Alert({
  type,
  title,
  location,
  time
}) {

  return (
    <div className="alert-item">

      <span className={`alert-indicator ${type}`}></span>

      <div className="alert-content">

        <strong>{title}</strong>

        <span>{location}</span>

        <small>{time}</small>

      </div>

      <span className="alert-arrow">›</span>

    </div>
  )
}


function SiteCard({
  name,
  location,
  sensors,
  status
}) {

  const statusInfo = {
    normal: {
      text: 'Operativo',
      className: 'normal'
    },

    warning: {
      text: 'Atención',
      className: 'warning'
    },

    danger: {
      text: 'Problema',
      className: 'danger'
    }
  }

  const current = statusInfo[status]

  return (
    <div className="site-card">

      <div className="site-top">

        <div className="site-icon">
          ⌖
        </div>

        <span className={`site-status ${current.className}`}>
          <span></span>
          {current.text}
        </span>

      </div>

      <h4>{name}</h4>

      <p>{location}</p>

      <div className="site-footer">
        <span>◉ {sensors}</span>
        <span>→</span>
      </div>

    </div>
  )
}


/* =========================================================
   CENTROS
========================================================= */

function SitesPage() {

  const sites = [
    ['Chiloé Norte', 'Los Lagos', '18', 'normal'],
    ['Puerto Montt', 'Los Lagos', '24', 'warning'],
    ['Aysén', 'Aysén', '21', 'normal'],
    ['Quellón', 'Los Lagos', '21', 'danger'],
    ['Calbuco', 'Los Lagos', '16', 'normal'],
    ['Melinka', 'Aysén', '19', 'normal'],
  ]

  return (
    <div className="content">

      <div className="page-header">

        <div>
          <p className="eyebrow">OPERACIÓN</p>
          <h2>Centros de cultivo</h2>
          <p>
            Consulta y supervisa todos los centros registrados.
          </p>
        </div>

        <div className="total-badge">
          12 centros
        </div>

      </div>


      <div className="filters">

        <div className="search-box">
          🔍
          <input
            type="text"
            placeholder="Buscar centro..."
          />
        </div>

        <select>
          <option>Todas las zonas</option>
          <option>Los Lagos</option>
          <option>Aysén</option>
          <option>Magallanes</option>
        </select>

        <button className="filter-button">
          Filtrar
        </button>

      </div>


      <div className="sites-grid">

        {sites.map((site, index) => (

          <SiteCard
            key={index}
            name={site[0]}
            location={`Región de ${site[1]}`}
            sensors={`${site[2]} sensores`}
            status={site[3]}
          />

        ))}

      </div>


      <div className="pagination">

        <button>←</button>

        <span className="page-active">1</span>
        <span>2</span>
        <span>3</span>

        <button>→</button>

      </div>

    </div>
  )
}


/* =========================================================
   SENSORES
========================================================= */

function SensorsPage() {

  const sensors = [
    ['OX-001', 'Chiloé Norte', '7.82', 'normal', 'Hace 2 min'],
    ['OX-002', 'Chiloé Norte', '8.14', 'normal', 'Hace 3 min'],
    ['OX-014', 'Chiloé Norte', '3.21', 'danger', 'Hace 8 min'],
    ['OX-027', 'Puerto Montt', '—', 'warning', 'Hace 17 min'],
    ['OX-041', 'Aysén', '—', 'warning', 'Hace 26 min'],
    ['OX-052', 'Quellón', '7.54', 'normal', 'Hace 4 min'],
  ]

  return (
    <div className="content">

      <div className="page-header">

        <div>
          <p className="eyebrow">MONITOREO</p>

          <h2>Sensores</h2>

          <p>
            Estado y últimas mediciones de los sensores.
          </p>
        </div>

      </div>


      <div className="filters">

        <div className="search-box">
          🔍
          <input
            type="text"
            placeholder="Buscar sensor..."
          />
        </div>

        <select>
          <option>Todos los estados</option>
          <option>Normal</option>
          <option>Sin transmisión</option>
          <option>Fuera de rango</option>
        </select>

      </div>


      <div className="sensor-table">

        <div className="table-header">
          <span>Sensor</span>
          <span>Centro</span>
          <span>Oxígeno</span>
          <span>Estado</span>
          <span>Última transmisión</span>
          <span></span>
        </div>


        {sensors.map((sensor, index) => (

          <div className="table-row" key={index}>

            <strong>{sensor[0]}</strong>

            <span>{sensor[1]}</span>

            <strong>
              {sensor[2] !== '—'
                ? `${sensor[2]} mg/L`
                : 'Sin datos'}
            </strong>

            <span className={`table-status ${sensor[3]}`}>

              <span></span>

              {sensor[3] === 'normal'
                ? 'Normal'
                : sensor[3] === 'warning'
                  ? 'Sin transmisión'
                  : 'Fuera de rango'}

            </span>

            <span>{sensor[4]}</span>

            <button className="details-button">
              Ver →
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}


/* =========================================================
   INTERVENCIONES
========================================================= */

function InterventionsPage() {

  const interventions = [
    ['INT-001', 'OX-014', 'Sensor fuera de rango', 'Abierta', '24 SEP'],
    ['INT-002', 'OX-027', 'Sin transmisión', 'Abierta', '24 SEP'],
    ['INT-003', 'OX-006', 'Revisión preventiva', 'Cerrada', '23 SEP'],
    ['INT-004', 'OX-041', 'Sin transmisión', 'Abierta', '23 SEP'],
  ]

  return (
    <div className="content">

      <div className="page-header">

        <div>
          <p className="eyebrow">MANTENIMIENTO</p>

          <h2>Intervenciones</h2>

          <p>
            Gestiona las intervenciones abiertas sobre
            centros y sensores.
          </p>
        </div>

        <button className="primary-button">
          + Nueva intervención
        </button>

      </div>


      <div className="filters">

        <div className="search-box">
          🔍
          <input
            type="text"
            placeholder="Buscar intervención..."
          />
        </div>

        <select>
          <option>Todos los estados</option>
          <option>Abierta</option>
          <option>Cerrada</option>
        </select>

      </div>


      <div className="sensor-table">

        <div className="table-header intervention-header">
          <span>ID</span>
          <span>Sensor</span>
          <span>Motivo</span>
          <span>Estado</span>
          <span>Fecha</span>
          <span></span>
        </div>


        {interventions.map((item, index) => (

          <div className="table-row" key={index}>

            <strong>{item[0]}</strong>

            <span>{item[1]}</span>

            <span>{item[2]}</span>

            <span className={`table-status ${
              item[3] === 'Abierta'
                ? 'warning'
                : 'normal'
            }`}>
              <span></span>
              {item[3]}
            </span>

            <span>{item[4]}</span>

            <button className="details-button">
              Ver →
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}


export default App
