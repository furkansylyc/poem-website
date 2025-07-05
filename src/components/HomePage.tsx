import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Poem } from '../types'

interface HomePageProps {
  poems: Poem[]
  isAdmin: boolean
  logoutAdmin: () => void
}

const HomePage = ({ poems, isAdmin, logoutAdmin }: HomePageProps) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const selectedPoem = poems.find(p => p._id === id)

  const handlePoemClick = (poemId: string) => {
    navigate(`/poem/${poemId}`)
  }

  // Arama filtresi
  const filteredPoems = poems.filter(poem =>
    poem.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-screen w-screen bg-white flex overflow-hidden">
      {/* Sidebar - Şiir Listesi */}
      <div className="w-80 bg-gray-100 border-r border-gray-300 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-300 bg-gray-200">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">
            Şenol Söyleyici Şiirler
          </h1>
        </div>

        {/* Arama */}
        <div className="p-4 border-b border-gray-300 bg-gray-150">
          <div className="relative">
            <input
              type="text"
              placeholder="Şiir ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Şiir Listesi */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Şiirler {searchTerm && `(${filteredPoems.length} sonuç)`}
            </h2>
            <div className="space-y-2">
              {filteredPoems.map((poem) => (
                <button
                  key={poem._id}
                  onClick={() => handlePoemClick(poem._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPoem?._id === poem._id
                      ? 'bg-gray-300 border-gray-400 text-gray-900'
                      : 'bg-white border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <h3 className="font-medium text-sm mb-1">{poem.title}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(poem.date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </button>
              ))}
              {filteredPoems.length === 0 && searchTerm && (
                <div className="text-center text-gray-500 text-sm py-4">
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
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kimdir ?
            </button>
            
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <Link to="/admin" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </Link>
                <button onClick={logoutAdmin} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Giriş
              </Link>
            )}
          </div>
        </div>

        {/* Hakkında Modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-display font-bold text-gray-900">Hakkında</h2>
                  <button
                    onClick={() => setShowAbout(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-700 space-y-4">
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

        {selectedPoem ? (
          // Şiir Detayı
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 p-8">
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{selectedPoem.title}</h1>
                  <p className="text-gray-600">
                    {new Date(selectedPoem.date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="p-8">
                  <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-8">
                    {selectedPoem.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Ana Sayfa İçeriği
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <section className="text-center mb-16 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-4xl font-display font-bold text-gray-900 mb-8">
                    Hoş Geldiniz
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-8">
                    <div className="text-gray-700 space-y-4 text-lg leading-relaxed">
                      <p>
                        Bu site, yazdığım şiirleri paylaşmak için hazırladığım özel bir köşe. 
                        Her şiir, kalbimden geldi ve hayatımın farklı dönemlerinden ilham aldı.
                      </p>
                      <p>
                        Sol taraftaki listeden istediğiniz şiiri seçerek okumaya başlayabilirsiniz. 
                        Her şiir, benim için özel anlamlar taşıyor ve umarım sizin için de değerli olur.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <section className="text-center">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Şiirleri Keşfetmeye Başlayın</h3>
                  <p className="text-gray-600 mb-6">
                    Sol taraftaki listeden bir şiir seçerek okumaya başlayabilirsiniz.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage 