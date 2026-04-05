import { DashboardHeader } from '../components/DashboardHeader';
import { FilterBar } from '../components/FilterBar';
import { projects, resourceUtilization } from '../data/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Link } from 'react-router';
import { StatusBadge } from '../components/StatusBadge';
import { AlertTriangle, Users, TrendingUp, Info, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { InfoTooltip } from '../components/InfoTooltip';
import { ChartInfoToggle } from '../components/ChartInfoToggle';

export function PortfolioDeepDive() {
  const { t } = useLanguage();
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'National' | 'Council'>('all');
  
  const showTooltip = (id: string) => setTooltipVisible(id);
  const hideTooltip = () => setTooltipVisible(null);

  const filteredByClassification = classificationFilter === 'all'
    ? projects
    : projects.filter(p => p.classification.type === classificationFilter);
  
  // Simple status breakdown
  const statusBreakdown = [
    { status: 'On Track', count: filteredByClassification.filter(p => p.status === 'on-track').length, color: '#10b981' },
    { status: 'At Risk', count: filteredByClassification.filter(p => p.status === 'at-risk').length, color: '#f59e0b' },
    { status: 'Critical', count: filteredByClassification.filter(p => p.status === 'critical').length, color: '#ef4444' },
  ];

  // Budget by status (simplified)
  const budgetByStatus = [
    { 
      status: 'On Track', 
      budget: filteredByClassification.filter(p => p.status === 'on-track').reduce((sum, p) => sum + p.budget, 0) / 1000000 
    },
    { 
      status: 'At Risk', 
      budget: filteredByClassification.filter(p => p.status === 'at-risk').reduce((sum, p) => sum + p.budget, 0) / 1000000 
    },
    { 
      status: 'Critical', 
      budget: filteredByClassification.filter(p => p.status === 'critical').reduce((sum, p) => sum + p.budget, 0) / 1000000 
    },
  ];

  // Capacity utilization (simplified to show only over-allocated)
  const utilizationData = resourceUtilization
    .sort((a, b) => (b.allocated / b.capacity) - (a.allocated / a.capacity))
    .slice(0, 8)
    .map(r => ({
      role: r.role,
      'Utilization %': Math.round((r.allocated / r.capacity) * 100),
    }));

  // Over-allocated resources
  const overAllocated = resourceUtilization.filter(r => r.available < 0);

  // High-risk projects
  const highRiskProjects = filteredByClassification.filter(p => p.openRisks >= 6);

  // Projects needing attention (critical or at-risk with high budget)
  const projectsNeedingAttention = filteredByClassification
    .filter(p => p.status === 'critical' || (p.status === 'at-risk' && p.budget > 5000000))
    .sort((a, b) => b.budget - a.budget);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title={t('portfolio.title')}
        subtitle="Portfolio health and resource allocation"
        breadcrumbs={[
          { label: t('exec.title'), path: '/' },
          { label: t('portfolio.title') },
        ]}
      />
      <FilterBar />
      
      <div className="flex-1 overflow-auto p-4">
        {/* Classification Filter */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gray-600">Classification:</span>
          {(['all', 'National', 'Council'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setClassificationFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                classificationFilter === filter
                  ? filter === 'National' ? 'bg-green-600 text-white' :
                    filter === 'Council' ? 'bg-blue-600 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'All Projects' : `${filter} Projects`}
              <span className="ml-1 opacity-75">
                ({filter === 'all' ? projects.length : projects.filter(p => p.classification.type === filter).length})
              </span>
            </button>
          ))}
        </div>

        {/* Compact Key Metrics Strip */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-white rounded-lg border border-gray-200 p-2 relative">
            <div className="flex items-center gap-1 mb-0.5">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <p className="text-[10px] font-medium text-gray-600">{t('portfolio.highRisk')}</p>
              <div className="relative">
                <Info 
                  className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                  onMouseEnter={() => showTooltip('highRisk')}
                  onMouseLeave={hideTooltip}
                />
                {tooltipVisible === 'highRisk' && (
                  <div className="absolute left-0 top-5 z-50 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    <div className="font-semibold mb-1">How it's calculated:</div>
                    <div className="text-gray-200">Projects with 6 or more open risks requiring immediate attention.</div>
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-lg font-semibold text-red-600">{highRiskProjects.length}</p>
            <p className="text-[9px] text-gray-500">projects</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2 relative">
            <div className="flex items-center gap-1 mb-0.5">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <p className="text-[10px] font-medium text-gray-600">Total Risks</p>
              <div className="relative">
                <Info 
                  className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                  onMouseEnter={() => showTooltip('openRisks')}
                  onMouseLeave={hideTooltip}
                />
                {tooltipVisible === 'openRisks' && (
                  <div className="absolute left-0 top-5 z-50 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    <div className="font-semibold mb-1">How it's calculated:</div>
                    <div className="text-gray-200">Sum of all active risks across all projects.</div>
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-lg font-semibold text-amber-600">
              {filteredByClassification.reduce((sum, p) => sum + p.openRisks, 0)}
            </p>
            <p className="text-[9px] text-gray-500">across portfolio</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2 relative">
            <div className="flex items-center gap-1 mb-0.5">
              <Users className="w-3 h-3 text-red-500" />
              <p className="text-[10px] font-medium text-gray-600">Resource Issues</p>
              <div className="relative">
                <Info 
                  className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                  onMouseEnter={() => showTooltip('overAllocated')}
                  onMouseLeave={hideTooltip}
                />
                {tooltipVisible === 'overAllocated' && (
                  <div className="absolute left-0 top-5 z-50 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    <div className="font-semibold mb-1">How it's calculated:</div>
                    <div className="text-gray-200">Roles where allocated resources exceed capacity.</div>
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-lg font-semibold text-red-600">{overAllocated.length}</p>
            <p className="text-[9px] text-gray-500">roles over capacity</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2 relative">
            <div className="flex items-center gap-1 mb-0.5">
              <Target className="w-3 h-3 text-green-500" />
              <p className="text-[10px] font-medium text-gray-600">On Track</p>
              <div className="relative">
                <Info 
                  className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                  onMouseEnter={() => showTooltip('onTrack')}
                  onMouseLeave={hideTooltip}
                />
                {tooltipVisible === 'onTrack' && (
                  <div className="absolute left-0 top-5 z-50 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    <div className="font-semibold mb-1">How it's calculated:</div>
                    <div className="text-gray-200">Percentage of projects meeting schedule and budget targets.</div>
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-lg font-semibold text-green-600">
              {filteredByClassification.length > 0 ? Math.round((filteredByClassification.filter(p => p.status === 'on-track').length / filteredByClassification.length) * 100) : 0}%
            </p>
            <p className="text-[9px] text-gray-500">{filteredByClassification.filter(p => p.status === 'on-track').length} projects</p>
          </div>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Portfolio Status Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Portfolio Status <ChartInfoToggle description="Pie chart showing the distribution of projects by status. Quickly identifies the proportion of on-track vs at-risk and critical projects in the portfolio." /></h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                      labelLine={false}
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{item.status}</p>
                      <p className="text-xs text-gray-600">{item.count} projects</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget by Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center justify-between">Budget by Status <ChartInfoToggle description="Bar chart showing total budget allocation grouped by project status. Reveals how much funding is tied to at-risk or critical projects." /></h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" label={{ value: '$M', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                  formatter={(value: number) => `$${value.toFixed(1)}M`}
                />
                <Bar dataKey="budget" fill="#8A1538" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center justify-between">Resource Utilization (Top 8 Roles) <ChartInfoToggle description="Horizontal bar chart showing staff utilization by role. Values above 100% indicate overallocation; below 70% may suggest underutilization." /></h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilizationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#6b7280" label={{ value: '%', position: 'insideRight', style: { fontSize: 10 } }} />
              <YAxis type="category" dataKey="role" tick={{ fontSize: 9 }} stroke="#6b7280" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Bar dataKey="Utilization %" fill="#8A1538" radius={[0, 4, 4, 0]}>
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry['Utilization %'] > 100 ? '#ef4444' : '#8A1538'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row - 2 Tables */}
        <div className="grid grid-cols-2 gap-3">
          {/* Projects Needing Attention */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Projects Needing Attention
              <span className="ml-auto"><ChartInfoToggle description="Lists projects with at-risk or critical status, showing their classification, budget, and open risk count. Click a project name to see full details." /></span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Project</th>
                    <th className="text-center py-2 font-medium text-gray-600">Status</th>
                    <th className="text-center py-2 font-medium text-gray-600">Type</th>
                    <th className="text-right py-2 font-medium text-gray-600">DG Code</th>
                    <th className="text-right py-2 font-medium text-gray-600">NSC Code</th>
                    <th className="text-right py-2 font-medium text-gray-600">Budget</th>
                    <th className="text-right py-2 font-medium text-gray-600">Risks</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsNeedingAttention.slice(0, 8).map(project => (
                    <tr key={project.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="py-2">
                        <Link 
                          to={`/project-details?id=${project.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="text-center">
                        <StatusBadge status={project.status} size="sm" />
                      </td>
                      <td className="text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          project.classification.type === 'National' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {project.classification.type}
                        </span>
                      </td>
                      <td className="text-right text-gray-700 text-xs">{project.classification.dgCode}</td>
                      <td className="text-right text-gray-700 text-xs">{project.classification.nscCode}</td>
                      <td className="text-right text-gray-900">${(project.budget / 1000000).toFixed(1)}M</td>
                      <td className="text-right text-red-600 font-semibold">{project.openRisks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Over-Allocated Resources Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              Resource Constraints
              <span className="ml-auto"><ChartInfoToggle description="Shows over-allocated resources (utilization > 100%). Lists each role, its current utilization percentage, and allocated vs available headcount." /></span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Role</th>
                    <th className="text-right py-2 font-medium text-gray-600">Capacity</th>
                    <th className="text-right py-2 font-medium text-gray-600">Allocated</th>
                    <th className="text-right py-2 font-medium text-gray-600">Over</th>
                  </tr>
                </thead>
                <tbody>
                  {overAllocated.map(resource => (
                    <tr key={resource.role} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900 font-medium">{resource.role}</td>
                      <td className="text-right text-gray-700">{resource.capacity}</td>
                      <td className="text-right text-red-600 font-medium">{resource.allocated}</td>
                      <td className="text-right text-red-600 font-semibold">{Math.abs(resource.available)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}