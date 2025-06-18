import { useState, useEffect } from 'react'

// API base URL
const API_BASE = 'https://searchdiligently-backend-clean-production.up.railway.app/api'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Check backend connection on load
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`)
      if (response.ok) {
        setIsConnected(true)
        setError(null)
      } else {
        setIsConnected(false)
        setError('Backend connection failed')
      }
    } catch (err) {
      setIsConnected(false)
      setError('Cannot connect to backend')
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 1000
        }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (err) {
      setError('Search failed. Please try again.')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const highlightText = (text, query) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="highlight">{part}</span> : 
        part
    )
  }

  const openIsaiahClass = () => {
    window.open('https://searchdiligently.com/isaiah-class/', '_blank')
  }

  return (
    <div className="app">
      {/* Top Banner */}
      <div className="banner">
        <div className="container">
          <a href="#" onClick={openIsaiahClass}>
            FREE ISAIAH CLASS
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>Search Diligently</h1>
            <p>Advanced Scripture Search Tool</p>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          {/* Connection Status */}
          <div className={`status ${isConnected ? 'connected' : 'error'}`}>
            {isConnected ? '✅ Connected' : '❌ Connection Error'}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scriptures... (e.g., faith, love, hope)"
              className="search-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !isConnected}
              className="search-btn"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="status error">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="results">
            {isLoading && (
              <div className="loading">
                Searching scriptures...
              </div>
            )}

            {searchResults.length > 0 && (
              <div>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b' }}>
                  Found {searchResults.length} results for "{searchQuery}"
                </p>
                {searchResults.map((result) => (
                  <div key={result.id} className="result-item">
                    <div className="result-reference">
                      {result.book} {result.chapter}:{result.verse}
                    </div>
                    <div className="result-text">
                      {highlightText(result.text, searchQuery)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isLoading && (
              <div className="status">
                No results found for "{searchQuery}". Try different keywords.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="bottom-banner">
        <div className="container">
          <img 
            src="/bottom-banner.png" 
            alt="Free Isaiah Class by Search Diligently"
            onClick={openIsaiahClass}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 Search Diligently version 1</p>
        </div>
      </footer>
    </div>
  )
}

export default App

