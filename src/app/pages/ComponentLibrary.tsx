import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { ChartContainer } from '../components/ChartContainer';
import { DataTable } from '../components/DataTable';
import { DashboardHeader } from '../components/DashboardHeader';
import { FilterBar } from '../components/FilterBar';
import { 
  TrendingUp, DollarSign, Target, AlertTriangle,
  Download, RefreshCw 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function ComponentLibrary() {
  // Sample data for demonstrations
  const sampleChartData = [
    { month: 'Jan', value: 400, target: 450 },
    { month: 'Feb', value: 300, target: 380 },
    { month: 'Mar', value: 500, target: 420 },
    { month: 'Apr', value: 450, target: 460 },
  ];

  const samplePieData = [
    { name: 'Category A', value: 400, color: '#3b82f6' },
    { name: 'Category B', value: 300, color: '#10b981' },
    { name: 'Category C', value: 200, color: '#f59e0b' },
  ];

  const sampleTableData = [
    { id: 1, name: 'Project Alpha', status: 'on-track', budget: 500000, progress: 65 },
    { id: 2, name: 'Project Beta', status: 'at-risk', budget: 750000, progress: 48 },
    { id: 3, name: 'Project Gamma', status: 'critical', budget: 1200000, progress: 32 },
  ];

  const tableColumns = [
    { key: 'name', header: 'Project Name', align: 'left' as const },
    { 
      key: 'status', 
      header: 'Status', 
      align: 'left' as const,
      render: (item: any) => <StatusBadge status={item.status} size="sm" />
    },
    { 
      key: 'budget', 
      header: 'Budget', 
      align: 'right' as const,
      render: (item: any) => `$${(item.budget / 1000).toFixed(0)}K`
    },
    { 
      key: 'progress', 
      header: 'Progress', 
      align: 'right' as const,
      render: (item: any) => `${item.progress}%`
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Component Library" 
        subtitle="Reusable design system for PMO Dashboard"
      />
      
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        {/* Color System */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Color System</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Status Colors (RAG)</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="h-20 bg-green-500 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Green - Healthy</p>
                <p className="text-xs text-gray-600">#10b981</p>
              </div>
              <div>
                <div className="h-20 bg-amber-500 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Amber - Attention</p>
                <p className="text-xs text-gray-600">#f59e0b</p>
              </div>
              <div>
                <div className="h-20 bg-red-500 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Red - Critical</p>
                <p className="text-xs text-gray-600">#ef4444</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4 mt-8">Neutral Colors</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="h-20 bg-gray-900 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Gray 900</p>
                <p className="text-xs text-gray-600">#111827</p>
              </div>
              <div>
                <div className="h-20 bg-gray-600 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Gray 600</p>
                <p className="text-xs text-gray-600">#4b5563</p>
              </div>
              <div>
                <div className="h-20 bg-gray-200 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Gray 200</p>
                <p className="text-xs text-gray-600">#e5e7eb</p>
              </div>
              <div>
                <div className="h-20 bg-gray-50 rounded-lg mb-2 border border-gray-200"></div>
                <p className="text-sm font-medium text-gray-900">Gray 50</p>
                <p className="text-xs text-gray-600">#f9fafb</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4 mt-8">Accent Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="h-20 bg-blue-600 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Blue - Primary</p>
                <p className="text-xs text-gray-600">#2563eb</p>
              </div>
              <div>
                <div className="h-20 bg-blue-500 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Blue - Interactive</p>
                <p className="text-xs text-gray-600">#3b82f6</p>
              </div>
              <div>
                <div className="h-20 bg-blue-50 rounded-lg mb-2 border border-blue-200"></div>
                <p className="text-sm font-medium text-gray-900">Blue - Background</p>
                <p className="text-xs text-gray-600">#eff6ff</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">KPI Cards</h2>
          <div className="grid grid-cols-3 gap-6">
            <KPICard
              title="On Track Projects"
              value="68%"
              trend="up"
              trendValue="+5%"
              status="healthy"
              subtitle="24 of 35 projects"
              icon={<Target className="w-5 h-5" />}
            />
            <KPICard
              title="Budget Variance"
              value="$2.3M"
              trend="down"
              trendValue="-8%"
              status="attention"
              subtitle="Above forecast"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <KPICard
              title="Critical Risks"
              value="12"
              trend="down"
              trendValue="-3"
              status="critical"
              subtitle="Immediate attention"
              icon={<AlertTriangle className="w-5 h-5" />}
              tooltip="Risks with high impact and probability"
            />
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2"><strong>Usage:</strong></p>
            <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
              {`<KPICard
  title="Metric Name"
  value="68%"
  trend="up"
  trendValue="+5%"
  status="healthy"
  subtitle="Additional context"
  icon={<Icon />}
/>`}
            </code>
          </div>
        </section>

        {/* Status Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Status Badges</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Project Status</p>
                <div className="flex gap-3 flex-wrap">
                  <StatusBadge status="on-track" size="sm" />
                  <StatusBadge status="at-risk" size="md" />
                  <StatusBadge status="critical" size="lg" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Milestone Status</p>
                <div className="flex gap-3 flex-wrap">
                  <StatusBadge status="completed" size="md" />
                  <StatusBadge status="delayed" size="md" />
                  <StatusBadge status="upcoming" size="md" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Risk Status</p>
                <div className="flex gap-3 flex-wrap">
                  <StatusBadge status="open" size="md" />
                  <StatusBadge status="mitigated" size="md" />
                  <StatusBadge status="closed" size="md" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Chart Components</h2>
          <div className="grid grid-cols-2 gap-6">
            <ChartContainer 
              title="Line Chart Example"
              subtitle="Trend over time"
              actions={
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              }
            >
              <ResponsiveContainer key="complib-line" width="100%" height={250}>
                <LineChart data={sampleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line key="line-value" type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                  <Line key="line-target" type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer 
              title="Bar Chart Example"
              subtitle="Comparison by category"
              actions={
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              }
            >
              <ResponsiveContainer key="complib-bar" width="100%" height={250}>
                <BarChart data={sampleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer 
              title="Pie Chart Example"
              subtitle="Distribution view"
            >
              <ResponsiveContainer key="complib-pie" width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={samplePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {samplePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </section>

        {/* Data Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Table</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <DataTable 
              data={sampleTableData}
              columns={tableColumns}
              onRowClick={(item) => console.log('Clicked:', item)}
            />
          </div>
        </section>

        {/* Filter Bar */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Filter Bar</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <FilterBar />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Typography</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <h1 className="mb-2">Heading 1 - 2xl</h1>
              <code className="text-xs text-gray-600">text-2xl font-semibold</code>
            </div>
            <div>
              <h2 className="mb-2">Heading 2 - xl</h2>
              <code className="text-xs text-gray-600">text-xl font-semibold</code>
            </div>
            <div>
              <h3 className="mb-2">Heading 3 - lg</h3>
              <code className="text-xs text-gray-600">text-lg font-semibold</code>
            </div>
            <div>
              <p className="text-base mb-2">Body text - base</p>
              <code className="text-xs text-gray-600">text-base</code>
            </div>
            <div>
              <p className="text-sm mb-2">Small text - sm</p>
              <code className="text-xs text-gray-600">text-sm</code>
            </div>
            <div>
              <p className="text-xs mb-2">Extra small text - xs</p>
              <code className="text-xs text-gray-600">text-xs</code>
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Spacing System (8px Grid)</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">8px (2)</div>
                <div className="h-8 bg-blue-200 rounded" style={{ width: '8px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">16px (4)</div>
                <div className="h-8 bg-blue-300 rounded" style={{ width: '16px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">24px (6)</div>
                <div className="h-8 bg-blue-400 rounded" style={{ width: '24px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">32px (8)</div>
                <div className="h-8 bg-blue-500 rounded" style={{ width: '32px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">48px (12)</div>
                <div className="h-8 bg-blue-600 rounded" style={{ width: '48px' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid System */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Grid System (12 Columns)</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-12 gap-4 mb-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-blue-100 border border-blue-300 h-12 rounded flex items-center justify-center text-xs text-blue-800">
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-2"><strong>Common Patterns:</strong></p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 4 columns: grid-cols-4 (3 col span each)</li>
              <li>• 3 columns: grid-cols-3 (4 col span each)</li>
              <li>• 2 columns: grid-cols-2 (6 col span each)</li>
              <li>• Full width: col-span-12</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}