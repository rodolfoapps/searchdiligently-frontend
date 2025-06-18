import { useState, useEffect } from 'react'

// API base URL
const API_BASE = 'https://searchdiligently-backend-clean-production.up.railway.app/api'

// Scripture Collections
const SCRIPTURE_COLLECTIONS = [
  'Old Testament',
  'New Testament', 
  'Book of Mormon',
  'Doctrine and Covenants',
  'Pearl of Great Price'
]

// Individual Books in chronological order
const INDIVIDUAL_BOOKS = {
  'Old Testament': [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
    'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ],
  'New Testament': [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
    'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ],
  'Book of Mormon': [
    '1 Nephi', '2 Nephi', 'Jacob', 'Enos', 'Jarom', 'Omni', 'Words of Mormon', 'Mosiah',
    'Alma', 'Helaman', '3 Nephi', '4 Nephi', 'Mormon', 'Ether', 'Moroni'
  ],
  'Doctrine and Covenants': [
    'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5', 'Section 6', 'Section 7', 'Section 8',
    'Section 9', 'Section 10', 'Section 11', 'Section 12', 'Section 13', 'Section 14', 'Section 15', 'Section 16',
    'Section 17', 'Section 18', 'Section 19', 'Section 20', 'Section 21', 'Section 22', 'Section 23', 'Section 24',
    'Section 25', 'Section 26', 'Section 27', 'Section 28', 'Section 29', 'Section 30', 'Section 31', 'Section 32',
    'Section 33', 'Section 34', 'Section 35', 'Section 36', 'Section 37', 'Section 38', 'Section 39', 'Section 40',
    'Section 41', 'Section 42', 'Section 43', 'Section 44', 'Section 45', 'Section 46', 'Section 47', 'Section 48',
    'Section 49', 'Section 50', 'Section 51', 'Section 52', 'Section 53', 'Section 54', 'Section 55', 'Section 56',
    'Section 57', 'Section 58', 'Section 59', 'Section 60', 'Section 61', 'Section 62', 'Section 63', 'Section 64',
    'Section 65', 'Section 66', 'Section 67', 'Section 68', 'Section 69', 'Section 70', 'Section 71', 'Section 72',
    'Section 73', 'Section 74', 'Section 75', 'Section 76', 'Section 77', 'Section 78', 'Section 79', 'Section 80',
    'Section 81', 'Section 82', 'Section 83', 'Section 84', 'Section 85', 'Section 86', 'Section 87', 'Section 88',
    'Section 89', 'Section 90', 'Section 91', 'Section 92', 'Section 93', 'Section 94', 'Section 95', 'Section 96',
    'Section 97', 'Section 98', 'Section 99', 'Section 100', 'Section 101', 'Section 102', 'Section 103', 'Section 104',
    'Section 105', 'Section 106', 'Section 107', 'Section 108', 'Section 109', 'Section 110', 'Section 111', 'Section 112',
    'Section 113', 'Section 114', 'Section 115', 'Section 116', 'Section 117', 'Section 118', 'Section 119', 'Section 120',
    'Section 121', 'Section 122', 'Section 123', 'Section 124', 'Section 125', 'Section 126', 'Section 127', 'Section 128',
    'Section 129', 'Section 130', 'Section 131', 'Section 132', 'Section 133', 'Section 134', 'Section 135', 'Section 136',
    'Section 137', 'Section 138'
  ],
  'Pearl of Great Price': [
    'Moses', 'Abraham', 'Joseph Smith—Matthew', 'Joseph Smith—History', 'Articles of Faith'
  ]
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Filtering states
  const [selectedTestaments, setSelectedTestaments] = useState([])
  const [selectedBooks, setSelectedBooks] = useState([])
  const [showCollections, setShowCollections] = useState(false)
  const [showIndividualBooks, setShowIndividualBooks] = useState(false)

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
          testaments: selectedTestaments,
          books: selectedBooks,
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

  const toggleTestament = (testament) => {
    setSelectedTestaments(prev => 
      prev.includes(testament) 
        ? prev.filter(t => t !== testament)
        : [...prev, testament]
    )
  }

  const toggleBook = (book) => {
    setSelectedBooks(prev => 
      prev.includes(book) 
        ? prev.filter(b => b !== book)
        : [...prev, book]
    )
  }

  const clearAllFilters = () => {
    setSelectedTestaments([])
    setSelectedBooks([])
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

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          <div className="content-grid">
            
            {/* Left Sidebar - Filters */}
            <aside className="sidebar">
              <div className="filter-section">
                <h3>Filter Options</h3>
                
                {/* Clear Filters */}
                {(selectedTestaments.length > 0 || selectedBooks.length > 0) && (
                  <button className="clear-filters" onClick={clearAllFilters}>
                    Clear All Filters
                  </button>
                )}

                {/* Scripture Collections */}
                <div className="filter-group">
                  <button 
                    className="filter-toggle"
                    onClick={() => setShowCollections(!showCollections)}
                  >
                    Scripture Collections {showCollections ? '▼' : '▶'}
                  </button>
                  
                  {showCollections && (
                    <div className="filter-options">
                      {SCRIPTURE_COLLECTIONS.map(testament => (
                        <label key={testament} className="filter-option">
                          <input
                            type="checkbox"
                            checked={selectedTestaments.includes(testament)}
                            onChange={() => toggleTestament(testament)}
                          />
                          <span>{testament}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Individual Books */}
                <div className="filter-group">
                  <button 
                    className="filter-toggle"
                    onClick={() => setShowIndividualBooks(!showIndividualBooks)}
                  >
                    Individual Books {showIndividualBooks ? '▼' : '▶'}
                  </button>
                  
                  {showIndividualBooks && (
                    <div className="filter-options">
                      {Object.entries(INDIVIDUAL_BOOKS).map(([testament, books]) => (
                        <div key={testament} className="book-group">
                          <h4>{testament}</h4>
                          <div className="book-list">
                            {books.map(book => (
                              <label key={book} className="filter-option book-option">
                                <input
                                  type="checkbox"
                                  checked={selectedBooks.includes(book)}
                                  onChange={() => toggleBook(book)}
                                />
                                <span>{book}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Filters Display */}
                {(selectedTestaments.length > 0 || selectedBooks.length > 0) && (
                  <div className="selected-filters">
                    <h4>Active Filters:</h4>
                    {selectedTestaments.map(testament => (
                      <span key={testament} className="filter-tag">
                        {testament}
                        <button onClick={() => toggleTestament(testament)}>×</button>
                      </span>
                    ))}
                    {selectedBooks.map(book => (
                      <span key={book} className="filter-tag">
                        {book}
                        <button onClick={() => toggleBook(book)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Main Search Area */}
            <main className="search-main">
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
                    <p className="results-count">
                      Found {searchResults.length} results for "{searchQuery}"
                      {(selectedTestaments.length > 0 || selectedBooks.length > 0) && (
                        <span className="filter-info"> (filtered)</span>
                      )}
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
                    No results found for "{searchQuery}". Try different keywords or adjust your filters.
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

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

