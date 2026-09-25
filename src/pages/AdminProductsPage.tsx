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
import { supabase } from '../lib/supabase'
import type { ProductRow } from '../lib/database.types'
import { MENU } from '../data/menu'

const EMPTY_FORM = {
  name: '',
  price: '',
  category: MENU[0]?.category || '',
  is_visible: true,
  image_url: '' as string | null,
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
  
  // Add product form state
  const [addForm, setAddForm] = useState(EMPTY_FORM)
  
  // Edit product state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  
  const [busy, setBusy] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

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

  const startEdit = (p: ProductRow) => {
    setEditingId(p.id)
    setEditForm({
      name: p.name,
      price: p.price === null ? '' : String(p.price),
      category: p.category,
      is_visible: p.is_visible,
      image_url: p.image_url,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase) return
    const file = e.target.files[0]
    setBusy(true)
    setError(null)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      
      if (isEdit) {
        setEditForm((f) => ({ ...f, image_url: data.publicUrl }))
      } else {
        setAddForm((f) => ({ ...f, image_url: data.publicUrl }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setBusy(false)
    }
  }

  const onAddSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const price = parsePriceInput(addForm.price)
      await createProduct({
        name: addForm.name,
        price,
        category: addForm.category,
        is_visible: addForm.is_visible,
        image_url: addForm.image_url,
      })
      setAddForm(EMPTY_FORM)
      await load()
      await menu.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }
  
  const onEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setBusy(true)
    setError(null)
    try {
      const price = parsePriceInput(editForm.price)
      await updateProduct(editingId, {
        name: editForm.name,
        price,
        category: editForm.category,
        is_visible: editForm.is_visible,
        image_url: editForm.image_url,
      })
      cancelEdit()
      await load()
      await menu.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
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
      if (editingId === id) cancelEdit()
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
      ...MENU.map((m) => m.category),
    ]),
  )

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="admin-page">
      <style>{`
        @media (max-width: 768px) {
          .inline-edit-container { position: sticky; left: 0; width: calc(100vw - 32px); padding: 16px !important; }
          .inline-edit-form { flex-direction: column; gap: 12px !important; }
          .inline-edit-form > label { flex: 1 1 100% !important; }
          .inline-edit-toggles { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
          .inline-edit-actions { flex-direction: column; }
        }
      `}</style>
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
        <h2>Add product</h2>
        <form className="admin-form" onSubmit={onAddSubmit}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ flex: '2 1 300px' }}>
              Name
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                required
                disabled={busy}
              />
            </label>
            <label style={{ flex: '1 1 150px' }}>
              Price (empty = on request)
              <input
                value={addForm.price}
                onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 80"
                inputMode="decimal"
                disabled={busy}
              />
            </label>
          </div>
          <label>
            Category
            <select
              value={categories.includes(addForm.category) ? addForm.category : '__NEW__'}
              onChange={(e) => {
                const val = e.target.value
                if (val === '__NEW__') {
                  setAddForm((f) => ({ ...f, category: '' }))
                } else {
                  setAddForm((f) => ({ ...f, category: val }))
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

            {(!categories.includes(addForm.category) || addForm.category === '') && (
              <input
                style={{ marginTop: '8px' }}
                placeholder="Type new category name…"
                value={addForm.category}
                onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                required
                disabled={busy}
              />
            )}
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={addForm.is_visible}
              onChange={(e) => setAddForm((f) => ({ ...f, is_visible: e.target.checked }))}
              disabled={busy}
            />
            Visible on menu
          </label>
          
          <label>
            Product Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, false)}
              disabled={busy}
              style={{ marginTop: '4px' }}
              key={addForm.image_url || 'no-image'} // Resets the file input if image is removed
            />
            {addForm.image_url && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <img 
                  src={addForm.image_url} 
                  alt="Preview" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
                <button
                  type="button"
                  onClick={() => setAddForm(f => ({ ...f, image_url: null }))}
                  className="admin-secondary"
                  disabled={busy}
                  style={{ fontSize: '13px', padding: '6px 12px', marginTop: '4px' }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </label>
          {error && <p className="admin-error">{error}</p>}
          <div className="admin-form-actions">
            <button type="submit" className="btn-order" disabled={busy}>
              {busy ? 'Saving…' : 'Add product'}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ margin: 0 }}>All products ({filteredProducts.length})</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
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
                {filteredProducts.map((p) => {
                  if (editingId === p.id) {
                    const inputStyle = { width: '100%', marginTop: '8px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' as const, fontSize: '15px' };
                    return (
                      <tr key={p.id} style={{ backgroundColor: '#fff', boxShadow: 'inset 0 0 0 2px #ea580c' }}>
                        <td colSpan={5} style={{ padding: 0 }}>
                          <div className="inline-edit-container" style={{ padding: '24px', boxSizing: 'border-box' }}>
                            <form onSubmit={onEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div className="inline-edit-form" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <label style={{ flex: '1 1 200px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1c1917' }}>Name</span>
                                  <input style={inputStyle} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required disabled={busy} />
                                </label>
                                <label style={{ flex: '1 1 120px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1c1917' }}>Price</span>
                                  <input style={inputStyle} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 80" inputMode="decimal" disabled={busy} />
                                </label>
                                <label style={{ flex: '1 1 200px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1c1917' }}>Category</span>
                                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} disabled={busy}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </label>
                              </div>
                              <div className="inline-edit-toggles" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label className="admin-check" style={{ margin: 0, padding: '8px 16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                  <input type="checkbox" checked={editForm.is_visible} onChange={e => setEditForm(f => ({ ...f, is_visible: e.target.checked }))} disabled={busy} />
                                  Visible on menu
                                </label>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eee', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1c1917' }}>Image:</span>
                                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={busy} style={{ width: '200px', fontSize: '13px' }} key={editForm.image_url || 'no-image'} />
                                  {editForm.image_url && <img src={editForm.image_url} alt="preview" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />}
                                  {editForm.image_url && <button type="button" onClick={() => setEditForm(f => ({ ...f, image_url: null }))} className="admin-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>Remove</button>}
                                </div>
                              </div>
                              
                              <div className="inline-edit-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button type="button" className="admin-secondary" onClick={cancelEdit} disabled={busy} style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                                <button type="submit" className="btn-order" disabled={busy} style={{ width: 'auto', padding: '10px 24px', borderRadius: '8px', border: 'none' }}>{busy ? 'Saving...' : 'Save Changes'}</button>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
