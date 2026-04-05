import { useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { FilterBar } from '../components/FilterBar';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { projects } from '../data/mockData';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Link, useSearchParams } from 'react-router';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  AlertCircle, CheckCircle, Clock 
} from 'lucide-react';

export function ProjectManagerView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('id') || 'PRJ-004';
  const selectedProject = projects.find(p => p.id === projectId) || projects[0];

  // Calculate progress data over time
  const progressData = [
    { week: 'Week 1', planned: 15, actual: 13 },
    { week: 'Week 2', planned: 28, actual: 25 },
    { week: 'Week 3', planned: 38, actual: 34 },
    { week: 'Week 4', planned: 46, actual: 41 },
    { week: 'Week 5', planned: 52, actual: 48 },
    { week: 'Week 6', planned: 58, actual: selectedProject.progress },
  ];

  // Budget breakdown
  const budgetData = [
    { 
      category: 'Budget Overview',
      Budget: selectedProject.budget / 1000000,
      Spent: selectedProject.spent / 1000000,
      Forecast: selectedProject.forecast / 1000000,
    },
  ];

  // Milestones
  const milestones = [
    { name: 'Requirements Sign-off', plannedDate: '2025-07-15', actualDate: '2025-07-18', status: 'completed' as const },
    { name: 'Design Approval', plannedDate: '2025-09-01', actualDate: '2025-09-05', status: 'completed' as const },
    { name: 'Development Phase 1', plannedDate: '2025-11-30', actualDate: '2025-12-08', status: 'completed' as const },
    { name: 'UAT Completion', plannedDate: '2026-02-28', actualDate: undefined, status: 'delayed' as const },
    { name: 'Go-Live Preparation', plannedDate: '2026-06-15', actualDate: undefined, status: 'upcoming' as const },
    { name: 'Production Release', plannedDate: '2026-07-31', actualDate: undefined, status: 'upcoming' as const },
  ];

  // Top risks
  const projectRisks = [
    { id: 'R1', title: 'Cloud provider pricing changes', impact: 'high', probability: 'medium', owner: 'Tech Lead' },
    { id: 'R2', title: 'Resource availability constraints', impact: 'high', probability: 'high', owner: 'PM' },
    { id: 'R3', title: 'Integration complexity', impact: 'medium', probability: 'high', owner: 'Architect' },
  ];

  // Top issues
  const projectIssues = [
    { id: 'I1', title: 'API performance degradation', severity: 'high', status: 'open', assignee: 'Dev Team' },
    { id: 'I2', title: 'Data migration delays', severity: 'critical', status: 'open', assignee: 'Data Team' },
    { id: 'I3', title: 'Testing environment downtime', severity: 'medium', status: 'in-progress', assignee: 'DevOps' },
  ];

  // Dependencies
  const dependencies = [
    { id: 'D1', description: 'Vendor API updates', status: 'blocked', dueDate: '2026-04-15' },
    { id: 'D2', description: 'Security audit completion', status: 'on-track', dueDate: '2026-05-01' },
  ];

  // Change requests
  const changeRequests = [
    { id: 'CR1', title: 'Add multi-currency support', impact: 'Schedule: +2 weeks, Budget: +$50K', status: 'pending' },
    { id: 'CR2', title: 'Enhanced reporting module', impact: 'Schedule: +1 week, Budget: +$25K', status: 'approved' },
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Project Manager View" 
        subtitle="What do I need to fix this week?"
        breadcrumbs={[
          { label: 'Executive Overview', path: '/' },
          { label: 'Project Manager View' },
        ]}
      />
      <FilterBar />
      
      <div className="flex-1 overflow-auto p-4">
        {/* Compact Project Selector */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-xs font-medium text-blue-900 mb-1 block">Select Project:</label>
              <select 
                value={selectedProject.id}
                onChange={(e) => setSearchParams({ id: e.target.value })}
                className="px-3 py-1.5 border border-blue-300 rounded-lg bg-white text-gray-900 font-medium text-sm"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="ml-4">
              <StatusBadge status={selectedProject.status} />
            </div>
          </div>
        </div>

        {/* Compact KPIs - 6 columns */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          <KPICard
            title="Progress"
            value={`${selectedProject.progress}%`}
            trend={selectedProject.progress >= 50 ? 'up' : 'down'}
            status={selectedProject.progress >= 50 ? 'healthy' : 'attention'}
            icon={<TrendingUp className="w-3 h-3" />}
            calculation="Percentage of completed tasks vs total tasks. Based on Earned Value Method: (Actual Work Completed / Total Planned Work) × 100."
          />
          <KPICard
            title="SPI"
            value={selectedProject.spi.toFixed(2)}
            status={selectedProject.spi >= 1 ? 'healthy' : selectedProject.spi >= 0.85 ? 'attention' : 'critical'}
            icon={<Calendar className="w-3 h-3" />}
            calculation="Schedule Performance Index = Earned Value (EV) / Planned Value (PV). Greater than 1.0 = ahead of schedule, 0.85-1.0 = slight delay, less than 0.85 = significant delay."
          />
          <KPICard
            title="CPI"
            value={selectedProject.cpi.toFixed(2)}
            status={selectedProject.cpi >= 1 ? 'healthy' : selectedProject.cpi >= 0.85 ? 'attention' : 'critical'}
            icon={<DollarSign className="w-3 h-3" />}
            calculation="Cost Performance Index = Earned Value (EV) / Actual Cost (AC). Greater than 1.0 = under budget, 0.85-1.0 = slight overrun, less than 0.85 = significant overrun."
          />
          <KPICard
            title="Budget"
            value={`$${(selectedProject.budget / 1000000).toFixed(1)}M`}
            subtitle={`Spent: $${(selectedProject.spent / 1000000).toFixed(1)}M`}
            status="healthy"
            calculation="Total approved budget for this project. Spent shows actual expenditure to date. Tracks against baseline budget at completion (BAC)."
          />
          <KPICard
            title="Open Risks"
            value={selectedProject.openRisks.toString()}
            status={selectedProject.openRisks >= 6 ? 'critical' : selectedProject.openRisks >= 3 ? 'attention' : 'healthy'}
            icon={<AlertCircle className="w-3 h-3" />}
            calculation="Count of active risks requiring mitigation. Greater than 6 = critical (requires executive escalation), 3-6 = attention needed, less than 3 = manageable."
          />
          <KPICard
            title="Confidence"
            value={`${selectedProject.deliveryConfidence}%`}
            status={selectedProject.deliveryConfidence >= 80 ? 'healthy' : selectedProject.deliveryConfidence >= 60 ? 'attention' : 'critical'}
            icon={<CheckCircle className="w-3 h-3" />}
            calculation="Team's confidence in meeting deadlines. Based on risk assessment, resource availability, and historical performance. Greater than 80% = high confidence, 60-80% = moderate, less than 60% = low."
          />
        </div>

        {/* Main Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Progress Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Progress Tracking (6 Weeks)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="planned" stroke="#cbd5e1" strokeWidth={2} dot={{ fill: '#cbd5e1', r: 3 }} />
                <Line type="monotone" dataKey="actual" stroke="#8A1538" strokeWidth={2} dot={{ fill: '#8A1538', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Budget Breakdown ($M)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" hide />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#8A1538" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Forecast" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4-Column Grid for Lists */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {/* Milestones */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Milestones
            </h3>
            <div className="space-y-2">
              {milestones.slice(0, 5).map(milestone => (
                <div key={milestone.name} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-900">{milestone.name}</p>
                    {milestone.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-600" />}
                    {milestone.status === 'delayed' && <AlertCircle className="w-3 h-3 text-red-600" />}
                    {milestone.status === 'upcoming' && <Clock className="w-3 h-3 text-blue-600" />}
                  </div>
                  <p className="text-xs text-gray-600">
                    {milestone.plannedDate}
                    {milestone.actualDate && milestone.actualDate !== milestone.plannedDate && (
                      <span className="text-red-600"> → {milestone.actualDate}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Risks */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Top Risks
            </h3>
            <div className="space-y-2">
              {projectRisks.map(risk => (
                <div key={risk.id} className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-900 mb-1">{risk.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      risk.impact === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {risk.impact}
                    </span>
                    <span className="text-gray-600">{risk.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Issues */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Top Issues
            </h3>
            <div className="space-y-2">
              {projectIssues.map(issue => (
                <div key={issue.id} className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-900 mb-1">{issue.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="text-gray-600">{issue.assignee}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies & Change Requests */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Dependencies</h3>
            <div className="space-y-2 mb-4">
              {dependencies.map(dep => (
                <div key={dep.id} className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-900 mb-1">{dep.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      dep.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {dep.status}
                    </span>
                    <span className="text-gray-600">{dep.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Change Requests</h3>
            <div className="space-y-2">
              {changeRequests.map(cr => (
                <div key={cr.id} className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-900 mb-1">{cr.title}</p>
                  <p className="text-xs text-gray-600 mb-1">{cr.impact}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    cr.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {cr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">This Week's Action Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Priority</th>
                  <th className="text-left py-2 font-medium text-gray-600">Action</th>
                  <th className="text-left py-2 font-medium text-gray-600">Owner</th>
                  <th className="text-left py-2 font-medium text-gray-600">Due Date</th>
                  <th className="text-left py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2"><span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">High</span></td>
                  <td className="py-2 text-gray-900">Resolve data migration delays</td>
                  <td className="py-2 text-gray-700">Data Team</td>
                  <td className="py-2 text-gray-700">2026-04-05</td>
                  <td className="py-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">In Progress</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2"><span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">High</span></td>
                  <td className="py-2 text-gray-900">Address API performance issues</td>
                  <td className="py-2 text-gray-700">Dev Team</td>
                  <td className="py-2 text-gray-700">2026-04-03</td>
                  <td className="py-2"><span className="px-2 py-1 bg-red-100 text-red-700 rounded">Not Started</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium">Medium</span></td>
                  <td className="py-2 text-gray-900">Review change request CR1</td>
                  <td className="py-2 text-gray-700">PM</td>
                  <td className="py-2 text-gray-700">2026-04-08</td>
                  <td className="py-2"><span className="px-2 py-1 bg-green-100 text-green-700 rounded">Completed</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium">Medium</span></td>
                  <td className="py-2 text-gray-900">Follow up on vendor API updates</td>
                  <td className="py-2 text-gray-700">Tech Lead</td>
                  <td className="py-2 text-gray-700">2026-04-10</td>
                  <td className="py-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">In Progress</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}