import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminSellersIndex({ sellers = [] }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl">Admin - Sellers</h2>}>
            <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Sellers ({sellers.length})</h3>
                <ul className="divide-y bg-white dark:bg-gray-800 rounded shadow">
                    {sellers.map(s => (
                        <li key={s.id} className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-sm text-gray-500">{s.email}</div>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded ${s.is_suspended ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                    {s.is_suspended ? 'Suspended' : 'Active'}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </AuthenticatedLayout>
    );
}
