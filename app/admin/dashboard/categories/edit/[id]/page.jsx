'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import CategoryForm from '../../_components/CategoryForm';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function EditCategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/categories/${id}`, {
          withCredentials: true,
        });
        setCategory(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/categories"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return <CategoryForm initialData={category} isEdit={true} />;
}