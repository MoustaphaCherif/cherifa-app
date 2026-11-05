import { NavLink } from 'react-router-dom';
import { IconChat, IconHome, IconPlus, IconSearch, IconUser } from './Icons';

const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'tab active' : 'tab');

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      <NavLink to="/accueil" className={cls}><IconHome />Accueil</NavLink>
      <NavLink to="/recherche" className={cls}><IconSearch />Chercher</NavLink>
      <NavLink to="/publier" className="tab-sell" aria-label="Vendre un article"><IconPlus /></NavLink>
      <NavLink to="/messages" className={cls}><IconChat />Messages</NavLink>
      <NavLink to="/armoire" className={cls}><IconUser />Armoire</NavLink>
    </nav>
  );
}
