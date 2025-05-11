
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cylinder_size_kg: 0,
    brand: '',
    default_price_kyats: 0,
    is_active: true,
    notes: ''
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('is_active', { ascending: false })
        .order('name');

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: error?.message || "Could not load product data",
        variant: "destructive",
      });

      // Mock products if we can't load real ones
      setProducts([{
        id: '1',
        name: 'Easy Gas 50kg Yellow Cylinder',
        cylinder_size_kg: 50,
        brand: 'Easy Gas',
        default_price_kyats: 150000,
        is_active: true,
        notes: 'Exclusive Brighter Energy product',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        cylinder_size_kg: product.cylinder_size_kg,
        brand: product.brand,
        default_price_kyats: product.default_price_kyats,
        is_active: product.is_active,
        notes: product.notes || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        cylinder_size_kg: 50, // Default value
        brand: 'Easy Gas', // Default brand 
        default_price_kyats: 0,
        is_active: true,
        notes: ''
      });
    }
    
    setDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.brand) {
        toast({
          title: "Validation Error",
          description: "Name and brand are required fields",
          variant: "destructive",
        });
        return;
      }

      if (formData.cylinder_size_kg <= 0) {
        toast({
          title: "Validation Error",
          description: "Cylinder size must be greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            cylinder_size_kg: formData.cylinder_size_kg,
            brand: formData.brand,
            default_price_kyats: formData.default_price_kyats,
            is_active: formData.is_active,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        // Update local state
        setProducts(products.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                name: formData.name,
                cylinder_size_kg: formData.cylinder_size_kg,
                brand: formData.brand,
                default_price_kyats: formData.default_price_kyats,
                is_active: formData.is_active,
                notes: formData.notes,
                updated_at: new Date().toISOString()
              } 
            : p
        ));

        toast({
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            cylinder_size_kg: formData.cylinder_size_kg,
            brand: formData.brand,
            default_price_kyats: formData.default_price_kyats,
            is_active: formData.is_active,
            notes: formData.notes
          })
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setProducts([...products, data[0]]);
        }

        toast({
          description: "Product created successfully",
        });
      }

      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this page. This area is restricted to administrators.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>Add New Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Update the product information below.' 
                    : 'Enter the details for the new product.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cylinder_size_kg">Cylinder Size (kg)</Label>
                    <Input
                      id="cylinder_size_kg"
                      name="cylinder_size_kg"
                      type="number"
                      value={formData.cylinder_size_kg}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_price_kyats">Default Price (kyats)</Label>
                    <Input
                      id="default_price_kyats"
                      name="default_price_kyats"
                      type="number"
                      value={formData.default_price_kyats}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="is_active">Active Product</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage the products available for orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No products found. Add your first product using the button above.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-xs">
                        <th className="pb-2 font-medium">Product Name</th>
                        <th className="pb-2 font-medium">Size (kg)</th>
                        <th className="pb-2 font-medium">Brand</th>
                        <th className="pb-2 font-medium">Price (kyats)</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map((product) => (
                        <tr key={product.id} className="text-sm">
                          <td className="py-2">{product.name}</td>
                          <td className="py-2">{product.cylinder_size_kg}</td>
                          <td className="py-2">{product.brand}</td>
                          <td className="py-2">
                            {product.default_price_kyats.toLocaleString()}
                          </td>
                          <td className="py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(product)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
