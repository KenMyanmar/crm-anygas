
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PerformanceMetrics {
  totalSalespeople: number;
  avgLoginFrequency: number;
  totalVisitPlans: number;
  totalVisitsCompleted: number;
  totalLeadsGenerated: number;
  totalOrdersCreated: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface SalespersonProfile {
  id: string;
  name: string;
  email: string;
  loginCount: number;
  lastLogin: string;
  visitPlansCreated: number;
  visitsCompleted: number;
  leadsGenerated: number;
  ordersCreated: number;
  revenue: number;
  conversionRate: number;
  avgVisitsPerPlan: number;
}

export interface ActivityPattern {
  date: string;
  logins: number;
  visitPlans: number;
  visitsCompleted: number;
  leadsCreated: number;
  ordersCreated: number;
}

export interface VisitEfficiency {
  salespersonId: string;
  salespersonName: string;
  plannedVisits: number;
  completedVisits: number;
  completionRate: number;
  avgVisitDuration: number;
  leadsFromVisits: number;
  ordersFromVisits: number;
}

export interface GoalTracking {
  salespersonId: string;
  salespersonName: string;
  monthlyLoginGoal: number;
  actualLogins: number;
  monthlyVisitGoal: number;
  actualVisits: number;
  monthlyLeadGoal: number;
  actualLeads: number;
  monthlyRevenueGoal: number;
  actualRevenue: number;
  overallProgress: number;
}

export const usePerformanceAnalytics = (timeRange: string = '30') => {
  const [data, setData] = useState<{
    metrics: PerformanceMetrics;
    salespersonProfiles: SalespersonProfile[];
    activityPatterns: ActivityPattern[];
    visitEfficiency: VisitEfficiency[];
    goalTracking: GoalTracking[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));
        
        // Fetch users data
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .eq('is_active', true);

        // Fetch activity logs for login tracking
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('*')
          .gte('created_at', startDate.toISOString());

        // Fetch visit plans
        const { data: visitPlans } = await supabase
          .from('visit_plans')
          .select('*')
          .gte('created_at', startDate.toISOString());

        // Fetch visit tasks
        const { data: visitTasks } = await supabase
          .from('visit_tasks')
          .select('*')
          .gte('created_at', startDate.toISOString());

        // Fetch leads
        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .gte('created_at', startDate.toISOString());

        // Fetch orders with total amounts
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate.toISOString());

        if (!users || !activityLogs || !visitPlans || !visitTasks || !leads || !orders) {
          throw new Error('Failed to fetch performance data');
        }

        // Process data into analytics
        const salespersonProfiles: SalespersonProfile[] = users.map(user => {
          const userActivityLogs = activityLogs.filter(log => log.user_id === user.id);
          const userVisitPlans = visitPlans.filter(plan => plan.created_by === user.id);
          const userVisitTasks = visitTasks.filter(task => task.salesperson_uid === user.id);
          const userLeads = leads.filter(lead => lead.assigned_to_user_id === user.id);
          const userOrders = orders.filter(order => order.created_by_user_id === user.id);
          
          const loginCount = userActivityLogs.filter(log => log.activity_type === 'LOGIN').length;
          const lastLogin = userActivityLogs.length > 0 ? userActivityLogs[userActivityLogs.length - 1].created_at : '';
          const visitPlansCreated = userVisitPlans.length;
          const visitsCompleted = userVisitTasks.filter(task => task.status === 'COMPLETED').length;
          const leadsGenerated = userLeads.length;
          const ordersCreated = userOrders.length;
          const revenue = userOrders.reduce((sum, order) => sum + (Number(order.total_amount_kyats) || 0), 0);
          const conversionRate = leadsGenerated > 0 ? (ordersCreated / leadsGenerated) * 100 : 0;
          const avgVisitsPerPlan = visitPlansCreated > 0 ? userVisitTasks.length / visitPlansCreated : 0;

          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            loginCount,
            lastLogin,
            visitPlansCreated,
            visitsCompleted,
            leadsGenerated,
            ordersCreated,
            revenue,
            conversionRate,
            avgVisitsPerPlan
          };
        });

        // Calculate overall metrics
        const metrics: PerformanceMetrics = {
          totalSalespeople: users.length,
          avgLoginFrequency: salespersonProfiles.reduce((sum, p) => sum + p.loginCount, 0) / users.length,
          totalVisitPlans: visitPlans.length,
          totalVisitsCompleted: visitTasks.filter(task => task.status === 'COMPLETED').length,
          totalLeadsGenerated: leads.length,
          totalOrdersCreated: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + (Number(order.total_amount_kyats) || 0), 0),
          conversionRate: leads.length > 0 ? (orders.length / leads.length) * 100 : 0
        };

        // Generate activity patterns for time series
        const activityPatterns: ActivityPattern[] = [];
        for (let i = parseInt(timeRange); i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayActivityLogs = activityLogs.filter(log => 
            log.created_at.startsWith(dateStr)
          );
          const dayVisitPlans = visitPlans.filter(plan => 
            plan.created_at.startsWith(dateStr)
          );
          const dayVisitTasks = visitTasks.filter(task => 
            task.created_at.startsWith(dateStr) && task.status === 'COMPLETED'
          );
          const dayLeads = leads.filter(lead => 
            lead.created_at.startsWith(dateStr)
          );
          const dayOrders = orders.filter(order => 
            order.created_at.startsWith(dateStr)
          );

          activityPatterns.push({
            date: dateStr,
            logins: dayActivityLogs.filter(log => log.activity_type === 'LOGIN').length,
            visitPlans: dayVisitPlans.length,
            visitsCompleted: dayVisitTasks.length,
            leadsCreated: dayLeads.length,
            ordersCreated: dayOrders.length
          });
        }

        // Calculate visit efficiency
        const visitEfficiency: VisitEfficiency[] = users.map(user => {
          const userVisitTasks = visitTasks.filter(task => task.salesperson_uid === user.id);
          const plannedVisits = userVisitTasks.length;
          const completedVisits = userVisitTasks.filter(task => task.status === 'COMPLETED').length;
          const completionRate = plannedVisits > 0 ? (completedVisits / plannedVisits) * 100 : 0;
          const avgVisitDuration = userVisitTasks.reduce((sum, task) => sum + (task.estimated_duration_minutes || 60), 0) / (userVisitTasks.length || 1);
          const userLeads = leads.filter(lead => lead.assigned_to_user_id === user.id);
          const userOrders = orders.filter(order => order.created_by_user_id === user.id);

          return {
            salespersonId: user.id,
            salespersonName: user.full_name,
            plannedVisits,
            completedVisits,
            completionRate,
            avgVisitDuration,
            leadsFromVisits: userLeads.length,
            ordersFromVisits: userOrders.length
          };
        });

        // Mock goal tracking (in a real implementation, goals would be stored in the database)
        const goalTracking: GoalTracking[] = users.map(user => {
          const profile = salespersonProfiles.find(p => p.id === user.id)!;
          const monthlyLoginGoal = 50;
          const monthlyVisitGoal = 20;
          const monthlyLeadGoal = 15;
          const monthlyRevenueGoal = 500000;

          const loginProgress = (profile.loginCount / monthlyLoginGoal) * 100;
          const visitProgress = (profile.visitsCompleted / monthlyVisitGoal) * 100;
          const leadProgress = (profile.leadsGenerated / monthlyLeadGoal) * 100;
          const revenueProgress = (profile.revenue / monthlyRevenueGoal) * 100;
          const overallProgress = (loginProgress + visitProgress + leadProgress + revenueProgress) / 4;

          return {
            salespersonId: user.id,
            salespersonName: user.full_name,
            monthlyLoginGoal,
            actualLogins: profile.loginCount,
            monthlyVisitGoal,
            actualVisits: profile.visitsCompleted,
            monthlyLeadGoal,
            actualLeads: profile.leadsGenerated,
            monthlyRevenueGoal,
            actualRevenue: profile.revenue,
            overallProgress
          };
        });

        setData({
          metrics,
          salespersonProfiles,
          activityPatterns,
          visitEfficiency,
          goalTracking
        });

      } catch (error) {
        console.error('Error fetching performance data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [timeRange]);

  return { data, loading };
};
