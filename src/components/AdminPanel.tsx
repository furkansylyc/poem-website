import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Poem } from '../types'

interface AdminPanelProps {
  poems: Poem[]
  addPoem: (poem: Omit<Poem, '_id' | 'date'>) => Promise<boolean>
  deletePoem: (id: string) => Promise<boolean>
  isAdmin: boolean
}

const AdminPanel = ({ poems, addPoem, deletePoem, isAdmin }: AdminPanelProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const navigate = useNavigate()

  if (!isAdmin) {
    navigate('/admin/login')
    return null
  }

  const handleAddPoem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      const success = await addPoem({
        title: title.trim(),
        content: content.trim()
      })
      if (success) {
        setTitle('')
        setContent('')
        setShowAddForm(false)
      }
    }
  }

  const handleDeletePoem = async (id: string) => {
    if (window.confirm('Bu şiiri silmek istediğinizden emin misiniz?')) {
      await deletePoem(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Admin Paneli</h1>
            <p className="text-gray-600">Şiir yönetimi ve düzenleme</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={showAddForm ? "button-secondary" : "button-primary"}
            >
              {showAddForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  İptal
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Şiir Ekle
                </>
              )}
            </button>
            <Link to="/" className="button-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ana Sayfa
            </Link>
          </div>
        </div>

        {/* Add Poem Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8 animate-slide-up">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Şiir Ekle
            </h2>
            <form onSubmit={handleAddPoem} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Şiir Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Şiir başlığını girin"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Şiir İçeriği
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="textarea-field"
                  placeholder="Şiir içeriğini girin"
                  required
                />
              </div>
              <button type="submit" className="button-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Şiir Ekle
              </button>
            </form>
          </div>
        )}

        {/* Poems List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-slide-up">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mevcut Şiirler ({poems.length})
          </h2>
          <div className="space-y-4">
            {poems.map((poem, index) => (
              <div
                key={poem._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">{poem.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {new Date(poem.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="text-gray-700 text-sm line-clamp-2 bg-gray-50 rounded p-2">
                      {poem.content.split('\n')[0]}...
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePoem(poem._id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors ml-4"
                    title="Şiiri sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel 