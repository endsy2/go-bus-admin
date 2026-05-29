import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useWallets } from '../../hooks/useWallets';
import { useTransactions } from '../../hooks/useTransactions';
import { Card, CardContent } from 'shared/components/ui/card';
import { Badge } from 'shared/components/common/Badge';
import { Button } from 'shared/components/common/Button';
import { Input } from 'shared/components/common/Input';
import { Label } from 'shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { DatePicker } from 'shared/components/ui/date-picker';
import { Skeleton } from 'shared/components/ui/skeleton';
import { Pagination } from 'shared/components/feedback/Pagination';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import WalletDetailsDialog from '../../components/WalletDetailsDialog/WalletDetailsDialog';
import CreateWalletDialog from '../../components/CreateWalletDialog/CreateWalletDialog';
import {
  Wallet,
  User,
  DollarSign,
  TrendingUp,
  Filter,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Copy,
  Check
} from 'lucide-react';

// Trim string filter values (non-strings pass through). Empty values are kept
// on purpose so they overwrite — and thereby clear — any previously-applied
// value when merged in the hook; the service layer drops empties before
// building the query string.
const trimFilters = (filters) => {
  const out = {};
  Object.keys(filters).forEach(key => {
    out[key] = typeof filters[key] === 'string' ? filters[key].trim() : filters[key];
  });
  return out;
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy'}
      className="h-6 w-6 text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
};

const WalletsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [activeTab, setActiveTab] = useState('wallets');
  const [showWalletFilters, setShowWalletFilters] = useState(false);
  const [showTxFilters, setShowTxFilters] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [walletFilters, setWalletFilters] = useState({
    name: '',
    status: '',
    minBalance: '',
    maxBalance: '',
  });
  
  const [txFilters, setTxFilters] = useState({
    type: '',
    status: '',
    referenceId: '',
    fromDate: '',
    toDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const {
    wallets, loading: walletsLoading, pagination: walletPagination,
    updateFilters: updateWalletFilters, goToPage: goToWalletPage, changePageSize: changeWalletPageSize,
    refetch: refetchWallets,
  } = useWallets();
  const {
    transactions, loading: txLoading, pagination: txPagination,
    updateFilters: updateTxFilters, goToPage: goToTxPage, changePageSize: changeTxPageSize,
  } = useTransactions();

  // Real-time search: all wallet filters apply automatically (debounced 400ms
  // after the last change) so the list updates as you type / pick — no
  // "Apply Filters" button needed. We send every field (incl. empty ones) so
  // clearing a field actually removes it from the applied filters.
  const skipFirstWalletSync = useRef(true);
  useEffect(() => {
    if (skipFirstWalletSync.current) {
      skipFirstWalletSync.current = false;
      return;
    }
    const handle = setTimeout(() => updateWalletFilters(trimFilters(walletFilters)), 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletFilters]);

  // Real-time transaction filters apply automatically (debounced) too.
  const skipFirstTxSync = useRef(true);
  useEffect(() => {
    if (skipFirstTxSync.current) {
      skipFirstTxSync.current = false;
      return;
    }
    const handle = setTimeout(() => updateTxFilters(trimFilters(txFilters)), 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txFilters]);

  const handleWalletFilterChange = (e) => {
    const { name, value } = e.target;
    setWalletFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTxFilterChange = (e) => {
    const { name, value } = e.target;
    setTxFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetWalletFilters = () => {
    const empty = { name: '', status: '', minBalance: '', maxBalance: '' };
    setWalletFilters(empty);
    // Skip the debounced effect's duplicate run and fetch the unfiltered list now.
    skipFirstWalletSync.current = true;
    updateWalletFilters(empty);
  };

  const resetTxFilters = () => {
    const empty = { type: '', status: '', referenceId: '', fromDate: '', toDate: '', minAmount: '', maxAmount: '' };
    setTxFilters(empty);
    // Skip the debounced effect's duplicate run and fetch the unfiltered list now.
    skipFirstTxSync.current = true;
    updateTxFilters(empty);
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
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            {t('walletManagement') || 'Wallet Management'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t('manageUserWalletsTransactions') || 'Manage user wallets and transactions'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Wallet className="w-4 h-4" />
          {t('createWallet') || 'Create Wallet'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <Button
          variant={activeTab === 'wallets' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('wallets')}
        >
          {t('wallets') || 'Wallets'}
        </Button>
        <Button
          variant={activeTab === 'transactions' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('transactions')}
        >
          {t('transactions') || 'Transactions'}
        </Button>
      </div>

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <>
          {/* Wallet Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-3 sm:mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                {t('filters') || 'Filters'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWalletFilters(!showWalletFilters)}
              >
                {showWalletFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
              </Button>
            </div>

            {showWalletFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Input
                    label={t('name') || 'Name'}
                    name="name"
                    value={walletFilters.name}
                    onChange={handleWalletFilterChange}
                    placeholder={t('searchByName') || 'Search by name...'}
                  />

                  <div className="space-y-2">
                    <Label>{t('status') || 'Status'}</Label>
                    <Select
                      value={walletFilters.status || '__all__'}
                      onValueChange={(value) => setWalletFilters(prev => ({ ...prev, status: value === '__all__' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('all') || 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">{t('all') || 'All'}</SelectItem>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                        <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                        <SelectItem value="CLOSED">CLOSED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Input
                    label={t('minBalance') || 'Min Balance'}
                    name="minBalance"
                    type="number"
                    value={walletFilters.minBalance}
                    onChange={handleWalletFilterChange}
                    placeholder="0.00"
                  />

                  <Input
                    label={t('maxBalance') || 'Max Balance'}
                    name="maxBalance"
                    type="number"
                    value={walletFilters.maxBalance}
                    onChange={handleWalletFilterChange}
                    placeholder="10000.00"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={resetWalletFilters}
                    className="flex items-center gap-2"
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
                          {t('user') || 'User'}
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
                              <div className="bg-blue-500/10 p-2 rounded-lg flex-shrink-0">
                                <Wallet className="w-4 h-4 text-blue-500" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[160px]" title={wallet.id}>
                                {wallet.id}
                              </span>
                              <CopyButton text={wallet.id} />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-purple-500/10 p-2 rounded-lg flex-shrink-0">
                                <User className="w-4 h-4 text-purple-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[140px]" title={wallet.userName || wallet.fullName}>
                                  {wallet.userName || wallet.fullName || `#${wallet.userId}`}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">ID: {wallet.userId}</p>
                              </div>
                              <CopyButton text={wallet.userName || wallet.fullName || String(wallet.userId)} />
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
                                variant="ghost"
                                size="icon"
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
              {wallets.length > 0 && (
                <Pagination
                  currentPage={walletPagination.currentPage}
                  totalPages={walletPagination.totalPages}
                  pageSize={walletPagination.size}
                  totalElements={walletPagination.totalElements}
                  onPageChange={goToWalletPage}
                  onPageSizeChange={changeWalletPageSize}
                />
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
            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-3 sm:mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                {t('filters') || 'Filters'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTxFilters(!showTxFilters)}
              >
                {showTxFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
              </Button>
            </div>

            {showTxFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>{t('type') || 'Type'}</Label>
                    <Select
                      value={txFilters.type || '__all__'}
                      onValueChange={(value) => setTxFilters(prev => ({ ...prev, type: value === '__all__' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('all') || 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">{t('all') || 'All'}</SelectItem>
                        <SelectItem value="DEPOSIT">DEPOSIT</SelectItem>
                        <SelectItem value="WITHDRAWAL">WITHDRAWAL</SelectItem>
                        <SelectItem value="PAYMENT">PAYMENT</SelectItem>
                        <SelectItem value="REFUND">REFUND</SelectItem>
                        <SelectItem value="CREDIT">CREDIT</SelectItem>
                        <SelectItem value="DEBIT">DEBIT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('status') || 'Status'}</Label>
                    <Select
                      value={txFilters.status || '__all__'}
                      onValueChange={(value) => setTxFilters(prev => ({ ...prev, status: value === '__all__' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('all') || 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">{t('all') || 'All'}</SelectItem>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                        <SelectItem value="FAILED">FAILED</SelectItem>
                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Input
                    label={t('referenceId') || 'Reference ID'}
                    name="referenceId"
                    value={txFilters.referenceId}
                    onChange={handleTxFilterChange}
                    placeholder={t('searchByReference') || 'Search by reference...'}
                  />

                  <div className="space-y-2">
                    <Label>{t('fromDate') || 'From Date'}</Label>
                    <DatePicker
                      value={txFilters.fromDate}
                      onChange={(value) => setTxFilters(prev => ({ ...prev, fromDate: value }))}
                      placeholder={t('fromDate') || 'From Date'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('toDate') || 'To Date'}</Label>
                    <DatePicker
                      value={txFilters.toDate}
                      onChange={(value) => setTxFilters(prev => ({ ...prev, toDate: value }))}
                      placeholder={t('toDate') || 'To Date'}
                    />
                  </div>

                  <Input
                    label={t('minAmount') || 'Min Amount'}
                    name="minAmount"
                    type="number"
                    value={txFilters.minAmount}
                    onChange={handleTxFilterChange}
                    placeholder="0.00"
                  />

                  <Input
                    label={t('maxAmount') || 'Max Amount'}
                    name="maxAmount"
                    type="number"
                    value={txFilters.maxAmount}
                    onChange={handleTxFilterChange}
                    placeholder="10000.00"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={resetTxFilters}
                    className="flex items-center gap-2"
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
              {transactions.length > 0 && (
                <Pagination
                  currentPage={txPagination.currentPage}
                  totalPages={txPagination.totalPages}
                  pageSize={txPagination.size}
                  totalElements={txPagination.totalElements}
                  onPageChange={goToTxPage}
                  onPageSizeChange={changeTxPageSize}
                />
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

      {/* Create Wallet Dialog */}
      <CreateWalletDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => refetchWallets()}
      />
    </div>
  );
};

export default WalletsPage;
