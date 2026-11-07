/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

const BrandContext = createContext(null)

export function BrandProvider({ brand, children }) {
  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const brand = useContext(BrandContext)

  if (!brand) {
    throw new Error('useBrand must be used within BrandProvider')
  }

  return brand
}
