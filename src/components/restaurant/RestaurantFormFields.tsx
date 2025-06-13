
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/useLeads';
import { hasAdminAccess } from '@/utils/roleUtils';

interface RestaurantFormData {
  name: string;
  address: string;
  township: string;
  phone: string;
  contact_person: string;
  remarks: string;
  salesperson_id: string;
}

interface RestaurantFormFieldsProps {
  formData: RestaurantFormData;
  setFormData: (data: RestaurantFormData) => void;
  profile: any;
}

export const RestaurantFormFields = ({ formData, setFormData, profile }: RestaurantFormFieldsProps) => {
  const { users, isLoading: usersLoading } = useUsers();
  const isAdmin = hasAdminAccess(profile?.role);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter restaurant name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="township">Township *</Label>
              <Input
                id="township"
                value={formData.township}
                onChange={(e) => setFormData({ ...formData, township: e.target.value })}
                placeholder="Enter township"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Enter contact person name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesperson">
              Assign Salesperson *
              {!isAdmin && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Automatically assigned to you)
                </span>
              )}
            </Label>
            {usersLoading ? (
              <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                Loading users...
              </div>
            ) : isAdmin ? (
              <Select
                value={formData.salesperson_id}
                onValueChange={(value) => setFormData({ ...formData, salesperson_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={profile?.full_name || 'Current User'}
                disabled
                className="bg-muted"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Enter any additional notes or remarks"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
