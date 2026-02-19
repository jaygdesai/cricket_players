import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Collection from './pages/Collection';
import Shop from './pages/Shop';
import DreamXI from './pages/DreamXI';
import DailyChallenge from './pages/DailyChallenge';
import Leaderboard from './pages/Leaderboard';
import Multiplayer from './pages/Multiplayer';
import Profile from './pages/Profile';
import Battle from './pages/Battle';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/dream-xi" element={<DreamXI />} />
      <Route path="/daily" element={<DailyChallenge />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/multiplayer" element={<Multiplayer />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/battle" element={<Battle />} />
    </Routes>
  );
}
