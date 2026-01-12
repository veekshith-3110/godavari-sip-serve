import { useState, useRef } from 'react';
import { Edit2, Plus, X, Upload, Trash2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useMenu, MenuItem, MenuCategory } from '@/context/MenuContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import SkeletonCard from '@/components/SkeletonCard';
import FormField from '@/components/FormField';
import EmptyState from '@/components/EmptyState';
import { menuItemSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

const MenuManager = () => {
  const { menuItems, loading, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem } = useMenu();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const categories: MenuCategory[] = ['hot', 'snacks', 'cold', 'smoke'];

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedItem: Omit<MenuItem, 'id'> & { id?: string }) => {
    if (editingItem) {
      await updateMenuItem({ ...updatedItem, id: editingItem.id } as MenuItem);
    } else {
      await addMenuItem(updatedItem);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteMenuItem(deleteTarget.id);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Menu Manager</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} type="menu-item" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Menu Manager</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Grid */}
      {menuItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-xl overflow-hidden border border-border ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              <div className="h-24 lg:h-32 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="p-3 lg:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm lg:text-base text-foreground truncate">{item.name}</h3>
                    <p className="text-base lg:text-lg font-extrabold text-primary">₹{item.price}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 lg:p-2 rounded-lg bg-muted hover:bg-secondary transition-colors"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id, item.name)}
                      className="p-1.5 lg:p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-border">
                  <span className="text-xs lg:text-sm text-muted-foreground capitalize">{item.category}</span>
                  <Switch
                    checked={item.available}
                    onCheckedChange={() => toggleAvailability(item.id)}
                    className="scale-90 lg:scale-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          type="items"
          title="No Menu Items"
          message="Start by adding your first menu item"
          action={{
            label: 'Add First Item',
            onClick: handleAddNew,
          }}
        />
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Menu Item?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

interface EditItemModalProps {
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'> & { id?: string }) => void;
}

const EditItemModal = ({ item, categories, onClose, onSave }: EditItemModalProps) => {
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'> & { id?: string }>(
    item || {
      name: '',
      price: 0,
      category: 'hot',
      image: '',
      available: true,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Image too large',
          description: 'Please select an image under 2MB',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target?.result as string });
      };
      reader.onerror = () => {
        toast({
          title: 'Failed to load image',
          description: 'Please try another image',
          variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    // Validate with Zod
    const result = menuItemSchema.safeParse({
      name: formData.name.trim(),
      price: formData.price,
      category: formData.category,
      image: formData.image,
      available: formData.available,
    });

    if (!result.success) {
      const validationErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = err.message;
        }
      });
      setErrors(validationErrors);
      return;
    }

    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to save changes',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ ...formData, image: formData.image || '/placeholder.svg' });
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <FormField label="Name" error={errors.name} required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              disabled={isSaving}
              maxLength={50}
              placeholder="Enter item name"
              className={`w-full p-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                errors.name ? 'border-destructive' : 'border-input'
              }`}
            />
          </FormField>

          <FormField label="Price" error={errors.price} required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={formData.price || ''}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 });
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                disabled={isSaving}
                min="1"
                max="10000"
                placeholder="Enter price"
                className={`w-full p-3 pl-8 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                  errors.price ? 'border-destructive' : 'border-input'
                }`}
              />
            </div>
          </FormField>

          <FormField label="Category" error={errors.category} required>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
              disabled={isSaving}
              className="w-full p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Image" hint="Max 2MB, JPEG or PNG recommended">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="w-full p-3 rounded-xl border border-dashed border-input bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {formData.image ? 'Change Photo' : 'Select Photo'}
            </button>
          </FormField>

          {formData.image && (
            <div className="h-24 rounded-xl overflow-hidden">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuManager;
