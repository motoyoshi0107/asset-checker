// =============================================
// パスワード形式データ変換（昔のゲーム風）
// =============================================

// パスワード用文字セット（50音・カタカナ）
const PASSWORD_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

// データ圧縮用の簡易マッピング
const CATEGORY_MAP: Record<string, string> = {
  'cash': 'ア',
  'securities': 'イ', 
  'nisa': 'ウ',
  'ideco': 'エ',
  'pension': 'オ',
  'crypto': 'カ',
  'other': 'キ'
}

const REVERSE_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
)

const EXPENSE_CATEGORY_MAP: Record<string, string> = {
  'food': 'ク',
  'dining': 'ケ',
  'transport': 'コ',
  'utilities': 'サ',
  'entertainment': 'シ',
  'shopping': 'ス',
  'healthcare': 'セ',
  'other': 'ソ'
}

const REVERSE_EXPENSE_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EXPENSE_CATEGORY_MAP).map(([k, v]) => [v, k])
)

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  memo?: string
}

interface Expense {
  id: string
  date: string
  category: string
  amount: number
  memo?: string
}

// Base32エンコード（独自実装）
function encodeBase32(data: string): string {
  const chars = PASSWORD_CHARS
  let result = ''
  let bits = 0
  let value = 0
  
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data.charCodeAt(i)
    bits += 8
    
    while (bits >= 5) {
      result += chars[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  
  if (bits > 0) {
    result += chars[(value << (5 - bits)) & 31]
  }
  
  return result
}

// Base32デコード
function decodeBase32(encoded: string): string {
  const chars = PASSWORD_CHARS
  let result = ''
  let bits = 0
  let value = 0
  
  for (let i = 0; i < encoded.length; i++) {
    const index = chars.indexOf(encoded[i])
    if (index === -1) continue
    
    value = (value << 5) | index
    bits += 5
    
    if (bits >= 8) {
      result += String.fromCharCode((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  
  return result
}

// データを圧縮してパスワード化
export function generatePassword(assets: Asset[], expenses: Expense[]): string {
  try {
    console.log('generatePassword called with:', { assets, expenses })
    
    // データが空の場合でもサンプルデータを使用してパスワードを生成
    if (assets.length === 0 && expenses.length === 0) {
      console.log('No data provided, generating sample password')
      // サンプルデータを使用
      const sampleData = {
        assets: [{ cat: 'ウ', amt: 500, date: '240716' }],
        expenses: [{ cat: 'ク', amt: 30, date: '240716' }],
        checksum: 2
      }
      
      const jsonString = JSON.stringify(sampleData)
      console.log('Sample JSON string:', jsonString)
      const compressed = encodeBase32(jsonString)
      console.log('Sample compressed:', compressed)
      
      const result = compressed.match(/.{1,4}/g)?.join('-') || compressed
      console.log('Sample final password:', result)
      return result
    }

    // データの要約を作成（最新の主要データのみ）
    const summary = {
      // 最新の資産データ（上位5件）
      assets: assets.slice(-5).map(asset => ({
        cat: CATEGORY_MAP[asset.category] || 'キ',
        amt: Math.floor(asset.amount / 1000), // 1000円単位で圧縮
        date: asset.date.replace(/-/g, '').slice(2) // YYMMDD形式
      })),
      // 最新の支出データ（上位5件）
      expenses: expenses.slice(-5).map(expense => ({
        cat: EXPENSE_CATEGORY_MAP[expense.category] || 'ソ',
        amt: Math.floor(expense.amount / 100), // 100円単位で圧縮
        date: expense.date.replace(/-/g, '').slice(2)
      })),
      // チェックサム
      checksum: (assets.length + expenses.length) % 32
    }
    
    console.log('Summary for password generation:', summary)
    const jsonString = JSON.stringify(summary)
    console.log('JSON string:', jsonString)
    const compressed = encodeBase32(jsonString)
    console.log('Compressed:', compressed)
    
    // 4文字ずつ区切って見やすくする
    const result = compressed.match(/.{1,4}/g)?.join('-') || compressed
    console.log('Final password:', result)
    return result
    
  } catch (error) {
    console.error('Password generation error:', error)
    return ''
  }
}

// パスワードからデータを復元
export function decodePassword(password: string): { assets: Asset[], expenses: Expense[] } | null {
  try {
    // ハイフンを除去
    const cleanPassword = password.replace(/-/g, '').toUpperCase()
    
    const jsonString = decodeBase32(cleanPassword)
    const summary = JSON.parse(jsonString)
    
    // データを復元
    const assets: Asset[] = summary.assets.map((item: any, index: number) => ({
      id: `restored-asset-${index}`,
      date: `20${item.date.slice(0, 2)}-${item.date.slice(2, 4)}-${item.date.slice(4, 6)}`,
      category: REVERSE_CATEGORY_MAP[item.cat] || 'other',
      subcategory: 'restored',
      amount: item.amt * 1000,
      memo: 'パスワードから復元'
    }))
    
    const expenses: Expense[] = summary.expenses.map((item: any, index: number) => ({
      id: `restored-expense-${index}`,
      date: `20${item.date.slice(0, 2)}-${item.date.slice(2, 4)}-${item.date.slice(4, 6)}`,
      category: REVERSE_EXPENSE_CATEGORY_MAP[item.cat] || 'other',
      amount: item.amt * 100,
      memo: 'パスワードから復元'
    }))
    
    return { assets, expenses }
    
  } catch (error) {
    console.error('Password decode error:', error)
    return null
  }
}

// パスワードの妥当性チェック
export function validatePassword(password: string): boolean {
  try {
    const cleanPassword = password.replace(/-/g, '').toUpperCase()
    
    // 文字チェック
    for (const char of cleanPassword) {
      if (!PASSWORD_CHARS.includes(char)) {
        return false
      }
    }
    
    // デコードテスト
    const decoded = decodePassword(password)
    return decoded !== null
    
  } catch (error) {
    return false
  }
}

// パスワード例の生成
export function generateSamplePassword(): string {
  const sampleAssets: Asset[] = [
    {
      id: '1',
      date: '2024-01-15',
      category: 'nisa',
      subcategory: 'nisa_tsumitate',
      amount: 500000,
      memo: 'サンプル'
    }
  ]
  
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      date: '2024-01-15',
      category: 'food',
      amount: 3000,
      memo: 'サンプル'
    }
  ]
  
  return generatePassword(sampleAssets, sampleExpenses)
}