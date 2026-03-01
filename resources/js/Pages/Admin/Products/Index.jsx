import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// ProductImage Component (unchanged – keep as is)
const ProductImage = ({ imageUrl, title, size = 'md', showBadge = false, badgeCount = 0, className = '' }) => {
  // ... (same as before)
};

export default function AdminProductsIndex({ products = [], filters = {}, stats = null }) {
  const { auth } = usePage().props;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const items = useMemo(() => Array.isArray(products) ? products : (products?.data || []), [products]);

  const productStats = useMemo(() => {
    if (stats) return stats;
    return {
      total: items.length,
      pending: items.filter(p => p.status === 'pending').length,
      approved: items.filter(p => p.status === 'approved').length,
      rejected: items.filter(p => p.status === 'rejected').length,
      suspended: items.filter(p => p.status === 'suspended').length,
      archived: items.filter(p => p.status === 'archived' || p.deleted_at).length,
      lowStock: items.filter(p => p.stock > 0 && p.stock < 10).length,
    };
  }, [stats, items]);

  const getFirstImage = useCallback((product) => {
    if (product.image_url) return product.image_url;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    if (product.featured_image) return product.featured_image;
    if (product.thumbnail) return product.thumbnail;
    return null;
  }, []);

  const getAdditionalImageCount = useCallback((product) => {
    if (!product.images || !Array.isArray(product.images) || product.images.length <= 1) return 0;
    return product.images.length - 1;
  }, []);

  const handleAction = useCallback((id, action, reason = null) => {
    if (action === 'reject') {
      setSelectedProduct(id);
      setShowRejectionModal(true);
      return;
    }
    setLoading(true);
    router.post(route('admin.products.action', { id, action }), {
      rejection_reason: reason
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedProduct(null);
        setRejectionReason('');
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
        alert('Action failed. Please try again.');
      }
    });
  }, []);

  const handleRejectConfirm = useCallback(() => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    router.post(route('admin.products.action', { id: selectedProduct, action: 'reject' }), {
      rejection_reason: rejectionReason
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setShowRejectionModal(false);
        setRejectionReason('');
        setSelectedProduct(null);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
        alert('Rejection failed. Please try again.');
      }
    });
  }, [rejectionReason, selectedProduct]);

  const toggleRowExpand = useCallback((id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleFilter = useCallback(() => {
    router.get(route('admin.products.index'), {
      search: searchTerm,
      status: statusFilter
    }, { preserveState: true, preserveScroll: true });
  }, [searchTerm, statusFilter]);

  const handleResetFilter = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    router.get(route('admin.products.index'), {}, { preserveState: true, preserveScroll: true });
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      suspended: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Suspended' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archived' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${config.bg} ${config.text} border border-${config.bg.split('-')[1]}-200`}>
        {config.label}
      </span>
    );
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }, []);

  const toggleProductSelection = useCallback((id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  }, []);

  const selectAllProducts = useCallback(() => {
    if (selectedProducts.length === items.length) setSelectedProducts([]);
    else setSelectedProducts(items.map(p => p.id));
  }, [items, selectedProducts]);

  const handleBulkAction = useCallback((action) => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }
    if (action === 'reject') {
      const reason = prompt('Enter rejection reason for all selected products:');
      if (!reason) return;
      router.post(route('admin.products.bulk-action'), {
        action: 'reject',
        product_ids: selectedProducts,
        rejection_reason: reason
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedProducts([]);
          setShowBulkActions(false);
        }
      });
    } else {
      router.post(route('admin.products.bulk-action'), {
        action,
        product_ids: selectedProducts
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedProducts([]);
          setShowBulkActions(false);
        }
      });
    }
  }, [selectedProducts]);

  const handleBulkDelete = useCallback(() => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }
    setShowBulkDeleteModal(true);
  }, [selectedProducts]);

  const confirmBulkDelete = useCallback(() => {
    setLoading(true);
    router.post(route('admin.products.bulk-destroy'), {
      product_ids: selectedProducts
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedProducts([]);
        setShowBulkActions(false);
        setShowBulkDeleteModal(false);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
        alert('Delete failed. Please try again.');
      }
    });
  }, [selectedProducts]);

  const getActionButtons = useCallback((product) => {
    const actions = [];
    actions.push(
      <Link
        key="view"
        href={route('products.show', product.slug ? `${product.id}-${product.slug}` : product.id)}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors"
        title="View Details"
      >
        View
      </Link>
    );
    if (product.status !== 'archived') {
      actions.push(
        <Link
          key="edit"
          href={route('admin.products.edit', product.id)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition-colors"
          title="Edit Product"
        >
          Edit
        </Link>
      );
    }
    if (product.status === 'pending') {
      actions.push(
        <button
          key="approve"
          onClick={() => handleAction(product.id, 'approve')}
          disabled={loading}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
          title="Approve Product"
        >
          Approve
        </button>
      );
    }
    if (['pending', 'approved', 'suspended'].includes(product.status)) {
      actions.push(
        <button
          key="reject"
          onClick={() => handleAction(product.id, 'reject')}
          disabled={loading}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
          title="Reject Product"
        >
          Reject
        </button>
      );
    }
    if (product.status === 'approved') {
      actions.push(
        <button
          key="suspend"
          onClick={() => handleAction(product.id, 'suspend')}
          disabled={loading}
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
          title="Suspend Product"
        >
          Suspend
        </button>
      );
    }
    if (product.status === 'suspended') {
      actions.push(
        <button
          key="activate"
          onClick={() => handleAction(product.id, 'approve')}
          disabled={loading}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
          title="Activate Product"
        >
          Activate
        </button>
      );
    }
    if (product.status !== 'archived' && !product.deleted_at) {
      actions.push(
        <button
          key="archive"
          onClick={() => handleAction(product.id, 'archive')}
          disabled={loading}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
          title="Archive Product"
        >
          Archive
        </button>
      );
    } else if (product.deleted_at) {
      actions.push(
        <button
          key="restore"
          onClick={() => handleAction(product.id, 'restore')}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
          title="Restore Product"
        >
          Restore
        </button>
      );
    }
    return actions;
  }, [handleAction, loading]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            selectAllProducts();
            break;
          case 'f':
            e.preventDefault();
            setShowFilters(true);
            break;
          case 'r':
            e.preventDefault();
            if (selectedProduct) handleRejectConfirm();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAllProducts, selectedProduct, handleRejectConfirm]);

  const getSellerDisplayName = useCallback((product) => {
    if (product.seller?.shop_name) return product.seller.shop_name;
    if (product.seller?.name) return product.seller.name;
    if (product.user?.name) return product.user.name;
    return '—';
  }, []);

  const getSellerStatus = useCallback((product) => {
    if (product.seller?.is_suspended) return { text: 'Suspended', className: 'text-red-600' };
    if (product.seller?.status === 'active') return { text: 'Active', className: 'text-green-600' };
    return { text: 'N/A', className: 'text-gray-600' };
  }, []);

  // Desktop Product Row Component
  const DesktopProductRow = ({ product }) => {
    const sellerStatus = getSellerStatus(product);
    const imageUrl = getFirstImage(product);
    const additionalCount = getAdditionalImageCount(product);
    return (
      <React.Fragment key={product.id}>
        <tr className="hover:bg-blue-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => toggleProductSelection(product.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="relative ml-3">
                <ProductImage
                  imageUrl={imageUrl}
                  title={product.title || product.name}
                  size="md"
                  showBadge={additionalCount > 0}
                  badgeCount={additionalCount}
                  className="ml-3"
                />
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.title || product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.category?.name || 'Uncategorized'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpand(product.id)}
                    className="ml-2 p-1 hover:bg-gray-100 rounded-md"
                  >
                    {expandedRows[product.id] ? '▲' : '▼'}
                  </button>
                </div>
                {product.sku && (
                  <div className="text-xs text-gray-400 mt-1">SKU: {product.sku}</div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-left">
              <div className="text-sm text-gray-900">{getSellerDisplayName(product)}</div>
              <div className="text-xs text-gray-500">
                <span className={sellerStatus.className}>{sellerStatus.text}</span>
                {product.seller && (
                  <Link
                    href={route('admin.sellers.show', product.seller.id)}
                    className="ml-2 text-indigo-600 hover:text-indigo-900"
                    title="View Seller"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</div>
              <div className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-left">
              {getStatusBadge(product.status)}
              {product.rejection_reason && product.status === 'rejected' && (
                <div className="text-xs text-red-500 mt-1 max-w-xs truncate" title={product.rejection_reason}>
                  Reason: {product.rejection_reason}
                </div>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="text-left">
              <div>{formatDate(product.created_at)}</div>
              {product.approved_at && (
                <div className="text-xs text-green-600 mt-1">Approved: {formatDate(product.approved_at)}</div>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-wrap gap-1 justify-end">
              {getActionButtons(product)}
            </div>
          </td>
        </tr>
        {expandedRows[product.id] && (
          <tr>
            <td colSpan="7" className="px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Product Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-100 p-3 rounded">
                    {product.description || 'No description provided.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="text-gray-700 ml-2">{product.brand || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Condition:</span>
                        <span className="text-gray-700 ml-2 capitalize">{product.condition || 'new'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Seller Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Seller Status:</span>
                      <span className={`font-medium ${sellerStatus.className}`}>{sellerStatus.text}</span>
                    </div>
                    {product.seller && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Shop Name:</span>
                          <span className="text-gray-700">{product.seller.shop_name || 'N/A'}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <Link
                            href={route('admin.sellers.show', product.seller.id)}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View Seller Profile
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => {
    const sellerStatus = getSellerStatus(product);
    const imageUrl = getFirstImage(product);
    return (
      <div key={product.id} className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => toggleProductSelection(product.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
            />
            <div className="flex items-start space-x-3">
              <ProductImage
                imageUrl={imageUrl}
                title={product.title || product.name}
                size="lg"
                className="flex-shrink-0"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{product.title || product.name}</div>
                <div className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</div>
                {product.sku && <div className="text-xs text-gray-400 mt-1">SKU: {product.sku}</div>}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleRowExpand(product.id)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            {expandedRows[product.id] ? '▲' : '▼'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500">Seller</div>
            <div className="text-sm text-gray-900">{getSellerDisplayName(product)}</div>
            <div className={`text-xs ${sellerStatus.className}`}>{sellerStatus.text}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</div>
            <div className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div className="mt-1">{getStatusBadge(product.status)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date</div>
            <div className="text-sm text-gray-700">{formatDate(product.created_at)}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">{getActionButtons(product)}</div>
        {expandedRows[product.id] && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Product Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-100 p-3 rounded">
                {product.description || 'No description provided.'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500">Brand:</span>
                    <span className="text-gray-700 ml-2">{product.brand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition:</span>
                    <span className="text-gray-700 ml-2 capitalize">{product.condition || 'new'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Product Management - Admin Panel" />

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-boxes text-white text-2xl"></i>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Product Management
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Review and manage all product submissions on the platform.
            </p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-3xl font-bold text-gray-800">{productStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-boxes text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-yellow-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{productStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-green-500 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600">{productStats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-red-500 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{productStats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-orange-500 text-sm">Suspended</p>
                <p className="text-3xl font-bold text-orange-600">{productStats.suspended}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-ban text-orange-600 text-xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-gray-500 text-sm">Archived</p>
                <p className="text-3xl font-bold text-gray-600">{productStats.archived}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-archive text-gray-600 text-xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-purple-500 text-sm">Low Stock</p>
                <p className="text-3xl font-bold text-purple-600">{productStats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={handleFilter}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
            >
              Refresh List
            </button>
            <Link
              href={route('admin.products.stats')}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white font-medium px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-md"
            >
              Detailed Stats
            </Link>
            <Link
              href={route('admin.sellers.index')}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md"
            >
              Manage Sellers
            </Link>
            <Link
              href={route('admin.categories.index')}
              className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-md"
            >
              Manage Categories
            </Link>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Filters {showFilters ? '▲' : '▼'}
              </button>
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-sm text-gray-600">{selectedProducts.length} selected</span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>

            {showFilters && (
              <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                      placeholder="Search products..."
                      className="w-full border-2 border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFilter}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleResetFilter}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <span className="text-sm font-medium text-blue-700">Bulk Actions for {selectedProducts.length} products</span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleBulkAction('approve')} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">Approve</button>
                    <button onClick={() => handleBulkAction('reject')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm">Reject</button>
                    <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm">Suspend</button>
                    <button onClick={() => handleBulkAction('archive')} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm">Archive</button>
                    <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm">Delete Permanently</button>
                    <button onClick={() => setShowBulkActions(false)} className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <span className="text-lg font-medium">Processing...</span>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4 mb-6">
            {items.length > 0 ? (
              items.map(product => <MobileProductCard key={product.id} product={product} />)
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="text-gray-400 mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'No products have been submitted yet.'}
                </p>
                {(searchTerm || statusFilter) && (
                  <button onClick={handleResetFilter} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === items.length && items.length > 0}
                        onChange={selectAllProducts}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Seller Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pricing & Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length > 0 ? (
                    items.map(product => <DesktopProductRow key={product.id} product={product} />)
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <i className="fas fa-box-open text-4xl text-gray-300 mb-3"></i>
                          <p className="text-lg">No products found.</p>
                          {(searchTerm || statusFilter) && (
                            <button onClick={handleResetFilter} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl">
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <nav className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => products.prev_page_url && router.get(products.prev_page_url)}
                      disabled={!products.prev_page_url}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => products.next_page_url && router.get(products.next_page_url)}
                      disabled={!products.next_page_url}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{products.from || 1}</span> to <span className="font-medium">{products.to || items.length}</span> of{' '}
                      <span className="font-medium">{products.total || items.length}</span> results
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {products.links.map((link, index) => (
                        <button
                          key={index}
                          onClick={() => link.url && router.get(link.url)}
                          disabled={!link.url}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            link.active
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } ${index === 0 ? 'rounded-l-md' : ''} ${
                            index === products.links.length - 1 ? 'rounded-r-md' : ''
                          } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      ))}
                    </nav>
                  </div>
                </nav>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Your Marketplace. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}