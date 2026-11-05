import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Accueil } from './screens/Accueil';
import { Armoire } from './screens/Armoire';
import { Article } from './screens/Article';
import { Bienvenue } from './screens/Bienvenue';
import { Conversation } from './screens/Conversation';
import { Messages } from './screens/Messages';
import { Paiement } from './screens/Paiement';
import { Publier } from './screens/Publier';
import { Recherche } from './screens/Recherche';
import { Suivi } from './screens/Suivi';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenue />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/publier" element={<Publier />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Conversation />} />
        <Route path="/paiement/:id" element={<Paiement />} />
        <Route path="/commande/:id" element={<Suivi />} />
        <Route path="/armoire" element={<Armoire />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
