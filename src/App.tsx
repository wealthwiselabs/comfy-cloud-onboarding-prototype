import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { SignIn } from './views/SignIn'
import { Intake } from './views/Intake'
import { Studio } from './views/Studio'
import { Build } from './views/Build'
import { Showroom } from './views/Showroom'
import { Explore } from './views/Explore'

export default function App() {
  return (
    <Routes>
      {/* Full-screen onboarding (no app shell) */}
      <Route path="/" element={<SignIn />} />
      <Route path="/intake" element={<Intake />} />

      {/* In-product, wrapped in the Comfy dark shell */}
      <Route element={<AppShell />}>
        <Route path="/studio" element={<Studio />} />
        <Route path="/build" element={<Build />} />
        <Route path="/showroom" element={<Showroom />} />
        <Route path="/explore" element={<Explore />} />
      </Route>
    </Routes>
  )
}
