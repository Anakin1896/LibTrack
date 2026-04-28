import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div className="p-10 text-2xl font-bold">Dashboard Coming Soon!</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;