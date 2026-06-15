import './AppShell.css'

function AppShell({ sidebar, list, detail }) {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        {sidebar}
      </aside>
      <main className="app-shell__list">
        {list}
      </main>
      {detail && (
        <section className="app-shell__detail">
          {detail}
        </section>
      )}
    </div>
  )
}

export default AppShell