
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Flame, Droplets, MapPin, Clock, Star, DollarSign } from 'lucide-react';
import { useDualBusinessVisits } from '@/hooks/useDualBusinessVisits';

interface VisitData {
  gas_objective?: string;
  gas_outcome?: string;
  gas_volume_sold?: number;
  gas_revenue?: number;
  uco_status?: string;
  uco_collected_kg?: number;
  uco_price_paid?: number;
  uco_quality_score?: number;
  visit_notes?: string;
  competitor_info?: string;
}

interface DualBusinessVisitExecutionProps {
  restaurant: any;
  visitObjectives: any;
  onSaveVisit: (data: VisitData) => void;
}

export const DualBusinessVisitExecution: React.FC<DualBusinessVisitExecutionProps> = ({
  restaurant,
  visitObjectives,
  onSaveVisit,
}) => {
  const [visitData, setVisitData] = useState<VisitData>({});
  const [currentSection, setCurrentSection] = useState<'gas' | 'uco' | 'notes'>('gas');

  const ucoStatusOptions = [
    { value: 'have_uco', label: 'Have UCO ✅', color: 'bg-green-100 text-green-800' },
    { value: 'no_uco_reuse', label: 'No UCO (Reuse) 🔄', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'no_uco_not_ready', label: 'No UCO (Not Ready) ⏳', color: 'bg-orange-100 text-orange-800' },
    { value: 'shop_closed', label: 'Shop Closed 🚪', color: 'bg-red-100 text-red-800' },
  ];

  const gasOutcomeOptions = [
    { value: 'sale_completed', label: '✅ Sale Completed', color: 'bg-green-100 text-green-800' },
    { value: 'strong_interest', label: '👍 Strong Interest', color: 'bg-blue-100 text-blue-800' },
    { value: 'considering', label: '🤔 Considering', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'not_interested', label: '❌ Not Interested', color: 'bg-red-100 text-red-800' },
    { value: 'competitor_locked', label: '🔒 Competitor Locked', color: 'bg-gray-100 text-gray-800' },
  ];

  const handleSave = () => {
    onSaveVisit(visitData);
  };

  const updateVisitData = (field: keyof VisitData, value: any) => {
    setVisitData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex">
                <Flame className="h-5 w-5 text-orange-500" />
                <Droplets className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3>{restaurant.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{restaurant.township}</span>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline">{restaurant.business_category?.replace('_', ' ')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button
              variant={currentSection === 'gas' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('gas')}
              className="flex items-center space-x-2"
            >
              <Flame className="h-4 w-4" />
              <span>Gas Business</span>
            </Button>
            <Button
              variant={currentSection === 'uco' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('uco')}
              className="flex items-center space-x-2"
            >
              <Droplets className="h-4 w-4" />
              <span>UCO Collection</span>
            </Button>
            <Button
              variant={currentSection === 'notes' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('notes')}
              className="flex items-center space-x-2"
            >
              <span>Notes & Competitors</span>
            </Button>
          </div>

          {currentSection === 'gas' && visitObjectives.gas_objective && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">🔥 Gas Business Activity</h4>
                <p className="text-sm text-orange-600">Objective: {visitObjectives.gas_objective}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  {gasOutcomeOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={visitData.gas_outcome === option.value ? 'default' : 'outline'}
                      onClick={() => updateVisitData('gas_outcome', option.value)}
                      className="justify-start text-left"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {visitData.gas_outcome === 'sale_completed' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cylinders Sold</label>
                    <Input
                      type="number"
                      placeholder="e.g. 2"
                      value={visitData.gas_volume_sold || ''}
                      onChange={(e) => updateVisitData('gas_volume_sold', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Revenue (MMK)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 45000"
                      value={visitData.gas_revenue || ''}
                      onChange={(e) => updateVisitData('gas_revenue', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === 'uco' && visitObjectives.uco_objective && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🛢️ UCO Collection Activity</h4>
                <p className="text-sm text-blue-600">Objective: {visitObjectives.uco_objective}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">UCO Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {ucoStatusOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={visitData.uco_status === option.value ? 'default' : 'outline'}
                      onClick={() => updateVisitData('uco_status', option.value)}
                      className="justify-start text-left"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {visitData.uco_status === 'have_uco' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Collected (Kg)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 15.5"
                        value={visitData.uco_collected_kg || ''}
                        onChange={(e) => updateVisitData('uco_collected_kg', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price per Kg (MMK)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 800"
                        value={visitData.uco_price_paid || ''}
                        onChange={(e) => updateVisitData('uco_price_paid', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality Rating</label>
                    <Select onValueChange={(value) => updateVisitData('uco_quality_score', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate UCO quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Excellent (Clear, Fresh)</SelectItem>
                        <SelectItem value="4">4 - Good (Slight Color)</SelectItem>
                        <SelectItem value="3">3 - Average (Some Debris)</SelectItem>
                        <SelectItem value="2">2 - Poor (Dark, Used)</SelectItem>
                        <SelectItem value="1">1 - Very Poor (Contaminated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Visit Notes</label>
                <Textarea
                  placeholder="General notes about the visit, customer feedback, observations..."
                  value={visitData.visit_notes || ''}
                  onChange={(e) => updateVisitData('visit_notes', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">🕵️ Competitor Intelligence</label>
                <Textarea
                  placeholder="Competitor information (gas suppliers, UCO collectors, pricing, etc.)"
                  value={visitData.competitor_info || ''}
                  onChange={(e) => updateVisitData('competitor_info', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={handleSave}>Complete Visit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
