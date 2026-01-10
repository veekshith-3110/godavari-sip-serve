import { useState, useRef } from 'react';
import { Edit2, Plus, X, Upload, Trash2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useMenu, MenuItem, MenuCategory } from '@/context/MenuContext';

const MenuManager = () => {
  const { menuItems, loading, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem } = useMenu();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteMenuItem(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                  >
                    <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 lg:p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
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

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items yet. Add your first item!</p>
        </div>
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
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (formData.name && formData.price !== undefined && formData.price > 0 && formData.category) {
      setIsSaving(true);
      await onSave({ ...formData, image: formData.image || '/placeholder.svg' });
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
              className="w-full p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter price"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
              className="w-full p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Image
            </label>
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
              className="w-full p-3 rounded-xl border border-dashed border-input bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {formData.image ? 'Change Photo' : 'Select Photo'}
            </button>
          </div>

          {formData.image && (
            <div className="h-24 rounded-xl overflow-hidden">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
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
