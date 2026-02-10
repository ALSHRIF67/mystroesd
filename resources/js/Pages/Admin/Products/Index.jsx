import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  PauseCircle,
  Archive,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Package,
  DollarSign,
  User,
  Image as ImageIcon,
  Calendar,
  BarChart3,
  Filter as FilterIcon,
  Trash2,
  Edit,
  Shield,
  Store,
  Tag,
  Layers,
  Check,
  Clock,
  AlertOctagon
} from '@/Icons/LucideShims';

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

  // Memoize items to prevent unnecessary recalculations
  const items = useMemo(() => {
    return Array.isArray(products) ? products : (products?.data || []);
  }, [products]);

  // Memoize statistics
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

  // Handle action with loading state
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
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Pending'
      },
      approved: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Approved'
      },
      rejected: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        icon: <XCircle className="w-4 h-4" />,
        label: 'Rejected'
      },
      suspended: { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-300', 
        icon: <PauseCircle className="w-4 h-4" />,
        label: 'Suspended'
      },
      archived: { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-800 dark:text-gray-300', 
        icon: <Archive className="w-4 h-4" />,
        label: 'Archived'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        <span className="ml-1.5">{config.label}</span>
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

  const getActionButtons = useCallback((product) => {
    const actions = [];

    // View button for all products
    actions.push(
      <Link
        key="view"
        href={route('admin.products.show', product.id)}
        className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors whitespace-nowrap"
        title="View Details"
      >
        <Eye className="w-4 h-4 mr-1.5" />
        View
      </Link>
    );

    // Edit button for all except archived
    if (product.status !== 'archived') {
      actions.push(
        <Link
          key="edit"
          href={route('admin.products.edit', product.id)}
          className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors whitespace-nowrap"
          title="Edit Product"
        >
          <Edit className="w-4 h-4 mr-1.5" />
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
          className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Approve Product"
        >
          <CheckCircle className="w-4 h-4 mr-1.5" />
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
          className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reject Product"
        >
          <XCircle className="w-4 h-4 mr-1.5" />
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
          className="flex items-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Suspend Product"
        >
          <PauseCircle className="w-4 h-4 mr-1.5" />
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
          className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Activate Product"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Activate
        </button>
      );
    }

    // Archive/Restore button
    if (product.status !== 'archived' && !product.deleted_at) {
      actions.push(
        <button
          key="archive"
          onClick={() => handleAction(product.id, 'archive')}
          disabled={loading}
          className="flex items-center px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Archive Product"
        >
          <Archive className="w-4 h-4 mr-1.5" />
          Archive
        </button>
      );
    } else if (product.deleted_at) {
      actions.push(
        <button
          key="restore"
          onClick={() => handleAction(product.id, 'restore')}
          disabled={loading}
          className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Restore Product"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
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

  // Handle keyboard shortcuts
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

  // Get seller name with fallback logic
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

  // Get seller status
  const getSellerStatus = useCallback((product) => {
    if (product.seller?.is_suspended) {
      return { text: 'Suspended', className: 'text-red-600 dark:text-red-400' };
    }
    if (product.seller?.status === 'active') {
      return { text: 'Active', className: 'text-green-600 dark:text-green-400' };
    }
    return { text: 'N/A', className: 'text-gray-600 dark:text-gray-400' };
  }, []);

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
              <ChevronUp className="w-4 h-4 mr-1 rotate-90" />
              Back to Dashboard
            </Link>
            {auth.user?.is_admin && (
              <Link
                href={route('admin.products.activity')}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400"
              >
                <Clock className="w-4 h-4 mr-1" />
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
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Review</div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{productStats.pending}</div>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{productStats.approved}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{productStats.rejected}</div>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Suspended</div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{productStats.suspended}</div>
                </div>
                <PauseCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Archived</div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{productStats.archived}</div>
                </div>
                <Archive className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Low Stock</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{productStats.lowStock}</div>
                </div>
                <AlertOctagon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleFilter()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh List
            </button>
            <Link
              href={route('admin.products.stats')}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Detailed Stats
            </Link>
            <Link
              href={route('admin.sellers.index')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              <Store className="w-4 h-4 mr-2" />
              Manage Sellers
            </Link>
            <Link
              href={route('admin.categories.index')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
            >
              <Layers className="w-4 h-4 mr-2" />
              Manage Categories
            </Link>
          </div>

          {/* Filters Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900"
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Filters {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>
                <div className="flex items-center space-x-2">
                  {selectedProducts.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProducts.length} selected
                      </span>
                      <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md text-sm"
                      >
                        <Shield className="w-4 h-4 mr-1" />
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                        placeholder="Search by name, SKU, seller, or description..."
                        className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={handleFilter}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Apply Filters
                    </button>
                    <button
                      onClick={handleResetFilter}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Bulk Actions for {selectedProducts.length} products
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleBulkAction('suspend')}
                      className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                    >
                      <PauseCircle className="w-4 h-4 mr-1" />
                      Suspend
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </button>
                    <button
                      onClick={() => setShowBulkActions(false)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                    >
                      <X className="w-4 h-4 mr-1" />
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
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mr-3" />
                  <span className="text-lg font-medium">Processing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                  {items.map((product) => {
                    const sellerStatus = getSellerStatus(product);
                    
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
                              {product.images && product.images[0] ? (
                                <div className="relative">
                                  <img
                                    src={product.images[0]}
                                    alt={product.title || product.name}
                                    className="h-12 w-12 rounded-md object-cover mr-3"
                                  />
                                  {product.images.length > 1 && (
                                    <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                      +{product.images.length - 1}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
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
                                    {expandedRows[product.id] ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
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
                                    <User className="w-3 h-3 inline" />
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
                                    <Package className="w-3 h-3 inline mr-1" />
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
                              <div className="flex items-center justify-end">
                                <Calendar className="w-4 h-4 text-gray-400 ml-1" />
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
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <Tag className="w-4 h-4 mr-2" />
                                    Product Description
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line bg-gray-100 dark:bg-gray-800 p-3 rounded">
                                    {product.description || 'No description provided.'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <Package className="w-4 h-4 mr-2" />
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
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <Store className="w-4 h-4 mr-2" />
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
                                            <Eye className="w-4 h-4 mr-1" />
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Package className="w-16 h-16 mx-auto" />
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
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

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
                  <XCircle className="w-6 h-6 text-red-600 mr-2" />
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
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
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
    </AuthenticatedLayout>
  );
}