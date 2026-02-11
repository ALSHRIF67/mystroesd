import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// ProductImage Component
const ProductImage = ({ imageUrl, title, size = 'md', showBadge = false, badgeCount = 0, className = '' }) => {
  // Helper function to get image URL - handles different formats
  const getImageUrl = useCallback((image) => {
    if (!image) return null;
    
    // If image is already a full URL
    if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('https'))) {
      return image;
    }
    
    // If image is a relative path starting with /
    if (typeof image === 'string' && image.startsWith('/')) {
      return image;
    }
    
    // If image is a path from storage (without leading /)
    if (typeof image === 'string') {
      return `/storage/${image}`;
    }
    
    // If image is an object with url property
    if (image && typeof image === 'object' && image.url) {
      return getImageUrl(image.url);
    }
    
    return null;
  }, []);

  // Get image URL
  const actualImageUrl = useMemo(() => {
    return getImageUrl(imageUrl);
  }, [imageUrl, getImageUrl]);

  // Size classes
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  // Fallback SVG for image errors
  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNCIgZmlsbD0iI0ZGMUYxRiIvPgo8cGF0aCBkPSJNMzAgMjJDMzAgMjUuMzEzNyAyNy4zMTM3IDI4IDI0IDI4QzIwLjY4NjMgMjggMTggMjUuMzEzNyAxOCAyMkMxOCAxOC42ODYzIDIwLjY4NjMgMTYgMjQgMTZDMjcuMzEzNyAxNiAzMCAxOC42ODYzIDMwIDIyWiIgZmlsbD0iI0RFREVERSIvPgo8cGF0aCBkPSJNMjQgMzJDMjAuNzIgMzIgMTQgMzQuMDggMTQgMzhIMzRDMzQgMzQuMDggMjcuMjggMzIgMjQgMzJaIiBmaWxsPSIjREVERURFIi8+Cjwvc3ZnPgo=';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderSvg;
  };

  if (!actualImageUrl) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center ${className}`}>
        <span className="text-gray-400 dark:text-gray-500 text-xs">No Image</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={actualImageUrl}
        alt={title || 'Product Image'}
        className={`${sizeClasses[size]} rounded-md object-cover ${className}`}
        onError={handleImageError}
      />
      {showBadge && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          +{badgeCount}
        </span>
      )}
    </div>
  );
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

  const items = useMemo(() => {
    return Array.isArray(products) ? products : (products?.data || []);
  }, [products]);

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

  // Helper to get first image from product
  const getFirstImage = useCallback((product) => {
    // Try image_url first (single image)
    if (product.image_url) {
      return product.image_url;
    }
    
    // Try images array (multiple images)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    // Try featured_image
    if (product.featured_image) {
      return product.featured_image;
    }
    
    // Try thumbnail
    if (product.thumbnail) {
      return product.thumbnail;
    }
    
    return null;
  }, []);

  // Helper to count additional images
  const getAdditionalImageCount = useCallback((product) => {
    if (!product.images || !Array.isArray(product.images) || product.images.length <= 1) {
      return 0;
    }
    
    return product.images.length - 1;
  }, []);

  const handleAction = useCallback((id, action, reason = null) => {
    if (action === 'reject') {
      setSelectedProduct(id);
      setShowRejectionModal(true);
      return;
    }

    setLoading(true);
    router.post(route(`admin.products.${action}`, id), {
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
    router.post(route('admin.products.reject', selectedProduct), {
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
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleFilter = useCallback(() => {
    router.get(route('admin.products.index'), {
      search: searchTerm,
      status: statusFilter
    }, {
      preserveState: true,
      preserveScroll: true
    });
  }, [searchTerm, statusFilter]);

  const handleResetFilter = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    router.get(route('admin.products.index'), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300',
        label: 'Pending'
      },
      approved: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300',
        label: 'Approved'
      },
      rejected: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300',
        label: 'Rejected'
      },
      suspended: { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-300',
        label: 'Suspended'
      },
      archived: { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-800 dark:text-gray-300',
        label: 'Archived'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.label}</span>
      </span>
    );
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const toggleProductSelection = useCallback((id) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAllProducts = useCallback(() => {
    if (selectedProducts.length === items.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(items.map(p => p.id));
    }
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
        href={route('admin.products.show', product.id)}
        className="flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto"
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
          className="flex items-center justify-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto"
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
          className="flex items-center justify-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
            if (selectedProduct) {
              handleRejectConfirm();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAllProducts, selectedProduct, handleRejectConfirm]);

  const getSellerDisplayName = useCallback((product) => {
    if (product.seller?.shop_name) {
      return product.seller.shop_name;
    }
    if (product.seller?.name) {
      return product.seller.name;
    }
    if (product.user?.name) {
      return product.user.name;
    }
    return '—';
  }, []);

  const getSellerStatus = useCallback((product) => {
    if (product.seller?.is_suspended) {
      return { text: 'Suspended', className: 'text-red-600 dark:text-red-400' };
    }
    if (product.seller?.status === 'active') {
      return { text: 'Active', className: 'text-green-600 dark:text-green-400' };
    }
    return { text: 'N/A', className: 'text-gray-600 dark:text-gray-400' };
  }, []);

  // Desktop Product Row Component
  const DesktopProductRow = ({ product }) => {
    const sellerStatus = getSellerStatus(product);
    const imageUrl = getFirstImage(product);
    const additionalCount = getAdditionalImageCount(product);
    
    return (
      <React.Fragment key={product.id}>
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
              <div className="relative">
                <ProductImage
                  imageUrl={imageUrl}
                  title={product.title || product.name}
                  size="md"
                  showBadge={additionalCount > 0}
                  badgeCount={additionalCount}
                  className="mr-3"
                />
              </div>
              <div className="text-right flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {product.title || product.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category?.name || 'Uncategorized'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpand(product.id)}
                    className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {expandedRows[product.id] ? '▲' : '▼'}
                  </button>
                </div>
                {product.sku && (
                  <div className="text-xs text-gray-400 mt-1">
                    SKU: {product.sku}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-right">
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {getSellerDisplayName(product)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className={sellerStatus.className}>
                  {sellerStatus.text}
                </span>
                {product.seller && (
                  <Link
                    href={route('admin.sellers.show', product.seller.id)}
                    className="ml-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                    title="View Seller"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(product.price)}
              </div>
              <div className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {product.stock > 0 ? (
                  <>
                    {product.stock} in stock
                  </>
                ) : (
                  'Out of stock'
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-right">
              {getStatusBadge(product.status)}
              {product.rejection_reason && product.status === 'rejected' && (
                <div className="text-xs text-red-500 mt-1 max-w-xs truncate" title={product.rejection_reason}>
                  Reason: {product.rejection_reason}
                </div>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            <div className="text-right">
              <div>
                {formatDate(product.created_at)}
              </div>
              {product.approved_at && (
                <div className="text-xs text-green-600 mt-1">
                  Approved: {formatDate(product.approved_at)}
                </div>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-wrap gap-1 justify-end">
              {getActionButtons(product)}
            </div>
          </td>
        </tr>
        
        {/* Expanded Row Details */}
        {expandedRows[product.id] && (
          <tr>
            <td colSpan="7" className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Product Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line bg-gray-100 dark:bg-gray-800 p-3 rounded">
                    {product.description || 'No description provided.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Specifications
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          {product.brand || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Condition:</span>
                        <span className="text-gray-700 dark:text-gray-300 ml-2 capitalize">
                          {product.condition || 'new'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          {product.weight ? `${product.weight} kg` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          {product.dimensions || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Warranty:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {product.warranty || 'No warranty'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Seller Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Seller Status:</span>
                      <span className={`font-medium ${sellerStatus.className}`}>
                        {sellerStatus.text}
                      </span>
                    </div>
                    {product.seller && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Shop Name:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {product.seller.shop_name || 'N/A'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            href={route('admin.sellers.show', product.seller.id)}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
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
      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.title || product.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {product.category?.name || 'Uncategorized'}
                </div>
                {product.sku && (
                  <div className="text-xs text-gray-400 mt-1">
                    SKU: {product.sku}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleRowExpand(product.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            {expandedRows[product.id] ? '▲' : '▼'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Seller</div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {getSellerDisplayName(product)}
            </div>
            <div className={`text-xs ${sellerStatus.className}`}>
              {sellerStatus.text}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(product.price)}
            </div>
            <div className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
            <div className="mt-1">{getStatusBadge(product.status)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {formatDate(product.created_at)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {getActionButtons(product)}
        </div>

        {expandedRows[product.id] && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Product Description
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line bg-gray-100 dark:bg-gray-800 p-3 rounded">
                {product.description || 'No description provided.'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Specifications
              </h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">
                      {product.brand || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Condition:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2 capitalize">
                      {product.condition || 'new'}
                    </span>
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
    <AuthenticatedLayout 
      header={
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Product Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review and manage product submissions ({items.length} products)
            </p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center space-x-3">
            <Link
              href={route('admin.dashboard')}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Back to Dashboard
            </Link>
            {auth.user?.is_admin && (
              <Link
                href={route('admin.products.activity')}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400"
              >
                View Activity
              </Link>
            )}
          </div>
        </div>
      }
    >
      <Head title="Product Management - Admin Panel" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Products</div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{productStats.total}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Review</div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{productStats.pending}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{productStats.approved}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{productStats.rejected}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Suspended</div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{productStats.suspended}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Archived</div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{productStats.archived}</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Low Stock</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{productStats.lowStock}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleFilter()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
            >
              Refresh List
            </button>
            <Link
              href={route('admin.products.stats')}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
            >
              View Detailed Stats
            </Link>
            <Link
              href={route('admin.sellers.index')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              Manage Sellers
            </Link>
            <Link
              href={route('admin.categories.index')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
            >
              Manage Categories
            </Link>
          </div>

          {/* Filters Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900"
                >
                  Filters {showFilters ? '▲' : '▼'}
                </button>
                <div className="flex flex-wrap items-center space-x-2">
                  {selectedProducts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProducts.length} selected
                      </span>
                      <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md text-sm"
                      >
                        Bulk Actions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search Products
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                      placeholder="Search by name, SKU, seller, or description..."
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 px-3 py-2"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:items-end">
                    <button
                      onClick={handleFilter}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={handleResetFilter}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Bulk Actions for {selectedProducts.length} products
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleBulkAction('suspend')}
                      className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                    >
                      Archive
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Delete Selected Permanently
                    </button>
                    <button
                      onClick={() => setShowBulkActions(false)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-lg font-medium">Processing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4 mb-6">
            {items.length > 0 ? (
              items.map((product) => (
                <MobileProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter ? 'Try adjusting your filters or search terms.' : 'No products have been submitted yet. Check back later!'}
                </p>
                {(searchTerm || statusFilter) && (
                  <button
                    onClick={handleResetFilter}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === items.length && items.length > 0}
                        onChange={selectAllProducts}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        title="Select all products"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Seller Info
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pricing & Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {items.length > 0 ? (
                    items.map((product) => (
                      <DesktopProductRow key={product.id} product={product} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No products found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          {searchTerm || statusFilter ? 'Try adjusting your filters or search terms.' : 'No products have been submitted yet. Check back later!'}
                        </p>
                        {(searchTerm || statusFilter) && (
                          <button
                            onClick={handleResetFilter}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <nav className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => products.prev_page_url && router.get(products.prev_page_url)}
                      disabled={!products.prev_page_url}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => products.next_page_url && router.get(products.next_page_url)}
                      disabled={!products.next_page_url}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mr-4">
                        Showing <span className="font-medium">{products.from || 1}</span> to <span className="font-medium">{products.to || items.length}</span> of{' '}
                        <span className="font-medium">{products.total || items.length}</span> results
                      </p>
                    </div>
                    <div className="ml-4">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {products.links.map((link, index) => (
                          <button
                            key={index}
                            onClick={() => link.url && router.get(link.url)}
                            disabled={!link.url}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              link.active
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            } ${index === 0 ? 'rounded-r-md' : ''} ${
                              index === products.links.length - 1 ? 'rounded-l-md' : ''
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        ))}
                      </nav>
                    </div>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Reject Product
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                    setSelectedProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this product. The seller will see this feedback and can resubmit with corrections.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide clear feedback on why the product was rejected..."
                  className="w-full h-32 px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
                  autoFocus
                />
                <div className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters. Be specific and constructive.
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Common Rejection Reasons (Click to use)
                </label>
                <div className="space-y-1">
                  {[
                    'Insufficient product description',
                    'Low quality images',
                    'Price not competitive',
                    'Incorrect category',
                    'Missing required specifications',
                    'Violates marketplace policies'
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setRejectionReason(reason)}
                      className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim() || loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
                  Confirm Permanent Delete
                </h3>
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-500 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                  <p className="text-red-800 dark:text-red-300 font-medium">
                    Are you sure you want to permanently delete the selected products?
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    This action cannot be undone. {selectedProducts.length} product(s) will be permanently removed from the database.
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Products will be force deleted and cannot be recovered. This includes all associated data, images, and records.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}