import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import AdminLogin from './components/AdminLogin'
import AdminPanel from './components/AdminPanel'
import { apiService, Poem } from './services/api'

function App() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visitCount, setVisitCount] = useState<number>(0)

  useEffect(() => {
    loadPoems()
    checkAdminStatus()
    loadAndIncrementVisits()
  }, [])

  const loadAndIncrementVisits = async () => {
    try {
      // Önce mevcut ziyaret sayısını al
      const visitsData = await apiService.getVisits()
      setVisitCount(visitsData.count)
      
      // Sonra ziyaret sayısını artır
      const incrementedData = await apiService.incrementVisits()
      setVisitCount(incrementedData.count)
    } catch (error) {
      console.error('Ziyaret sayacı hatası:', error)
    }
  }

  const loadPoems = async () => {
    try {
      setLoading(true)
      const poemsData = await apiService.getPoems()
      setPoems(poemsData)
      setError(null)
    } catch (err) {
      console.error('Şiirler yüklenirken hata:', err)
      setError('Şiirler yüklenirken bir hata oluştu')
      // Fallback: LocalStorage'dan yükle
      const savedPoems = localStorage.getItem('poems')
      if (savedPoems) {
        setPoems(JSON.parse(savedPoems))
      }
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = () => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAdmin(true)
    }
  }

  const addPoem = async (poem: Omit<Poem, '_id' | 'date'> & { date?: string }) => {
    try {
      const newPoem = await apiService.addPoem(poem.title, poem.content, poem.date)
      setPoems(prev => [newPoem, ...prev])
      return true
    } catch (err) {
      console.error('Şiir eklenirken hata:', err)
      return false
    }
  }

  const deletePoem = async (id: string) => {
    try {
      await apiService.deletePoem(id)
      setPoems(prev => prev.filter(poem => poem._id !== id))
      return true
    } catch (err) {
      console.error('Şiir silinirken hata:', err)
      return false
    }
  }

  const updatePoem = async (id: string, title: string, content: string, date?: string) => {
    try {
      const updatedPoem = await apiService.updatePoem(id, title, content, date)
      setPoems(prev => prev.map(poem => poem._id === id ? updatedPoem : poem))
      return true
    } catch (err) {
      console.error('Şiir güncellenirken hata:', err)
      return false
    }
  }

  const loginAdmin = async (username: string, password: string) => {
    try {
      await apiService.login(username, password)
      setIsAdmin(true)
      return true
    } catch (err) {
      console.error('Giriş hatası:', err)
      return false
    }
  }

  const logoutAdmin = () => {
    apiService.clearToken()
    setIsAdmin(false)
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bağlantı Hatası</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPoems}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-white">
      <Routes>
        <Route path="/" element={<HomePage poems={poems} isAdmin={isAdmin} logoutAdmin={logoutAdmin} visitCount={visitCount} />} />
        <Route path="/poem/:id" element={<HomePage poems={poems} isAdmin={isAdmin} logoutAdmin={logoutAdmin} visitCount={visitCount} />} />
        <Route path="/admin/login" element={<AdminLogin loginAdmin={loginAdmin} />} />
        <Route path="/admin" element={<AdminPanel poems={poems} addPoem={addPoem} deletePoem={deletePoem} updatePoem={updatePoem} isAdmin={isAdmin} />} />
      </Routes>
    </div>
  )
}

export default App 