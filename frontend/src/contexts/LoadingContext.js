// src/contexts/LoadingContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// 1️⃣ Create the context
const LoadingContext = createContext({
  /** number of in-flight requests */
  loadingCount: 0,
  /** increment count */
  startLoading: () => {},
  /** decrement count */
  stopLoading: () => {},
})

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0)

  const startLoading = () => setLoadingCount(c => c + 1)
  const stopLoading  = () => setLoadingCount(c => Math.max(c - 1, 0))

  // 2️⃣ Wire up Axios interceptors
  useEffect(() => {
    const reqI  = axios.interceptors.request.use(cfg => {
      startLoading()
      return cfg
    }, err => {
      stopLoading()
      return Promise.reject(err)
    })
    const resI1 = axios.interceptors.response.use(res => {
      stopLoading()
      return res
    }, err => {
      stopLoading()
      return Promise.reject(err)
    })

    return () => {
      axios.interceptors.request.eject(reqI)
      axios.interceptors.response.eject(resI1)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ loadingCount, startLoading, stopLoading }}>
      {children}

      {/* 3️⃣ The overlay */}
      {loadingCount > 0 && (
        <div
          style={{
            position:        'fixed',
            top:             0,
            left:            0,
            width:           '100vw',
            height:          '100vh',
            backgroundColor: 'rgba(255,255,255,0.7)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            zIndex:          9999,
          }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

// helper hook (optional)
export const useLoading = () => useContext(LoadingContext)
