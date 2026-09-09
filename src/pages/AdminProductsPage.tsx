import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useMenu } from '../menu/MenuContext'
import {
  createProduct,
  deleteProduct,
  fetchAllProducts,
  formatProductPrice,
  updateProduct,
} from '../lib/products'
import type { ProductRow } from '../lib/database.types'

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'Sandwiches & Burgers',
  is_visible: true,
}

function parsePriceInput(value: string): number | null {
  const t = value.trim()
  if (!t) return null
  const n = Number(t.replace(/,/g, ''))
  if (!Number.isFinite(n)) throw new Error('Price must be a number')
  return n
}

export function AdminProductsPage() {
  const auth = useAuth()
  const menu = useMenu()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await fetchAllProducts())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const startEdit = (p: ProductRow) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      price: p.price === null ? '' : String(p.price),
      category: p.category,
      is_visible: p.is_visible,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const price = parsePriceInput(form.price)
      if (editingId) {
        await updateProduct(editingId, {
          name: form.name,
          price,
          category: form.category,
          is_visible: form.is_visible,
        })
      } else {
        await createProduct({
          name: form.name,
          price,
          category: form.category,
          is_visible: form.is_visible,
        })
      }
      resetForm()
      await load()
      await menu.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”?`)) return
    setBusy(true)
    setError(null)
    try {
      await deleteProduct(id)
      if (editingId === id) resetForm()
      await load()
      await menu.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  const categories = Array.from(
    new Set([
      ...products.map((p) => p.category),
      'Sandwiches & Burgers',
      'Mother Dairy (Singles)',
      'Mother Dairy (Family)',
    ]),
  )

  return (
    <div className="admin-page">
      <header className="admin-top">
        <div>
          <Link to="/" className="cart-back">
            ← View site
          </Link>
          <h1>Products</h1>
          <p className="admin-muted">{auth.user?.email}</p>
        </div>
        <button type="button" className="admin-logout" onClick={() => void auth.logout()}>
          Logout
        </button>
      </header>

      <section className="admin-card">
        <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              disabled={busy}
            />
          </label>
          <label>
            Price (leave empty = price on request)
            <input
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="e.g. 80"
              inputMode="decimal"
              disabled={busy}
            />
          </label>
          <label>
            Category
            <select
              value={categories.includes(form.category) ? form.category : '__NEW__'}
              onChange={(e) => {
                const val = e.target.value
                if (val === '__NEW__') {
                  setForm((f) => ({ ...f, category: '' }))
                } else {
                  setForm((f) => ({ ...f, category: val }))
                }
              }}
              disabled={busy}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__NEW__">+ Add New Category…</option>
            </select>

            {(!categories.includes(form.category) || form.category === '') && (
              <input
                style={{ marginTop: '8px' }}
                placeholder="Type new category name…"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
                disabled={busy}
              />
            )}

            <div className="category-pills">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`category-pill ${form.category === c ? 'active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                  disabled={busy}
                >
                  {c}
                </button>
              ))}
            </div>
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))}
              disabled={busy}
            />
            Visible on menu
          </label>
          {error && <p className="admin-error">{error}</p>}
          <div className="admin-form-actions">
            <button type="submit" className="btn-order" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Update' : 'Add product'}
            </button>
            {editingId && (
              <button type="button" className="admin-secondary" onClick={resetForm} disabled={busy}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <h2>All products ({products.length})</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Visible</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatProductPrice(p.price) ?? 'On request'}</td>
                    <td>{p.is_visible ? 'Yes' : 'Hidden'}</td>
                    <td className="admin-row-actions">
                      <button type="button" onClick={() => startEdit(p)} disabled={busy}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => void onDelete(p.id, p.name)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
