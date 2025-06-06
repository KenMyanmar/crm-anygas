
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  MapPin, 
  Building, 
  Users, 
  BarChart3, 
  PieChart,
  Calendar,
  FileText
} from 'lucide-react';

const ReportsMainPage = () => {
  const reportCategories = [
    {
      title: "Orders & Sales",
      description: "Revenue analytics, order trends, and sales performance metrics",
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      link: "/reports/orders-sales",
      stats: "Track revenue, order patterns, and sales KPIs",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Visits & Engagement",
      description: "Visit completion rates, customer interactions, and engagement metrics",
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      link: "/reports/visits",
      stats: "Monitor visit efficiency and customer engagement",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Restaurant Growth",
      description: "New restaurant acquisition, onboarding pipeline, and expansion tracking",
      icon: <Building className="h-8 w-8 text-purple-600" />,
      link: "/reports/restaurants",
      stats: "Analyze growth patterns and market expansion",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "User Activity",
      description: "Team productivity, performance tracking, and activity analytics",
      icon: <Users className="h-8 w-8 text-orange-600" />,
      link: "/reports/users",
      stats: "Monitor team performance and productivity",
      color: "bg-orange-50 border-orange-200"
    },
    {
      title: "Executive Dashboard",
      description: "High-level KPIs, business health indicators, and trend analysis",
      icon: <BarChart3 className="h-8 w-8 text-red-600" />,
      link: "/reports/executive",
      stats: "Strategic insights and management overview",
      color: "bg-red-50 border-red-200"
    },
    {
      title: "Custom Reports",
      description: "Build custom analytics and export capabilities",
      icon: <FileText className="h-8 w-8 text-gray-600" />,
      link: "/reports/custom",
      stats: "Create tailored reports for specific needs",
      color: "bg-gray-50 border-gray-200"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Business Analytics & Reports</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive insights into your operations, performance, and growth metrics
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <PieChart className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">2.02M</div>
            <div className="text-sm text-muted-foreground">Total Revenue (Kyats)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">172</div>
            <div className="text-sm text-muted-foreground">Total Visits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Building className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">1,000</div>
            <div className="text-sm text-muted-foreground">Active Restaurants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">9</div>
            <div className="text-sm text-muted-foreground">Orders This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((category, index) => (
          <Card key={index} className={`hover:shadow-lg transition-shadow ${category.color}`}>
            <CardHeader className="space-y-4">
              <div className="flex items-center space-x-3">
                {category.icon}
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{category.stats}</p>
              <Button asChild className="w-full">
                <Link to={category.link}>
                  View {category.title} Report
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Features</CardTitle>
          <CardDescription>
            Professional analytics with powerful insights and export capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 mx-auto text-blue-600" />
              <h3 className="font-semibold">Interactive Charts</h3>
              <p className="text-sm text-muted-foreground">
                Dynamic visualizations with drill-down capabilities
              </p>
            </div>
            <div className="text-center space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-green-600" />
              <h3 className="font-semibold">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">
                Live updates and real-time business metrics
              </p>
            </div>
            <div className="text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-purple-600" />
              <h3 className="font-semibold">Export Options</h3>
              <p className="text-sm text-muted-foreground">
                CSV, PDF, and Excel export for all reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsMainPage;
