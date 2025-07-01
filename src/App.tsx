import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import ConfigForm from './components/ConfigForm'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('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')
  const [databaseId, setDatabaseId] = useState('2237166b6c1c8072b143f5d53ffb96f9')
  const [isConfigured, setIsConfigured] = useState(true)

  const handleConfigSubmit = (newApiKey: string, newDatabaseId: string) => {
    setApiKey(newApiKey)
    setDatabaseId(newDatabaseId)
    setIsConfigured(true)
  }

  const handleReset = () => {
    setApiKey('')
    setDatabaseId('')
    setIsConfigured(false)
  }

  return (
    <div className="App">
      {!isConfigured ? (
        <ConfigForm onConfigSubmit={handleConfigSubmit} />
      ) : (
        <div className="dashboard-wrapper">
          <button onClick={handleReset} className="reset-button">
            설정 변경
          </button>
          <Dashboard apiKey={apiKey} databaseId={databaseId} />
        </div>
      )}
    </div>
  )
}

export default App
