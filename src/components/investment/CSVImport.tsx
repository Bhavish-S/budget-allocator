import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Upload, X, Check, AlertTriangle, Download } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

interface CSVRow {
  name: string
  cost: number
  expected_return: number
  category?: string
  risk_level?: number
  _valid: boolean
  _error?: string
}

interface CSVImportProps {
  onImport: (rows: Array<{
    name: string
    cost: number
    expected_return: number
    category_id?: string | null
    risk_level: number
  }>) => void
  onClose: () => void
  isLoading: boolean
}

export default function CSVImport({ onImport, onClose, isLoading }: CSVImportProps) {
  const [rows, setRows] = useState<CSVRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: categories = [] } = useCategories()

  const handleFile = (file: File) => {
    setError(null)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const parsed: CSVRow[] = (data as Record<string, string>[]).map((row) => {
          const cost = parseFloat(row.cost)
          const expectedReturn = parseFloat(row.expected_return)
          const riskLevel = parseInt(row.risk_level || '3')
          const valid =
            !!row.name &&
            !isNaN(cost) && cost > 0 &&
            !isNaN(expectedReturn) && expectedReturn >= 0 &&
            riskLevel >= 1 && riskLevel <= 5

          return {
            name: row.name || '',
            cost: isNaN(cost) ? 0 : cost,
            expected_return: isNaN(expectedReturn) ? 0 : expectedReturn,
            category: row.category,
            risk_level: isNaN(riskLevel) ? 3 : riskLevel,
            _valid: valid,
            _error: !valid ? 'Invalid data' : undefined,
          }
        })
        setRows(parsed)
      },
      error: () => setError('Failed to parse CSV file.'),
    })
  }

  const downloadTemplate = () => {
    const csv = 'name,cost,expected_return,category,risk_level\nReliance Industries,100000,120000,Stocks,3\nAxis Bank FD,50000,54000,Fixed Deposit,1\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'investment_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const validRows = rows.filter((r) => r._valid)
    onImport(validRows.map((r) => ({
      name: r.name,
      cost: r.cost,
      expected_return: r.expected_return,
      category_id: categories.find((c: any) => c.name.toLowerCase() === r.category?.toLowerCase())?.id || null,
      risk_level: r.risk_level || 3,
    })))
  }

  const validCount = rows.filter((r) => r._valid).length
  const invalidCount = rows.filter((r) => !r._valid).length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-text-dark">Import Investments from CSV</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
            <X size={18} className="text-gray-mid" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {rows.length === 0 ? (
            <>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
              >
                <Upload size={28} className="text-gray-mid mx-auto mb-2" />
                <p className="text-text-dark font-medium">Drop CSV file here or click to browse</p>
                <p className="text-gray-mid text-sm mt-1">Accepts .csv files only</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
              />
              <button
                id="download-csv-template"
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-blue-mid text-sm hover:underline"
              >
                <Download size={14} /> Download CSV template
              </button>
              {error && <p className="text-danger text-sm">{error}</p>}
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-success">
                  <Check size={14} /> {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-danger">
                    <AlertTriangle size={14} /> {invalidCount} invalid
                  </span>
                )}
                <button onClick={() => setRows([])} className="ml-auto text-gray-mid hover:text-text-dark">
                  Upload different file
                </button>
              </div>

              <div className="table-container max-h-64 overflow-y-auto">
                <table className="table-base">
                  <thead className="table-header sticky top-0">
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Cost</th>
                      <th>Expected Return</th>
                      <th>Category</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={`table-row ${!row._valid ? 'bg-danger/5' : ''}`}>
                        <td>{row._valid ? <Check size={14} className="text-success" /> : <AlertTriangle size={14} className="text-danger" />}</td>
                        <td>{row.name}</td>
                        <td className="font-mono">{row.cost.toLocaleString()}</td>
                        <td className="font-mono">{row.expected_return.toLocaleString()}</td>
                        <td>{row.category || '-'}</td>
                        <td>{row.risk_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {rows.length > 0 && validCount > 0 && (
          <div className="p-5 border-t border-gray-200">
            <button
              id="csv-import-confirm"
              onClick={handleImport}
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? 'Importing...' : `Import ${validCount} Investment${validCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
