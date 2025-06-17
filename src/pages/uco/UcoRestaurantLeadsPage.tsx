
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Database, Route, TrendingUp, Building2 } from 'lucide-react';
import UcoRestaurantDiscovery from '@/components/uco/UcoRestaurantDiscovery';
import UcoLeadsDashboard from '@/components/uco/UcoLeadsDashboard';

const UcoRestaurantLeadsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            UCO Restaurant Leads Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover, analyze, and manage restaurant leads for UCO collection optimization
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Smart Discovery System
        </Badge>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Prospects</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Collection Routes</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Estimated Volume</p>
                <p className="text-2xl font-bold">0 L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Active Suppliers</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="discovery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discovery" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Restaurant Discovery</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Leads Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-6">
          <UcoRestaurantDiscovery />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <UcoLeadsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UcoRestaurantLeadsPage;
