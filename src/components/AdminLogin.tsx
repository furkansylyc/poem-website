import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface AdminLoginProps {
  loginAdmin: (username: string, password: string) => Promise<boolean>
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
}

const AdminLogin = ({ loginAdmin, showToast }: AdminLoginProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await loginAdmin(username, password)
    if (success) {
      showToast('Başarıyla giriş yapıldı!', 'success')
      navigate('/admin')
    } else {
      showToast('Giriş başarısız. Kullanıcı adı veya şifre hatalı.', 'error')
      setError('Kullanıcı adı veya şifre yanlış!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 lg:p-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl lg:text-2xl font-display font-bold text-gray-900 mb-2">Admin Girişi</h1>
            <p className="text-gray-600 text-sm lg:text-base">Şiir yönetimi için giriş yapın</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Kullanıcı adınızı girin"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Şifrenizi girin"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}
            
            <button type="submit" className="button-primary w-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="ml-2">Giriş Yap</span>
            </button>
          </form>
          
          <div className="mt-4 lg:mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
              <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin 