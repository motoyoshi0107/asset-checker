// =============================================
// ローカルストレージユーティリティ
// =============================================

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  memo?: string
}


// ローカルストレージのキー
const STORAGE_KEYS = {
  ASSETS: 'asset_checker_assets'
} as const

// ローカルストレージへの保存
export const saveAssets = (assets: Asset[]): void => {
  try {
    console.log('Saving assets to localStorage:', assets)
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets))
    console.log('Assets saved successfully')
  } catch (error) {
    console.error('Error saving assets:', error)
  }
}


// ローカルストレージからの読み込み
export const loadAssets = (): Asset[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSETS)
    console.log('Loading assets from localStorage:', stored)
    
    if (!stored || stored === 'undefined' || stored === 'null') {
      console.log('No assets found in localStorage')
      return []
    }
    
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      console.log('Loaded assets:', parsed)
      return parsed
    } else {
      console.warn('Invalid assets data format, returning empty array')
      return []
    }
  } catch (error) {
    console.error('Error loading assets:', error)
    return []
  }
}


// ローカルストレージの存在確認
export const hasStoredData = (): boolean => {
  try {
    const assetsExist = localStorage.getItem(STORAGE_KEYS.ASSETS) !== null
    return assetsExist
  } catch (error) {
    console.error('Error checking stored data:', error)
    return false
  }
}

// ローカルストレージのクリア
export const clearStoredData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ASSETS)
    console.log('Cleared all stored data')
  } catch (error) {
    console.error('Error clearing stored data:', error)
  }
}

// デバッグ用: ローカルストレージの内容を表示
export const debugStoredData = (): void => {
  try {
    const assets = localStorage.getItem(STORAGE_KEYS.ASSETS)
    
    console.log('=== Debug Stored Data ===')
    console.log('Assets:', assets)
    console.log('Assets parsed:', assets ? JSON.parse(assets) : null)
    console.log('========================')
  } catch (error) {
    console.error('Error debugging stored data:', error)
  }
}