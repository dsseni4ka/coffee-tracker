import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import CalendarHomePage from './pages/CalendarHomePage'
import MapPage from './pages/MapPage'
import BudgetPage from './pages/BudgetPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CalendarHomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<BudgetPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
