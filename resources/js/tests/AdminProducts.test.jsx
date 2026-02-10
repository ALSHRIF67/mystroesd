import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminProductsIndex from '@/Pages/Admin/Products/Index.jsx';

// Mock router.post from inertia
vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn() },
    Head: () => null,
}));

describe('AdminProductsIndex', () => {
    it('renders products and action buttons', () => {
        const products = [
            { id: 1, title: 'Product One', status: 'pending', status_text: 'Pending', user: { name: 'Seller A' } },
            { id: 2, title: 'Product Two', status: 'pending', status_text: 'Pending', user: { name: 'Seller B' } },
        ];

        render(<AdminProductsIndex products={products} />);

        expect(screen.getByText('Product One')).toBeInTheDocument();
        expect(screen.getAllByText('Approve').length).toBeGreaterThanOrEqual(1);

        // click approve on first product
        const approveButtons = screen.getAllByText('Approve');
        fireEvent.click(approveButtons[0]);

        const { router } = require('@inertiajs/react');
        expect(router.post).toHaveBeenCalled();
    });
});
