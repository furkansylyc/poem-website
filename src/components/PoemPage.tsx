import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Poem } from '../types'

interface PoemPageProps {
  poems: Poem[]
}

const PoemPage = ({ poems }: PoemPageProps) => {
  const { id } = useParams()
  const poem = poems.find(p => p._id === id)

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Şiir bulunamadı</h1>
            <Link to="/" className="button-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 animate-fade-in group"
        >
          <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ana Sayfaya Dön
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-slide-up">
          <div className="bg-gray-50 border-b border-gray-200 p-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{poem.title}</h1>
            <p className="text-gray-600">
              {new Date(poem.date).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="p-8">
            <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-8">
              {poem.content}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center text-gray-500 text-sm">
                Sevgiyle yazıldı
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoemPage 