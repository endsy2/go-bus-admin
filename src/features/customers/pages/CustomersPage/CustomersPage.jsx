import React, { useState, useEffect } from 'react';
import { Plus, X, Users, Mail, Phone, Calendar, Eye, Copy, AlertCircle, CheckCircle, XCircle, Power } from 'lucide-react';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Label } from 'shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shared/components/ui/card';
import { Badge } from 'shared/components/common/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { useToast } from 'shared/components/ui/toast';
import EditCustomerDialog from '../../components/EditCustomerDialog/EditCustomerDialog';
import { Pagination } from 'shared/components/feedback/Pagination';
import CustomerDetailPage from '../CustomerDetailPage/CustomerDetailPage';
import CreateCustomerPage from '../CreateCustomerPage/CreateCustomerPage';
import userService from 'features/team/services/userService';
import adminService from 'features/admin/services/adminService';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { canViewCustomers, canEditCustomers, canDeleteCustomers, canCreateCustomers } from 'shared/utils/permissions';
import useAuth from 'shared/hooks/useAuth';

const CustomersPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();
  const currentUser = useAuth();

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

      const params = { pageStart: page, pageSize: size, isEmployee: false };

      if (filterParams) {
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value && value.toString().trim() !== '' && value !== 'all') {
            if (key === 'userId') {
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue)) params[key] = numValue;
            } else {
              params[key] = value.toString().trim();
            }
          }
        });
      }

      const result = await userService.getBySpecification(params);
      const pageData = result.data || {};
      setCustomers(pageData.content || []);
      setPagination({
        currentPage: page,
        pageSize: pageData.size || size,
        totalPages: pageData.totalPages || 1,
        totalElements: pageData.totalElements || 0,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please check your connection.');
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
    }).catch(() => {
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
      const result = await userService.updateUser(customerToEdit.id, updateData);
      const updatedCustomer = result.data || result;
      setCustomers(customers.map(c =>
        c.id === customerToEdit.id ? { ...c, ...updatedCustomer } : c
      ));
      setShowEditDialog(false);
      setCustomerToEdit(null);
      setError('');
      addToast({ message: 'Customer updated successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer');
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
      const result = await adminService.users.setStatus(customerToToggle.id, { active: newStatus });
      const updatedCustomer = result.data || result;
      setCustomers(customers.map(c =>
        c.id === customerToToggle.id ? { ...c, isActive: updatedCustomer.active } : c
      ));
      setShowStatusDialog(false);
      setCustomerToToggle(null);
      addToast({
        message: `Customer ${newStatus ? 'activated' : 'deactivated'} successfully`,
        type: 'success',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer status');
      setShowStatusDialog(false);
    }
  };

  const cancelToggleStatus = () => {
    setShowStatusDialog(false);
    setCustomerToToggle(null);
  };

  if (!canView) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background min-h-screen">
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
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background min-h-screen">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">{t('customerManagement')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('customerManagementDesc')}</p>
          </div>
          <Button disabled className="w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4 mr-2" />
            {t('addCustomer')}
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Filter Customers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
              <TableRow>
                <TableHead>{t('customerId')}</TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('gender')}</TableHead>
                <TableHead>{t('joinedDate')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
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
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            {t('customerManagement')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('customerManagementDesc')}</p>
        </div>
        <Button onClick={handleCreateClick} disabled={!canCreate} className="w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4 mr-2" />
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
        <CardHeader>
          <CardTitle className="text-base">Filter Customers</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
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
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customerId')}</TableHead>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('phone')}</TableHead>
              <TableHead>{t('gender')}</TableHead>
              <TableHead>Is Active</TableHead>
              <TableHead>Is Deleted</TableHead>
              <TableHead>{t('joinedDate')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
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
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
                        {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : '?'}
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
                    <Badge variant="secondary">{customer.gender}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.isActive ? 'success' : 'default'}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.isDeleted ? (
                      <Badge variant="danger">Deleted</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">–</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium">{formatDate(customer.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewClick(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${customer.isActive
                            ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                            : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => handleToggleStatusClick(customer)}
                          title={customer.isActive ? t('deactivateCustomer') : t('activateCustomer')}
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
        
        </div>
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
              {customerToToggle?.isActive ? t('deactivateCustomer') : t('activateCustomer')}
            </DialogTitle>
            <DialogDescription>
              {customerToToggle?.isActive 
                ? t('confirmDeactivateCustomer').replace('{name}', customerToToggle?.fullName || 'this customer')
                : t('confirmActivateCustomer').replace('{name}', customerToToggle?.fullName || 'this customer')
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
            >
              {customerToToggle?.isActive ? t('deactivate') : t('activate')}
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
