import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Accueil } from './screens/Accueil';
import { Article } from './screens/Article';
import { Bienvenue } from './screens/Bienvenue';
import { Bientot } from './screens/Bientot';
import { Publier } from './screens/Publier';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenue />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/publier" element={<Publier />} />
        <Route path="/recherche" element={<Bientot titre="Recherche" />} />
        <Route path="/messages" element={<Bientot titre="Messages" />} />
        <Route path="/armoire" element={<Bientot titre="Sama armoire" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
