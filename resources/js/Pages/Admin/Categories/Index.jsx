import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminCategoriesIndex({ categories = [] }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl">Admin - Categories</h2>}>
            <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Categories ({categories.length})</h3>
                <ul className="divide-y bg-white dark:bg-gray-800 rounded shadow">
                    {categories.map(c => (
                        <li key={c.id} className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-sm text-gray-500">{c.description || ''}</div>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded ${c.is_active ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                                    {c.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </AuthenticatedLayout>
    );
}
