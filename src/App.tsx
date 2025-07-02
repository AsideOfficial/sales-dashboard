import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ConfigForm from './components/ConfigForm'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('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')
  const [databaseId, setDatabaseId] = useState('2247166b6c1c802089aaf44091b480e4')
  const [isConfigured, setIsConfigured] = useState(true)

  const handleConfigSubmit = (newApiKey: string, newDatabaseId: string) => {
    setApiKey(newApiKey)
    setDatabaseId(newDatabaseId)
    setIsConfigured(true)
  }

  return (
    <div className="App">
      {!isConfigured ? (
        <ConfigForm onConfigSubmit={handleConfigSubmit} />
      ) : (
        <div className="dashboard-wrapper">
          <Dashboard apiKey={apiKey} databaseId={databaseId} />
        </div>
      )}
    </div>
  )
}

export default App
