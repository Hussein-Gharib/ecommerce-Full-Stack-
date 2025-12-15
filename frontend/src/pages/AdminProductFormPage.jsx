import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const AdminProductFormPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // موجود بس بوضع edit
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category_id: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return navigate('/login', { replace: true });
    if (!user || user.role !== 'admin') return navigate('/', { replace: true });

    const fetchOne = async () => {
      try {
        setError('');
        const res = await api.get(`/products/${id}`);
        const p = res.data?.data;
        setForm({
          name: p?.name || '',
          description: p?.description || '',
          price: p?.price != null ? String(p.price) : '',
          stock: p?.stock != null ? String(p.stock) : '',
          image_url: p?.image_url || '',
          category_id: p?.category_id != null ? String(p.category_id) : '',
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        stock: form.stock === '' ? 0 : Number(form.stock),
        image_url: form.image_url || null,
        category_id: form.category_id || null,
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      navigate('/', { replace: true }); // أو /products إذا عندك route منفصل
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to save product'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 style={{ marginTop: 12 }}>
        {isEdit ? 'Edit product' : 'Create new product'}
      </h1>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <form
        onSubmit={onSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} required />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={onChange}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={onChange}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Image URL</label>
          <input name="image_url" value={form.image_url} onChange={onChange} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Category ID (optional)</label>
          <input
            name="category_id"
            value={form.category_id}
            onChange={onChange}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            style={{ resize: 'vertical', padding: 8, borderRadius: 10, border: '1px solid #d1d5db' }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update product' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
