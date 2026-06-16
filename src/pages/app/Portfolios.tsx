import { useState } from 'react'
import { Briefcase, Plus } from 'lucide-react'
import { usePortfolios, useCreatePortfolio, useUpdatePortfolio, useDeletePortfolio } from '@/hooks/usePortfolios'
import PortfolioCard from '@/components/portfolio/PortfolioCard'
import PortfolioForm from '@/components/portfolio/PortfolioForm'
import EmptyState from '@/components/shared/EmptyState'
import type { Portfolio } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function Portfolios() {
  const { data: portfolios = [], isLoading } = usePortfolios()
  const createPortfolio = useCreatePortfolio()
  const updatePortfolio = useUpdatePortfolio()
  const deletePortfolio = useDeletePortfolio()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleShare = async (portfolioId: string) => {
    const token = crypto.randomUUID().replace(/-/g, '')
    const { error } = await supabase
      .from('shared_portfolios')
      .insert({ portfolio_id: portfolioId, user_id: (await supabase.auth.getUser()).data.user!.id, share_token: token })
    if (error) {
      toast.error('Failed to create share link')
    } else {
      const url = `${window.location.origin}/share/${token}`
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard!')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Portfolios</h1>
          <p className="page-subtitle">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No portfolios yet"
          description="Create your first portfolio and start adding investments to optimize."
          action={{ label: 'Create Your First Portfolio', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolios.map((p) => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              onEdit={(p) => { setEditingPortfolio(p); setFormOpen(true) }}
              onDelete={(id) => setDeletingId(id)}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        id="new-portfolio-fab"
        onClick={() => { setEditingPortfolio(null); setFormOpen(true) }}
        className="fixed bottom-20 right-6 lg:bottom-8 w-14 h-14 bg-gold text-navy rounded-full shadow-lg hover:bg-yellow-400 flex items-center justify-center transition-all hover:scale-110 animate-pulse-gold"
        aria-label="Create new portfolio"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <PortfolioForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingPortfolio(null) }}
        onSubmit={(data) => {
          if (editingPortfolio) {
            updatePortfolio.mutate({ id: editingPortfolio.id, ...data })
          } else {
            createPortfolio.mutate(data)
          }
          setFormOpen(false)
          setEditingPortfolio(null)
        }}
        isLoading={createPortfolio.isPending || updatePortfolio.isPending}
        initialData={editingPortfolio}
      />

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-text-dark font-semibold text-lg mb-2">Delete Portfolio?</h3>
            <p className="text-gray-mid text-sm mb-6">
              This will permanently delete the portfolio and all its investments. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 btn-ghost border border-gray-200 text-text-dark"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-portfolio"
                onClick={() => {
                  deletePortfolio.mutate(deletingId)
                  setDeletingId(null)
                }}
                className="flex-1 btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
