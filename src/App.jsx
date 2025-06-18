import { useState, useEffect } from 'react'
import { Search, Book, BookOpen, Settings, Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import './App.css'

// API base URL
const API_BASE = 'https://searchdiligently-backend-clean-production.up.railway.app/api'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTestaments, setSelectedTestaments] = useState([])
  const [selectedBooks, setSelectedBooks] = useState([])
  const [availableBooks, setAvailableBooks] = useState({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth()
    fetchBooks()
  }, [])

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`)
      if (response.ok) {
        setApiStatus('connected')
      } else {
        setApiStatus('error')
      }
    } catch (error) {
      setApiStatus('error')
      console.error('API health check failed:', error)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/books`)
      if (response.ok) {
        const data = await response.json()
        setAvailableBooks(data.books)
      }
    } catch (error) {
      console.error('Failed to fetch books:', error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term')
      return
    }

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
      
      if (data.results && data.results.length === 0) {
        setError('No results found. Try different search terms.')
      }

    } catch (error) {
      setError('Search failed. Please try again.')
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
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

  const clearFilters = () => {
    setSelectedTestaments([])
    setSelectedBooks([])
  }

  // Function to highlight search terms in text
  const highlightSearchTerms = (text, query) => {
    if (!query || !text) return text;
    
    // Split query into individual words and filter out empty strings
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    if (searchTerms.length === 0) return text;
    
    // Create a regex pattern that matches any of the search terms (case insensitive)
    const pattern = new RegExp(`(${searchTerms.map(term => 
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
    ).join('|')})`, 'gi');
    
    // Split text by the pattern and rebuild with highlighting
    const parts = text.split(pattern);
    
    return parts.map((part, index) => {
      // Check if this part matches any search term
      const isMatch = searchTerms.some(term => 
        part.toLowerCase() === term.toLowerCase()
      );
      
      if (isMatch) {
        return <strong key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{part}</strong>;
      }
      return part;
    });
  }

  const testaments = [
    { id: 'old-testament', name: 'Old Testament', icon: Book },
    { id: 'new-testament', name: 'New Testament', icon: BookOpen },
    { id: 'book-of-mormon', name: 'Book of Mormon', icon: Book },
    { id: 'doctrine-and-covenants', name: 'Doctrine & Covenants', icon: BookOpen },
    { id: 'pearl-of-great-price', name: 'Pearl of Great Price', icon: Book }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Banner */}
      <div className="bg-black text-white py-2 px-4">
        <div className="container mx-auto text-center">
          <a 
            href="https://searchdiligently.com/isaiah-class/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded transition-colors"
          >
            Free Isaiah Class
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Search Diligently</h1>
            </div>
            
            {/* API Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-500' : 
                apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-muted-foreground">
                {apiStatus === 'connected' ? 'Connected' : 
                 apiStatus === 'error' ? 'Offline' : 'Connecting...'}
              </span>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className={`lg:col-span-1 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Search Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Scripture Collections</h3>
                  <div className="space-y-2">
                    {testaments.map((testament) => {
                      const Icon = testament.icon
                      const isSelected = selectedTestaments.includes(testament.id)
                      
                      return (
                        <Button
                          key={testament.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => toggleTestament(testament.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {testament.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Individual Books Selection */}
                <div>
                  <h3 className="font-medium mb-3">Individual Books</h3>
                  <div className="space-y-3">
                    {Object.entries(availableBooks).map(([testament, books]) => {
                      // Define chronological order for each testament
                      const getChronologicalOrder = (testamentName, bookList) => {
                        const orders = {
                          'Old Testament': [
                            'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
                            'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
                            '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
                            'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
                            'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
                            'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
                            'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
                          ],
                          'New Testament': [
                            'Matthew', 'Mark', 'Luke', 'John', 'Acts',
                            'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
                            'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
                            '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
                            'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
                            'Jude', 'Revelation'
                          ],
                          'Book of Mormon': [
                            '1 Nephi', '2 Nephi', 'Jacob', 'Enos', 'Jarom', 'Omni',
                            'Words of Mormon', 'Mosiah', 'Alma', 'Helaman',
                            '3 Nephi', '4 Nephi', 'Mormon', 'Ether', 'Moroni'
                          ],
                          'Pearl of Great Price': [
                            'Moses', 'Abraham', 'Joseph Smith—Matthew',
                            'Joseph Smith—History', 'Articles of Faith'
                          ]
                        };

                        const order = orders[testamentName];
                        if (!order) return bookList; // Return original if no order defined

                        // Sort books according to the defined order
                        return bookList.sort((a, b) => {
                          const indexA = order.indexOf(a);
                          const indexB = order.indexOf(b);
                          
                          // If both books are in the order array, sort by their position
                          if (indexA !== -1 && indexB !== -1) {
                            return indexA - indexB;
                          }
                          
                          // If only one is in the order array, prioritize it
                          if (indexA !== -1) return -1;
                          if (indexB !== -1) return 1;
                          
                          // If neither is in the order array, maintain original order
                          return 0;
                        });
                      };

                      const orderedBooks = getChronologicalOrder(testament, [...books]);

                      return (
                        <div key={testament}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{testament}</h4>
                          <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                            {orderedBooks.map((book) => (
                              <div key={book} className="flex items-center space-x-2">
                                <Checkbox
                                  id={book}
                                  checked={selectedBooks.includes(book)}
                                  onCheckedChange={() => toggleBook(book)}
                                />
                                <label
                                  htmlFor={book}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {book}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {(selectedTestaments.length > 0 || selectedBooks.length > 0) && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Form */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Search the scriptures... (e.g., faith, love, 1 Nephi 3:7)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="px-6">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {selectedTestaments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">Searching in:</span>
                      {selectedTestaments.map((testamentId) => {
                        const testament = testaments.find(t => t.id === testamentId)
                        return (
                          <Badge key={testamentId} variant="secondary">
                            {testament?.name}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Search Results ({searchResults.length})
                  </h2>
                </div>

                {searchResults.map((result, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-sm">
                            {result.reference || `${result.book} ${result.chapter}:${result.verse}`}
                          </Badge>
                        </div>
                        
                        <p className="text-foreground leading-relaxed">
                          {highlightSearchTerms(result.text, searchQuery)}
                        </p>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">
                            {result.testament?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Welcome Message */}
            {!searchQuery && searchResults.length === 0 && !error && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold mb-2">Welcome to Search Diligently</h2>
                  <p className="text-muted-foreground mb-6">
                    Search across all LDS standard works including the Bible, Book of Mormon, 
                    Doctrine and Covenants, and Pearl of Great Price.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <h3 className="font-medium mb-2">Search Examples:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• "faith" - Find verses about faith</li>
                        <li>• "1 Nephi 3:7" - Go to specific verse</li>
                        <li>• "love charity" - Multiple words</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Features:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Filter by scripture collection</li>
                        <li>• Bookmark favorite verses</li>
                        <li>• Advanced search options</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="py-6">
        <div className="container mx-auto px-4 text-center">
          <a 
            href="https://searchdiligently.com/isaiah-class/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
              src="/bottom-banner.png" 
              alt="Free Isaiah Class by Search Diligently" 
              className="max-w-full h-auto mx-auto hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Search Diligently version 1
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

