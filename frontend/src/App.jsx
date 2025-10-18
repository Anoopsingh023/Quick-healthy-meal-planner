import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DesktopDashboard from './components/DesktopDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DesktopDashboard/>
    </>
  )
}

export default App
