import React, { useState } from 'react';
import { useWallets } from '../../hooks/useWallets';
import { useTransactions } from '../../hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from 'shared/components/ui/card';
import { Badge } from 'shared/components/common/Badge';
import { Button } from 'shared/components/common/Button';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import WalletDetailsDialog from '../../components/WalletDetailsDialog/WalletDetailsDialog';
import { 
  Wallet, 
  User, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Eye
} from 'lucide-react';

const WalletsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  
  const [activeTab, setActiveTab] = useState('wallets');
  const [showWalletFilters, setShowWalletFilters] = useState(false);
  const [showTxFilters, setShowTxFilters] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  
  const [walletFilters, setWalletFilters] = useState({
    status: '',
    minBalance: '',
    maxBalance: '',
  });
  
  const [txFilters, setTxFilters] = useState({
    type: '',
    status: '',
  });

  const { wallets, loading: walletsLoading, pagination: walletPagination, updateFilters: updateWalletFilters, goToPage: goToWalletPage } = useWallets();
  const { transactions, loading: txLoading, pagination: txPagination, updateFilters: updateTxFilters, goToPage: goToTxPage } = useTransactions();

  const handleWalletFilterChange = (e) => {
    const { name, value } = e.target;
    setWalletFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTxFilterChange = (e) => {
    const { name, value } = e.target;
    setTxFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyWalletFilters = () => {
    const cleanFilters = {};
    Object.keys(walletFilters).forEach(key => {
      if (walletFilters[key]) {
        cleanFilters[key] = walletFilters[key];
      }
    });
    updateWalletFilters(cleanFilters);
  };

  const resetWalletFilters = () => {
    setWalletFilters({ status: '', minBalance: '', maxBalance: '' });
    updateWalletFilters({});
  };

  const applyTxFilters = () => {
    const cleanFilters = {};
    Object.keys(txFilters).forEach(key => {
      if (txFilters[key]) {
        cleanFilters[key] = txFilters[key];
      }
    });
    updateTxFilters(cleanFilters);
  };

  const resetTxFilters = () => {
    setTxFilters({ type: '', status: '' });
    updateTxFilters({});
  };

  const handleViewDetails = (walletId) => {
    setSelectedWalletId(walletId);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      SUSPENDED: 'danger',
      CLOSED: 'default',
    };
    return statusMap[status] || 'default';
  };

  const getTxStatusColor = (status) => {
    const statusMap = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      CANCELLED: 'default',
    };
    return statusMap[status] || 'default';
  };

  const getTxTypeIcon = (type) => {
    return type === 'DEPOSIT' || type === 'CREDIT' || type === 'REFUND' 
      ? <ArrowDownLeft className="w-4 h-4 text-green-400" />
      : <ArrowUpRight className="w-4 h-4 text-red-400" />;
  };

  const getTxTypeColor = (type) => {
    return type === 'DEPOSIT' || type === 'CREDIT' || type === 'REFUND'
      ? 'text-green-400'
      : 'text-red-400';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Wallet className="w-7 h-7 text-blue-500 dark:text-blue-400" />
            {t('walletManagement') || 'Wallet Management'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            {t('manageUserWalletsTransactions') || 'Manage user wallets and transactions'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('wallets')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'wallets'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {t('wallets') || 'Wallets'}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'transactions'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {t('transactions') || 'Transactions'}
        </button>
      </div>

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <>
          {/* Wallet Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                {t('filters') || 'Filters'}
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowWalletFilters(!showWalletFilters)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {showWalletFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
              </Button>
            </div>

            {showWalletFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('status') || 'Status'}
                    </label>
                    <select
                      name="status"
                      value={walletFilters.status}
                      onChange={handleWalletFilterChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('all') || 'All'}</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('minBalance') || 'Min Balance'}
                    </label>
                    <input
                      type="number"
                      name="minBalance"
                      value={walletFilters.minBalance}
                      onChange={handleWalletFilterChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('maxBalance') || 'Max Balance'}
                    </label>
                    <input
                      type="number"
                      name="maxBalance"
                      value={walletFilters.maxBalance}
                      onChange={handleWalletFilterChange}
                      placeholder="10000.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={applyWalletFilters}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Search className="w-4 h-4" />
                    {t('applyFilters') || 'Apply Filters'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={resetWalletFilters}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <X className="w-4 h-4" />
                    {t('resetFilters') || 'Reset'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Wallets Table */}
          {walletsLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map(i => (
                      <tr key={i}>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {t('noWalletsFound') || 'No wallets found'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('noWalletsMatchFilters') || 'No wallets match your current filters'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('walletId') || 'Wallet ID'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('userId') || 'User ID'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('balance') || 'Balance'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('currency') || 'Currency'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('status') || 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('createdDate') || 'Created Date'}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {t('actions') || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {wallets.map(wallet => (
                        <tr 
                          key={wallet.id} 
                          className={`transition-colors ${
                            wallet.status === 'ACTIVE' 
                              ? 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100/50 dark:hover:bg-green-900/20 border-l-4 border-l-green-500'
                              : wallet.status === 'SUSPENDED'
                              ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20 border-l-4 border-l-red-500'
                              : wallet.status === 'INACTIVE'
                              ? 'bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20 border-l-4 border-l-yellow-500'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-l-transparent'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-500/10 p-2 rounded-lg">
                                <Wallet className="w-4 h-4 text-blue-500" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[200px]" title={wallet.id}>
                                {wallet.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-400" />
                              <span className="text-slate-900 dark:text-white">#{wallet.userId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="font-bold text-lg text-green-400">
                                ${wallet.balance?.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-slate-900 dark:text-white">{wallet.currency || 'USD'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={getStatusColor(wallet.status)}>
                              {wallet.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 dark:text-white text-sm">
                                {wallet.createdAt ? new Date(wallet.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              <Button 
                                variant="secondary" 
                                className="w-9 h-9 p-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-all duration-200"
                                onClick={() => handleViewDetails(wallet.id)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {walletPagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => goToWalletPage(walletPagination.currentPage - 1)}
                    disabled={walletPagination.currentPage === 0}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('previous') || 'Previous'}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(walletPagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (walletPagination.totalPages <= 5) {
                        pageNum = i;
                      } else if (walletPagination.currentPage < 3) {
                        pageNum = i;
                      } else if (walletPagination.currentPage > walletPagination.totalPages - 3) {
                        pageNum = walletPagination.totalPages - 5 + i;
                      } else {
                        pageNum = walletPagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToWalletPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            pageNum === walletPagination.currentPage
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => goToWalletPage(walletPagination.currentPage + 1)}
                    disabled={walletPagination.currentPage >= walletPagination.totalPages - 1}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {t('next') || 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          {/* Transaction Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                {t('filters') || 'Filters'}
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTxFilters(!showTxFilters)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {showTxFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
              </Button>
            </div>

            {showTxFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('type') || 'Type'}
                    </label>
                    <select
                      name="type"
                      value={txFilters.type}
                      onChange={handleTxFilterChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('all') || 'All'}</option>
                      <option value="DEPOSIT">DEPOSIT</option>
                      <option value="WITHDRAWAL">WITHDRAWAL</option>
                      <option value="PAYMENT">PAYMENT</option>
                      <option value="REFUND">REFUND</option>
                      <option value="CREDIT">CREDIT</option>
                      <option value="DEBIT">DEBIT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('status') || 'Status'}
                    </label>
                    <select
                      name="status"
                      value={txFilters.status}
                      onChange={handleTxFilterChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('all') || 'All'}</option>
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={applyTxFilters}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Search className="w-4 h-4" />
                    {t('applyFilters') || 'Apply Filters'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={resetTxFilters}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <X className="w-4 h-4" />
                    {t('resetFilters') || 'Reset'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Transactions List */}
          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {t('noTransactionsFound') || 'No transactions found'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('noTransactionsMatchFilters') || 'No transactions match your current filters'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <Card 
                    key={tx.id}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`p-3 rounded-lg ${
                            tx.type === 'DEPOSIT' || tx.type === 'CREDIT' || tx.type === 'REFUND'
                              ? 'bg-green-500/10'
                              : 'bg-red-500/10'
                          }`}>
                            {getTxTypeIcon(tx.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900 dark:text-white">{tx.userName}</p>
                              <Badge variant={getTxStatusColor(tx.status)} className="text-xs">
                                {tx.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {tx.type} • {new Date(tx.createdAt).toLocaleString()}
                            </p>
                            {tx.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{tx.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-xl font-bold ${getTxTypeColor(tx.type)}`}>
                            {tx.type === 'DEPOSIT' || tx.type === 'CREDIT' || tx.type === 'REFUND' ? '+' : '-'}
                            ${tx.amount?.toFixed(2)}
                          </p>
                          {tx.referenceId && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              Ref: {tx.referenceId}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {txPagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => goToTxPage(txPagination.currentPage - 1)}
                    disabled={txPagination.currentPage === 0}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('previous') || 'Previous'}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(txPagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (txPagination.totalPages <= 5) {
                        pageNum = i;
                      } else if (txPagination.currentPage < 3) {
                        pageNum = i;
                      } else if (txPagination.currentPage > txPagination.totalPages - 3) {
                        pageNum = txPagination.totalPages - 5 + i;
                      } else {
                        pageNum = txPagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToTxPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            pageNum === txPagination.currentPage
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => goToTxPage(txPagination.currentPage + 1)}
                    disabled={txPagination.currentPage >= txPagination.totalPages - 1}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {t('next') || 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Wallet Details Dialog */}
      <WalletDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedWalletId(null);
        }}
        walletId={selectedWalletId}
      />
    </div>
  );
};

export default WalletsPage;
