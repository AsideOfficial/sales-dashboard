import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import ConfigForm from './components/ConfigForm'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [databaseId, setDatabaseId] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)

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
