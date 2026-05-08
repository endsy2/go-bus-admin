import React, { useState, useEffect } from 'react';
import { Filter, Plus, X, Users, Mail, Phone, Calendar, Eye, Copy, AlertCircle, CheckCircle, XCircle, Power } from 'lucide-react';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Label } from 'shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shared/components/ui/card';
import { Badge } from 'shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { useToast } from 'shared/components/ui/toast';
import EditCustomerDialog from '../../components/EditCustomerDialog/EditCustomerDialog';
import { Pagination } from 'shared/components/feedback/Pagination';
import CustomerDetailPage from '../CustomerDetailPage/CustomerDetailPage';
import CreateCustomerPage from '../CreateCustomerPage/CreateCustomerPage';
import { apiRequest } from 'shared/utils/api';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { canViewCustomers, canEditCustomers, canDeleteCustomers, canCreateCustomers } from 'shared/utils/permissions';

const CustomersPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const canView = canViewCustomers(currentUser);
  const canEdit = canEditCustomers(currentUser);
  const canDelete = canDeleteCustomers(currentUser);
  const canCreate = canCreateCustomers(currentUser);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [filters, setFilters] = useState({
    email: '',
    phone: '',
    username: '',
    isActive: 'all',
    isDeleted: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Real-time filter effect with debouncing
  useEffect(() => {
    const hasFilters =
      filters.email.trim() !== '' ||
      filters.phone.trim() !== '' ||
      filters.username.trim() !== '' ||
      filters.isActive !== 'all' ||
      filters.isDeleted !== 'all';

    if (!hasFilters) return;

    const timeoutId = setTimeout(() => {
      fetchCustomers(filters, 1, pagination.pageSize);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchCustomers = async (filterParams = null, page = 1, size = 15) => {
    try {
      setLoading(true);

      // Use the new specification endpoint for customers
      let url = `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/specification`;
      
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters - pageStart starts at 1
      queryParams.append('pageStart', page);
      queryParams.append('pageSize', size);
      queryParams.append('isEmployee', 'false');
      
      // If filters are provided, add them as query parameters with proper type handling
      if (filterParams) {
        Object.keys(filterParams).forEach(key => {
          const value = filterParams[key];
          if (value && value.toString().trim() !== '' && value !== 'all') {
            // Handle different data types
            if (key === 'userId') {
              // userId should be a number
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue)) {
                queryParams.append(key, numValue.toString());
                console.log('Added userId filter:', numValue);
              }
            } else if (key === 'isActive' || key === 'isDeleted') {
              // Boolean fields
              queryParams.append(key, value);
              console.log(`Added ${key} filter:`, value);
            } else {
              // Other fields are strings
              queryParams.append(key, value.toString().trim());
              console.log(`Added ${key} filter:`, value.toString().trim());
            }
          }
        });
      }
      
      const queryString = queryParams.toString();
      console.log('Final query string:', queryString);
      if (queryString) {
        url = `${url}?${queryString}`;
      }
      console.log('Fetching customers from:', url);

      const response = await apiRequest(url, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        // Handle paginated response structure
        const users = result.data?.content || result.content || result.data || result;
        setCustomers(Array.isArray(users) ? users : []);
        
        // Update pagination info
        const pageData = result.data || result;
        setPagination({
          currentPage: page,
          pageSize: pageData.size || size,
          totalPages: pageData.totalPages || 1,
          totalElements: pageData.totalElements || 0
        });
        
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      email: '',
      phone: '',
      username: '',
      isActive: 'all',
      isDeleted: 'all'
    });
    fetchCustomers(null, 1, pagination.pageSize);
  };

  const handlePageChange = (newPage) => {
    fetchCustomers(filters, newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    fetchCustomers(filters, 1, newSize);
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({ message: `${label} ${t('copiedToClipboard')}`, type: 'success' });
    }).catch(err => {
      console.error('Failed to copy:', err);
      addToast({ message: t('failedToCopy'), type: 'error' });
    });
  };

  const handleToggleStatusClick = (customer) => {
    if (!canDelete) {
      addToast({ message: 'You do not have permission to change customer status', type: 'error' });
      return;
    }
    setCustomerToToggle(customer);
    setShowStatusDialog(true);
  };

  const handleEditClick = (customer) => {
    if (!canEdit) {
      addToast({ message: 'You do not have permission to edit customers', type: 'error' });
      return;
    }
    setCustomerToEdit(customer);
    setShowEditDialog(true);
  };

  const handleViewClick = (customer) => {
    setSelectedCustomerId(customer.id);
    setShowDetailView(true);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setSelectedCustomerId(null);
    // Refresh the customer list when coming back from detail
    fetchCustomers(filters, pagination.currentPage, pagination.pageSize);
  };

  const handleSaveEdit = async (updateData) => {
    if (!customerToEdit) return;

    try {
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/${customerToEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        const updatedCustomer = result.data || result;
        
        // Update customer in list
        setCustomers(customers.map(c => 
          c.id === customerToEdit.id ? { ...c, ...updatedCustomer } : c
        ));
        
        setShowEditDialog(false);
        setCustomerToEdit(null);
        setError('');
        
        addToast({ message: 'Customer updated successfully!', type: 'success' });
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to update customer');
      }
    } catch (err) {
      setError('Network error. Failed to update customer.');
      console.error('Error updating customer:', err);
    }
  };

  const cancelEdit = () => {
    setShowEditDialog(false);
    setCustomerToEdit(null);
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      addToast({ message: 'You do not have permission to create customers', type: 'error' });
      return;
    }
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    addToast({ message: 'Customer created successfully!', type: 'success' });
    // Refresh the customer list
    fetchCustomers(filters, pagination.currentPage, pagination.pageSize);
  };

  const confirmToggleStatus = async () => {
    if (!customerToToggle) return;

    try {
      const newStatus = !customerToToggle.isActive;
      
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/users/${customerToToggle.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        const updatedCustomer = result.data || result;
        
        // Update customer in list
        setCustomers(customers.map(c => 
          c.id === customerToToggle.id ? { ...c, isActive: updatedCustomer.active } : c
        ));
        
        setShowStatusDialog(false);
        setCustomerToToggle(null);
        addToast({ 
          message: `Customer ${newStatus ? 'activated' : 'deactivated'} successfully`, 
          type: 'success' 
        });
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to update customer status');
        setShowStatusDialog(false);
      }
    } catch (err) {
      setError('Network error. Failed to update customer status.');
      console.error('Error updating customer status:', err);
      setShowStatusDialog(false);
    }
  };

  const cancelToggleStatus = () => {
    setShowStatusDialog(false);
    setCustomerToToggle(null);
  };

  if (!canView) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>{t('customerManagement')}</CardTitle>
            <CardDescription>{t('customerManagementDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You do not have permission to view customer information. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{t('customerManagement')}</h1>
            <p className="text-muted-foreground">{t('customerManagementDesc')}</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4" />
            {t('addCustomer')}
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Filter className="h-5 w-5" />
              </div>
              <CardTitle className="text-white">Filter Customers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ))}
              <div className="col-span-full flex gap-3 justify-end pt-5 border-t-2">
              <Button variant="outline" disabled><X className="h-4 w-4" />{t('clearFilters')}</Button>
            </div>
            </div>
            
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 hover:bg-gradient-to-r">
                <TableHead className="font-bold text-xs uppercase">{t('customerId')}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t('name')}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t('email')}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t('phone')}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t('gender')}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t('joinedDate')}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded w-16" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-32" />
                        <div className="h-3 bg-muted animate-pulse rounded w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded w-40" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded w-32" /></TableCell>
                  <TableCell><div className="h-6 bg-muted animate-pulse rounded-full w-20" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded w-28" /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <div className="w-9 h-9 bg-muted animate-pulse rounded-lg" />
                      <div className="w-9 h-9 bg-muted animate-pulse rounded-lg" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  // Show detail view
  if (showDetailView) {
    return (
      <CustomerDetailPage
        customerId={selectedCustomerId}
        onBack={handleBackFromDetail}
      />
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <CreateCustomerPage
        onCancel={handleCancelCreate}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  // Show customer list
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {t('customerManagement')}
          </h1>
          <p className="text-muted-foreground">{t('customerManagementDesc')}</p>
        </div>
        <Button onClick={handleCreateClick} disabled={!canCreate}>
          <Plus className="h-4 w-4" />
          {t('addCustomer')}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-l-4 border-destructive">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <span className="font-medium text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Filters Card */}
      <Card className="mb-8">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Filter className="h-5 w-5" />
            </div>
            <CardTitle className="text-white">Filter Customers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Users className="h-3.5 w-3.5 text-primary" />
                {t('username')}
              </Label>
              <Input
                name="username"
                value={filters.username}
                onChange={handleFilterChange}
                placeholder={t('username')}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {t('email')}
              </Label>
              <Input
                type="email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                placeholder={t('email')}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {t('phone')}
              </Label>
              <Input
                type="tel"
                name="phone"
                value={filters.phone}
                onChange={handleFilterChange}
                placeholder={t('phone')}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                Is Active
              </Label>
              <Select value={filters.isActive} onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <XCircle className="h-3.5 w-3.5 text-primary" />
                Is Deleted
              </Label>
              <Select value={filters.isDeleted} onValueChange={(value) => setFilters(prev => ({ ...prev, isDeleted: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="false">Not Deleted</SelectItem>
                  <SelectItem value="true">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleClearFilters} className="whitespace-nowrap">
              <X className="h-4 w-4 mr-2" />
              {t('clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 hover:bg-gradient-to-r">
              <TableHead className="font-bold text-xs uppercase">{t('customerId')}</TableHead>
              <TableHead className="font-bold text-xs uppercase">{t('name')}</TableHead>
              <TableHead className="font-bold text-xs uppercase">{t('email')}</TableHead>
              <TableHead className="font-bold text-xs uppercase">{t('phone')}</TableHead>
              <TableHead className="font-bold text-xs uppercase">{t('gender')}</TableHead>
              <TableHead className="font-bold text-xs uppercase">Is Active</TableHead>
              <TableHead className="font-bold text-xs uppercase">Is Deleted</TableHead>
              <TableHead className="font-bold text-xs uppercase">{t('joinedDate')}</TableHead>
              <TableHead className="font-bold text-xs uppercase">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-muted p-6 rounded-full">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold">{t('noCustomersFound')}</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new customer</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map(customer => (
                <TableRow key={customer.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary text-sm">#{customer.id}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleCopyToClipboard(customer.id.toString(), 'Customer ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-lg ring-2 ring-blue-100 dark:ring-blue-900">
                          {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{customer.fullName}</div>
                        <div className="text-xs text-muted-foreground font-medium">@{customer.userName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 group">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{customer.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 ml-auto"
                        onClick={() => handleCopyToClipboard(customer.email, 'Email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 group">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{customer.phone}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 ml-auto"
                        onClick={() => handleCopyToClipboard(customer.phone, 'Phone')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <Users className="h-3 w-3 mr-1" />
                      {customer.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.isActive ? (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.isDeleted ? (
                      <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <XCircle className="h-3 w-3 mr-1" />
                        Deleted
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium">{formatDate(customer.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        onClick={() => handleViewClick(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          size="icon"
                          variant={customer.isActive ? "destructive" : "default"}
                          className={customer.isActive 
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" 
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          }
                          onClick={() => handleToggleStatusClick(customer)}
                          title={customer.isActive ? "Deactivate Customer" : "Activate Customer"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {customers.length > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalElements={pagination.totalElements}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </Card>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {customerToToggle?.isActive ? 'Deactivate Customer' : 'Activate Customer'}
            </DialogTitle>
            <DialogDescription>
              {customerToToggle?.isActive 
                ? `Are you sure you want to deactivate ${customerToToggle?.fullName}? They will not be able to access their account.`
                : `Are you sure you want to activate ${customerToToggle?.fullName}? They will be able to access their account.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelToggleStatus}>
              {t('cancel')}
            </Button>
            <Button 
              variant={customerToToggle?.isActive ? "destructive" : "default"}
              onClick={confirmToggleStatus}
              className={customerToToggle?.isActive 
                ? "" 
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }
            >
              {customerToToggle?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCustomerDialog
        isOpen={showEditDialog}
        customer={customerToEdit}
        onSave={handleSaveEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
};

export default CustomersPage;
