import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Poem, Comment } from '../types'
import { apiService } from '../services/api'
import ConfirmModal from './ConfirmModal'

interface AdminPanelProps {
  poems: Poem[]
  addPoem: (poem: Omit<Poem, '_id' | 'date'> & { date?: string }) => Promise<boolean>
  deletePoem: (id: string) => Promise<boolean>
  updatePoem: (id: string, title: string, content: string, date?: string) => Promise<boolean>
  isAdmin: boolean
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
}

const AdminPanel = ({ poems, addPoem, deletePoem, updatePoem, isAdmin, showToast }: AdminPanelProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [poemDate, setPoemDate] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null)
  const [activeTab, setActiveTab] = useState<'poems' | 'comments'>('poems')
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  })
  const navigate = useNavigate()

  if (!isAdmin) {
    navigate('/admin/login')
    return null
  }

  useEffect(() => {
    if (activeTab === 'comments') {
      loadComments()
    }
  }, [activeTab])

  const loadComments = async () => {
    try {
      setLoadingComments(true)
      const commentsData = await apiService.getAllComments()
      setComments(commentsData)
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleApproveComment = async (commentId: string, approved: boolean) => {
    try {
      await apiService.approveComment(commentId, approved)
      showToast(`Yorum başarıyla ${approved ? 'onaylandı' : 'reddedildi'}!`, 'success')
      loadComments() // Yorumları yeniden yükle
    } catch (error) {
      console.error('Yorum onaylama hatası:', error)
      showToast('Yorum işlemi sırasında bir hata oluştu.', 'error')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Yorumu Sil',
      message: 'Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      onConfirm: async () => {
        try {
          await apiService.deleteComment(commentId)
          showToast('Yorum başarıyla silindi!', 'success')
          loadComments() // Yorumları yeniden yükle
        } catch (error) {
          console.error('Yorum silme hatası:', error)
          showToast('Yorum silinirken bir hata oluştu.', 'error')
        }
      },
      type: 'danger'
    })
  }

  const handleResetVisits = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sayaçları Sıfırla',
      message: 'Ziyaret sayacını VE tüm şiir görüntülenme sayılarını sıfırlamak istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!',
      onConfirm: async () => {
        try {
          const result = await apiService.resetVisits()
          showToast(result.message || 'Tüm sayaçlar sıfırlandı!', 'success')
          // Şiir listesini yeniden yükle
          window.location.reload()
        } catch (error) {
          console.error('Sayaç sıfırlama hatası:', error)
          showToast('Sayaçlar sıfırlanırken bir hata oluştu.', 'error')
        }
      },
      type: 'warning'
    })
  }

  const handleAddPoem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      const success = await addPoem({
        title: title.trim(),
        content: content.trim(),
        views: 0,
        date: poemDate || undefined
      })
      if (success) {
        showToast('Şiir başarıyla eklendi!', 'success')
        setTitle('')
        setContent('')
        setPoemDate('')
        setShowAddForm(false)
      } else {
        showToast('Şiir eklenirken bir hata oluştu.', 'error')
      }
    }
  }

  const handleDeletePoem = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Şiiri Sil',
      message: 'Bu şiiri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      onConfirm: async () => {
        const success = await deletePoem(id)
        if (success) {
          showToast('Şiir başarıyla silindi!', 'success')
        } else {
          showToast('Şiir silinirken bir hata oluştu.', 'error')
        }
      },
      type: 'danger'
    })
  }

  const handleEditPoem = (poem: Poem) => {
    setEditingPoem(poem)
    setTitle(poem.title)
    setContent(poem.content)
    setPoemDate(new Date(poem.date).toISOString().split('T')[0])
    setShowAddForm(false)
  }

  const handleUpdatePoem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPoem || !title.trim() || !content.trim()) return

    const success = await updatePoem(
      editingPoem._id,
      title.trim(),
      content.trim(),
      poemDate || undefined
    )
    
    if (success) {
      showToast('Şiir başarıyla güncellendi!', 'success')
      setTitle('')
      setContent('')
      setPoemDate('')
      setEditingPoem(null)
    } else {
      showToast('Şiir güncellenirken bir hata oluştu.', 'error')
    }
  }

  const handleCancelEdit = () => {
    setEditingPoem(null)
    setTitle('')
    setContent('')
    setPoemDate('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 animate-fade-in">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-2">Admin Paneli</h1>
            <p className="text-gray-600">Şiir yönetimi ve düzenleme</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => {
                if (editingPoem) {
                  handleCancelEdit()
                } else {
                  setShowAddForm(!showAddForm)
                }
              }}
              className={showAddForm || editingPoem ? "button-secondary" : "button-primary"}
            >
              {showAddForm || editingPoem ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="ml-2">İptal</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="ml-2">Yeni Şiir Ekle</span>
                </>
              )}
            </button>
            <button
              onClick={handleResetVisits}
              className="button-secondary bg-red-600 hover:bg-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="ml-2">Tüm Sayaçları Sıfırla</span>
            </button>
            <Link to="/" className="button-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="ml-2">Ana Sayfa</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 lg:mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('poems')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'poems'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Şiirler ({poems.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yorumlar ({comments.length})
            </button>
          </div>
        </div>

        {/* Add/Edit Poem Form */}
        {activeTab === 'poems' && (showAddForm || editingPoem) && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 animate-slide-up">
            <h2 className="text-lg lg:text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
              {editingPoem ? (
                <>
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Şiir Düzenle
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Şiir Ekle
                </>
              )}
            </h2>
            <form onSubmit={editingPoem ? handleUpdatePoem : handleAddPoem} className="space-y-4">
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
                <label htmlFor="poemDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Şiir Tarihi (İsteğe bağlı)
                </label>
                <input
                  type="date"
                  id="poemDate"
                  value={poemDate}
                  onChange={(e) => setPoemDate(e.target.value)}
                  className="input-field"
                  placeholder="Şiir yazıldığı tarihi seçin"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Boş bırakırsanız şu anki tarih kullanılır
                </p>
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
                  rows={8}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="button-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2">{editingPoem ? 'Şiiri Güncelle' : 'Şiir Ekle'}</span>
                </button>
                {editingPoem && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="button-secondary"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="ml-2">İptal</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Poems List */}
        {activeTab === 'poems' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:p-6 animate-slide-up">
          <h2 className="text-lg lg:text-xl font-display font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mevcut Şiirler ({poems.length})
          </h2>
          <div className="space-y-3 lg:space-y-4">
            {poems.map((poem, index) => (
              <div
                key={poem._id}
                className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:bg-gray-50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <h3 className="text-base lg:text-lg font-display font-semibold text-gray-900 mb-2">{poem.title}</h3>
                      <div className="flex items-center gap-4 text-gray-500 text-xs lg:text-sm mb-2">
                        <p>
                          {new Date(poem.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{(poem.views || 0).toLocaleString('tr-TR')} görüntülenme</span>
                        </div>
                      </div>
                      <div className="text-gray-700 text-xs lg:text-sm line-clamp-2 bg-gray-50 rounded p-2">
                        {poem.content.split('\n')[0]}...
                      </div>
                    </div>
                    <div className="flex gap-2 self-start sm:ml-4">
                      <button
                        onClick={() => handleEditPoem(poem)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                        title="Şiiri düzenle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePoem(poem._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                        title="Şiiri sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Comments List */}
        {activeTab === 'comments' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:p-6 animate-slide-up">
            <h2 className="text-lg lg:text-xl font-display font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Yorum Yönetimi ({comments.length})
            </h2>
            
            {loadingComments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Yorumlar yükleniyor...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div
                    key={comment._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{comment.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            comment.approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comment.approved ? 'Onaylı' : 'Beklemede'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          Şiir: {typeof comment.poemId === 'object' && comment.poemId ? comment.poemId.title : (comment.poemId as string)}
                        </p>
                        <p className="text-gray-700 text-sm mb-2">
                          {new Date(comment.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-gray-700 bg-gray-50 rounded p-3">
                          {comment.comment}
                        </p>
                      </div>
                      <div className="flex gap-2 lg:flex-col">
                        {!comment.approved && (
                          <button
                            onClick={() => handleApproveComment(comment._id, true)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
                            title="Yorumu onayla"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {comment.approved && (
                          <button
                            onClick={() => handleApproveComment(comment._id, false)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
                            title="Yorumu reddet"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                          title="Yorumu sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz yorum bulunmuyor.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Onayla"
        cancelText="İptal"
      />
    </div>
  )
}

export default AdminPanel 