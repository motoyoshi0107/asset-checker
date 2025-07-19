'use client'

// =============================================
// データ管理コンポーネント（エクスポート/インポート）
// =============================================

import { useState } from 'react'
import { Download, Upload, FileText, AlertCircle, CheckCircle, Key, Copy, Eye, EyeOff } from 'lucide-react'
import { generatePassword, decodePassword, validatePassword, generateSamplePassword } from '@/lib/utils/password-codec'

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  memo?: string
}


interface DataManagementProps {
  assets: Asset[]
  onImportData: (assets: Asset[]) => void
}

export function DataManagement({ assets, onImportData }: DataManagementProps) {
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null)
  const [importMessage, setImportMessage] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [inputPassword, setInputPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'file' | 'password'>('file')
  const [isDragging, setIsDragging] = useState(false)

  // データをエクスポート
  const exportData = () => {
    const data = {
      assets: assets,
      exportDate: new Date().toISOString(),
      version: '1.0',
      appName: '資産管理ダッシュボード'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], 
      { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `資産データ_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  // ファイル処理の共通関数
  const processFile = (file: File) => {
    if (!file) return
    
    // JSONファイルかチェック
    if (!file.name.endsWith('.json')) {
      setImportStatus('error')
      setImportMessage('JSONファイルを選択してください。')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // データ形式の検証
        if (!data.assets) {
          throw new Error('データ形式が正しくありません')
        }

        // 配列かどうかチェック
        if (!Array.isArray(data.assets)) {
          throw new Error('データ形式が正しくありません')
        }

        // データの妥当性チェック
        const validAssets = data.assets.filter((asset: any) => 
          asset.id && asset.date && asset.category && typeof asset.amount === 'number'
        )

        onImportData(validAssets)
        
        setImportStatus('success')
        setImportMessage(`データの読み込みが完了しました（資産: ${validAssets.length}件）`)
        
        // 3秒後にメッセージを消去
        setTimeout(() => {
          setImportStatus(null)
          setImportMessage('')
        }, 3000)
        
      } catch (error) {
        setImportStatus('error')
        setImportMessage('ファイルの形式が正しくありません。正しいJSONファイルを選択してください。')
        
        setTimeout(() => {
          setImportStatus(null)
          setImportMessage('')
        }, 5000)
      }
    }
    reader.readAsText(file)
  }

  // データをインポート（ファイル選択）
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
    
    // ファイル選択をリセット
    event.target.value = ''
  }

  // ドラッグ&ドロップイベントハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  // パスワードを生成
  const generateNewPassword = () => {
    const password = generatePassword(assets, [])
    setGeneratedPassword(password)
  }

  // パスワードをクリップボードにコピー
  const copyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword)
      setImportStatus('success')
      setImportMessage('パスワードをクリップボードにコピーしました')
      setTimeout(() => {
        setImportStatus(null)
        setImportMessage('')
      }, 2000)
    }
  }

  // パスワードからデータを復元
  const importFromPassword = () => {
    if (!inputPassword.trim()) {
      setImportStatus('error')
      setImportMessage('パスワードを入力してください')
      return
    }

    if (!validatePassword(inputPassword)) {
      setImportStatus('error')
      setImportMessage('パスワードの形式が正しくありません')
      return
    }

    const decoded = decodePassword(inputPassword)
    if (!decoded) {
      setImportStatus('error')
      setImportMessage('パスワードが正しくありません')
      return
    }

    onImportData(decoded.assets)
    setImportStatus('success')
    setImportMessage(`パスワードからデータを復元しました（資産: ${decoded.assets.length}件）`)
    setInputPassword('')
    
    setTimeout(() => {
      setImportStatus(null)
      setImportMessage('')
    }, 3000)
  }

  // サンプルパスワードを生成
  const generateSample = () => {
    const sample = generateSamplePassword()
    setInputPassword(sample)
  }

  const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0)

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">データ管理</h3>
      </div>
      
      {/* 現在のデータ状況 */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">現在のデータ</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• 資産データ: {assets.length}件（総額: ¥{totalAssets.toLocaleString()}）</p>
          <p>• 最終更新: {new Date().toLocaleString('ja-JP')}</p>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'file' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          ファイル形式
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'password' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="h-4 w-4 inline mr-2" />
          パスワード形式
        </button>
      </div>

      {/* ファイル形式タブ */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          <div>
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>データをエクスポート (.json)</span>
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              全てのデータをJSONファイルとしてダウンロードします
            </p>
          </div>

          <div>
            <label 
              className={`w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-4 w-4" />
              <span>
                {isDragging ? 'ファイルをドロップ' : 'データをインポート（ドラッグ&ドロップ対応）'}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              以前にエクスポートしたJSONファイルを選択するか、ドラッグ&ドロップしてください
            </p>
          </div>
        </div>
      )}

      {/* パスワード形式タブ */}
      {activeTab === 'password' && (
        <div className="space-y-4">
          {/* パスワード生成 */}
          <div>
            <button 
              onClick={generateNewPassword}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Key className="h-4 w-4" />
              <span>パスワードを生成</span>
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              現在のデータを昔のゲーム風パスワードに変換します{assets.length === 0 ? '（サンプルデータを使用）' : ''}
            </p>
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ パスワード形式は簡易データのみ保存されます。完全なデータ復元にはファイル形式をご利用ください。
            </div>
          </div>

          {/* 生成されたパスワード */}
          {generatedPassword && (
            <div className="space-y-2">
              <label className="text-sm font-medium">生成されたパスワード</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-100 rounded-md font-mono text-sm break-all text-gray-600">
                  {showPassword ? generatedPassword : '◯◯◯◯-◯◯◯◯-◯◯◯◯-◯◯◯◯'}
                </div>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 border rounded-md hover:bg-gray-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={copyPassword}
                  className="p-2 border rounded-md hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                このパスワードを保存して、他の端末で入力してください
              </p>
            </div>
          )}

          {/* パスワード入力 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">パスワードを入力</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="アイウエ-オカキク-ケコサシ-スセソタ"
                className="flex-1 p-3 border rounded-md font-mono text-sm"
              />
              <button
                onClick={importFromPassword}
                className="px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                復元
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={generateSample}
                className="text-xs text-blue-600 hover:underline"
              >
                サンプルパスワードで試す
              </button>
            </div>
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              ⚠️ パスワード復元は簡易データのみです。現在のデータは上書きされ、詳細なカテゴリ分けや月別履歴は失われます。
            </div>
          </div>

        </div>
      )}

      {/* 結果メッセージ */}
      {importStatus && (
        <div className={`flex items-center space-x-2 p-3 rounded-md ${
          importStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {importStatus === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{importMessage}</span>
        </div>
      )}


      {/* 注意事項 */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">⚠️ 注意事項</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• インポートすると現在のデータは上書きされます</p>
          <p>• 大切なデータは事前にエクスポートしてバックアップを作成してください</p>
          <p>• ファイルを紛失するとデータは復元できません</p>
        </div>
      </div>
    </div>
  )
}