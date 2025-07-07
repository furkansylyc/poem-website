import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Poem, Comment } from '../types'
import { apiService } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'

interface HomePageProps {
  poems: Poem[]
  isAdmin: boolean
  logoutAdmin: () => void
  visitCount: number
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
}

const HomePage = ({ poems, isAdmin, logoutAdmin, visitCount, showToast }: HomePageProps) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [directPoem, setDirectPoem] = useState<Poem | null>(null)
  const [loadingDirectPoem, setLoadingDirectPoem] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const viewedPoems = useRef<Set<string>>(new Set())
  
  // Önce poems array'inden ara
  const selectedPoem = poems.find(p => p._id === id) || directPoem

  // Direkt URL'de şiir ID'si varsa ve poems array'inde yoksa, API'den çek
  useEffect(() => {
    if (id && !poems.find(p => p._id === id) && !directPoem && !loadingDirectPoem) {
      setLoadingDirectPoem(true)
      apiService.getPoem(id)
        .then(poem => {
          setDirectPoem(poem)
        })
        .catch(error => {
          console.error('Şiir yüklenirken hata:', error)
          // Hata durumunda directPoem null kalır, "Şiir Bulunamadı" gösterilir
        })
        .finally(() => {
          setLoadingDirectPoem(false)
        })
    }
  }, [id, poems, directPoem, loadingDirectPoem])

  // URL'de şiir ID'si varsa ve poems array'inde varsa, görüntülenme sayısını artır
  useEffect(() => {
    if (id && poems.find(p => p._id === id) && !loadingDirectPoem) {
      const poem = poems.find(p => p._id === id)
      if (poem) {
        incrementPoemViews(poem._id)
      }
    }
  }, [id, poems, loadingDirectPoem])

  // Şiir değiştiğinde yorumları yükle
  useEffect(() => {
    if (selectedPoem) {
      loadComments()
    }
  }, [selectedPoem])

  const incrementPoemViews = async (poemId?: string) => {
    const targetPoemId = poemId || selectedPoem?._id
    if (!targetPoemId) return
    
    // Bu şiir daha önce görüntülenmişse artırma
    if (viewedPoems.current.has(targetPoemId)) return
    
    try {
      // Şiir görüntülenme sayısını artır
      await apiService.getPoem(targetPoemId)
      // Görüntülenen şiirleri kaydet
      viewedPoems.current.add(targetPoemId)
    } catch (error) {
      console.error('Şiir görüntülenme sayısı artırılırken hata:', error)
    }
  }

  const loadComments = async () => {
    if (!selectedPoem) return
    
    try {
      setLoadingComments(true)
      const commentsData = await apiService.getPoemComments(selectedPoem._id)
      setComments(commentsData)
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPoem || !commentName.trim() || !commentText.trim()) return

    try {
      setSubmittingComment(true)
      await apiService.addComment(selectedPoem._id, commentName.trim(), commentText.trim())
      setCommentName('')
      setCommentText('')
      setShowCommentForm(false)
      // Yorumlar otomatik olarak yüklenmeyecek, admin onayladıktan sonra görünecek
      showToast('Yorumunuz gönderildi. Admin onayından sonra yayınlanacak.', 'success')
    } catch (error) {
      console.error('Yorum gönderilirken hata:', error)
      showToast('Yorum gönderilirken bir hata oluştu.', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handlePoemClick = (poemId: string) => {
    navigate(`/poem/${poemId}`)
    // Mobilde şiir seçildikten sonra sidebar'ı kapat
    setSidebarOpen(false)
  }

  // Arama filtresi
  const filteredPoems = poems.filter(poem =>
    poem.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-screen w-screen bg-white dark:bg-gray-900 flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Şiir Listesi */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white">
            Şenol Söyleyici Şiirler
          </h1>
          {/* Mobile close button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Arama */}
        <div className="p-3 lg:p-4 border-b border-gray-300 dark:border-gray-600 bg-gray-150 dark:bg-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Şiir ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-400 dark:border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Şiir Listesi */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <div className="p-3 lg:p-4">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
              Şiirler {searchTerm && `(${filteredPoems.length} sonuç)`}
            </h2>
            <div className="space-y-2">
              {filteredPoems.map((poem) => (
                <button
                  key={poem._id}
                  onClick={() => handlePoemClick(poem._id)}
                  className={`w-full text-left p-2 lg:p-3 rounded-lg border transition-colors ${
                    selectedPoem?._id === poem._id
                      ? 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-sm mb-1">{poem.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(poem.date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </button>
              ))}
              {filteredPoems.length === 0 && searchTerm && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                  "{searchTerm}" ile ilgili şiir bulunamadı
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 lg:p-4 flex justify-between items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1"></div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 lg:gap-2"
              title={isDarkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
            >
              {isDarkMode ? (
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isDarkMode ? 'Açık' : 'Koyu'}</span>
            </button>
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 lg:gap-2"
            >
              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Kimdir ?</span>
              <span className="sm:hidden">?</span>
            </button>
            
            {isAdmin ? (
              <div className="flex items-center space-x-1 lg:space-x-2">
                <Link to="/admin" className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 lg:gap-2">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                  <span className="sm:hidden">A</span>
                </Link>
                <button onClick={logoutAdmin} className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 lg:gap-2">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Çıkış</span>
                  <span className="sm:hidden">Ç</span>
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 lg:gap-2">
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Giriş</span>
                <span className="sm:hidden">G</span>
              </Link>
            )}
          </div>
        </div>

        {/* Hakkında Modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white">Hakkında</h2>
                  <button
                    onClick={() => setShowAbout(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  <p>
                    Merhaba, ben Şenol Söyleyici. Bu site, yazdığım şiirleri paylaşmak için hazırladığım özel bir köşe.
                  </p>
                  <p>
                    Her şiir, hayatımın farklı dönemlerinden ilham aldı ve benim için özel anlamlar taşıyor. 
                    Umarım sizin için de değerli olur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {id && loadingDirectPoem ? (
          // Şiir Yükleniyor
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-300 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Şiir yükleniyor...</p>
              </div>
            </div>
          </div>
        ) : id && !selectedPoem && !loadingDirectPoem ? (
          // Şiir Bulunamadı
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                </div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Şiir Bulunamadı</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Aradığınız şiir bulunamadı veya silinmiş olabilir.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          </div>
        ) : selectedPoem ? (
          // Şiir Detayı
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4 lg:p-8">
                  <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">{selectedPoem.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <p>
                      {new Date(selectedPoem.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm">{(selectedPoem.views || 0).toLocaleString('tr-TR')} görüntülenme</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 lg:p-8">
                  <div className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed whitespace-pre-line mb-8">
                    {selectedPoem.content}
                  </div>
                  
                  {/* Yorumlar Bölümü */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4">Yorumlar</h3>
                    
                    {/* Yorum Formu */}
                    <div className="mb-6">
                      <button
                        onClick={() => setShowCommentForm(!showCommentForm)}
                        className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        {showCommentForm ? 'Yorum Formunu Kapat' : 'Yorum Yap'}
                      </button>
                      
                      {showCommentForm && (
                        <form onSubmit={handleSubmitComment} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="mb-4">
                            <label htmlFor="commentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Adınız *
                            </label>
                            <input
                              type="text"
                              id="commentName"
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Adınızı girin"
                            />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="commentText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Yorumunuz *
                            </label>
                            <textarea
                              id="commentText"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              required
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Yorumunuzu yazın..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={submittingComment}
                              className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                              {submittingComment ? 'Gönderiliyor...' : 'Yorum Gönder'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCommentForm(false)}
                              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                    
                    {/* Yorumlar Listesi */}
                    {loadingComments ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-300 mx-auto mb-2"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Yorumlar yükleniyor...</p>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{comment.name}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.date).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Ana Sayfa İçeriği
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <section className="text-center mb-8 lg:mb-16 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 lg:mb-8">
                    Hoş Geldiniz
                  </h2>
                  
                  {/* Ziyaret Sayacı */}
                  <div className="mb-6 lg:mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full px-4 py-2 text-blue-700 dark:text-blue-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm font-medium">
                        Toplam Ziyaret: {visitCount.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 lg:p-8">
                    <div className="text-gray-700 dark:text-gray-300 space-y-4 text-base lg:text-lg leading-relaxed">
                      <p>
                        Bu site, yazdığım şiirleri paylaşmak için hazırladığım özel bir köşe. 
                        Her şiir, kalbimden geldi ve hayatımın farklı dönemlerinden ilham aldı.
                      </p>
                      <p>
                        <span className="lg:hidden">Üst menüye tıklayıp</span>
                        <span className="hidden lg:inline">Sol taraftaki listeden</span> istediğiniz şiiri seçerek okumaya başlayabilirsiniz. 
                        Her şiir, benim için özel anlamlar taşıyor ve umarım sizin için de değerli olur.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <section className="text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 lg:p-8">
                  <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">Şiirleri Keşfetmeye Başlayın</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    <span className="lg:hidden">Üst menüye tıklayarak şiir listesini açabilirsiniz.</span>
                    <span className="hidden lg:inline">Sol taraftaki listeden bir şiir seçerek okumaya başlayabilirsiniz.</span>
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
      
      {/* Copyright Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 z-30">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-600 dark:text-gray-400">
          © 2025 Şenol Söyleyici. Tüm hakları saklıdır. | Şiirler ve yorumlar telif hakkı korumalıdır. | Made with ❤️ in Türkiye
        </div>
      </footer>
    </div>
  )
}

export default HomePage 