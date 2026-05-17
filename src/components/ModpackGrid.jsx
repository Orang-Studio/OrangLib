import ModpackCard from './ModpackCard.jsx'
import './ModpackGrid.css'
const ModpackGrid = ({ modpacks }) => {
  return (
    <div className="modpack-grid">
      {modpacks.map((modpack) => (
        <ModpackCard key={modpack.id} modpack={modpack} />
      ))}
    </div>
  )
}
export default ModpackGrid