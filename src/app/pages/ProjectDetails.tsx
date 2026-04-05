import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { DashboardHeader } from '../components/DashboardHeader';
import { StatusBadge } from '../components/StatusBadge';
import { projects } from '../data/mockData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  AlertCircle, Clock, CheckCircle, User, Calendar, TrendingDown, Info, Shield, Link2, Users 
} from 'lucide-react';
import { ChartInfoToggle } from '../components/ChartInfoToggle';

export function ProjectDetails() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id') || 'PRJ-006';
  const project = projects.find(p => p.id === projectId) || projects[0];
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  
  const showTooltip = (id: string) => setTooltipVisible(id);
  const hideTooltip = () => setTooltipVisible(null);

  // Sprint/Task burndown data
  const burndownData = [
    { day: 'Day 1', remaining: 45, ideal: 45 },
    { day: 'Day 2', remaining: 43, ideal: 42 },
    { day: 'Day 3', remaining: 40, ideal: 39 },
    { day: 'Day 4', remaining: 37, ideal: 36 },
    { day: 'Day 5', remaining: 35, ideal: 33 },
    { day: 'Day 6', remaining: 32, ideal: 30 },
    { day: 'Day 7', remaining: 30, ideal: 27 },
    { day: 'Day 8', remaining: 27, ideal: 24 },
    { day: 'Day 9', remaining: 25, ideal: 21 },
    { day: 'Day 10', remaining: 22, ideal: 18 },
    { day: 'Day 11', remaining: 19, ideal: 15 },
    { day: 'Day 12', remaining: 17, ideal: 12 },
    { day: 'Day 13', remaining: 14, ideal: 9 },
    { day: 'Day 14', remaining: 12, ideal: 6 },
  ];

  // Blocked tasks
  const blockedTasks = [
    { 
      id: 'T-101', 
      name: 'API integration testing', 
      blockedBy: 'Vendor API not available', 
      assignee: 'John Smith',
      blockedSince: '2026-03-15',
      priority: 'high' as const 
    },
    { 
      id: 'T-102', 
      name: 'Database migration script', 
      blockedBy: 'Awaiting DBA approval', 
      assignee: 'Sarah Johnson',
      blockedSince: '2026-03-20',
      priority: 'critical' as const 
    },
    { 
      id: 'T-103', 
      name: 'UI component updates', 
      blockedBy: 'Design review pending', 
      assignee: 'Mike Chen',
      blockedSince: '2026-03-22',
      priority: 'medium' as const 
    },
    { 
      id: 'T-104', 
      name: 'Performance optimization', 
      blockedBy: 'Waiting for test environment', 
      assignee: 'Lisa Anderson',
      blockedSince: '2026-03-25',
      priority: 'high' as const 
    },
  ];

  // Change history
  const changeHistory = [
    {
      date: '2026-03-28',
      type: 'Scope Change',
      description: 'Added multi-region deployment support',
      impactSchedule: '+2 weeks',
      impactBudget: '+$150K',
      status: 'approved'
    },
    {
      date: '2026-03-20',
      type: 'Resource Change',
      description: 'Additional developer assigned',
      impactSchedule: '-1 week',
      impactBudget: '+$75K',
      status: 'approved'
    },
    {
      date: '2026-03-10',
      type: 'Schedule Change',
      description: 'Milestone 3 deadline extended',
      impactSchedule: '+1 week',
      impactBudget: '$0',
      status: 'pending'
    },
  ];

  // Task status breakdown
  const taskBreakdown = [
    { status: 'Completed', count: 87, color: '#10b981' },
    { status: 'In Progress', count: 23, color: '#3b82f6' },
    { status: 'Blocked', count: 4, color: '#ef4444' },
    { status: 'Not Started', count: 12, color: '#cbd5e1' },
  ];

  const totalTasks = taskBreakdown.reduce((sum, item) => sum + item.count, 0);

  // Team capacity
  const teamMembers = [
    { name: 'John Smith', role: 'Backend Dev', assigned: 8, capacity: 8, status: 'full' },
    { name: 'Sarah Johnson', role: 'Frontend Dev', assigned: 10, capacity: 8, status: 'over' },
    { name: 'Mike Chen', role: 'UI/UX', assigned: 6, capacity: 8, status: 'available' },
    { name: 'Lisa Anderson', role: 'QA', assigned: 9, capacity: 8, status: 'over' },
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title={`Project Detail: ${project.name}`}
        subtitle="Task-level bottleneck identification"
        breadcrumbs={[
          { label: 'Executive Overview', path: '/' },
          { label: 'Project Details' },
        ]}
      />
      
      <div className="flex-1 overflow-auto p-4">
        {/* Compact Project Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 mb-3">
          <div className="grid grid-cols-6 gap-2">
            <div>
              <p className="text-[10px] text-blue-700 font-medium">Status</p>
              <StatusBadge status={project.status} />
            </div>
            <div>
              <p className="text-[10px] text-blue-700 font-medium">PM</p>
              <p className="text-xs font-semibold text-blue-900">{project.projectManager}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-700 font-medium">Progress</p>
              <p className="text-xs font-semibold text-blue-900">{project.progress}%</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-700 font-medium">SPI / CPI</p>
              <p className="text-xs font-semibold text-blue-900">{project.spi.toFixed(2)} / {project.cpi.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-700 font-medium">Budget</p>
              <p className="text-xs font-semibold text-blue-900">${(project.budget / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-700 font-medium">Open Risks</p>
              <p className="text-xs font-semibold text-red-600">{project.openRisks}</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Burndown Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Sprint Burndown (14 Days)
              <span className="ml-auto"><ChartInfoToggle description="Shows remaining work (story points) over the current 14-day sprint. The ideal line shows expected pace; actual line shows real progress. Actual above ideal means behind schedule." /></span>
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#6b7280" angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Line type="monotone" dataKey="ideal" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal" />
                <Line type="monotone" dataKey="remaining" stroke="#8A1538" strokeWidth={2} dot={{ fill: '#8A1538', r: 2 }} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center justify-between">Task Status ({totalTasks} total) <ChartInfoToggle description="Progress bars showing the breakdown of all tasks by status: To Do, In Progress, In Review, and Done. Tracks overall task completion rate." /></h3>
            <div className="space-y-2">
              {taskBreakdown.map(item => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.status}</span>
                    <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${(item.count / totalTasks) * 100}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Completion Rate</span>
                <span className="text-lg font-bold" style={{ color: '#8A1538' }}>
                  {Math.round((taskBreakdown[0].count / totalTasks) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Team Capacity */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Team Capacity
              <span className="ml-auto"><ChartInfoToggle description="Shows task allocation vs capacity for each team member. Red indicates overallocation, amber means at capacity, and green shows availability for more work." /></span>
            </h3>
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.name} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${
                        member.status === 'over' ? 'text-red-600' : 
                        member.status === 'full' ? 'text-amber-600' : 
                        'text-green-600'
                      }`}>
                        {member.assigned}/{member.capacity} tasks
                      </p>
                      <p className="text-xs text-gray-600">
                        {member.status === 'over' ? 'Overallocated' : 
                         member.status === 'full' ? 'At capacity' : 
                         'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Governance Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            Project Governance
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
              project.classification.type === 'National' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {project.classification.type}
            </span>
            <span className="text-xs text-gray-500 font-normal ml-1">
              {project.classification.dgCode} · {project.classification.nscCode}
            </span>
            <span className="ml-auto"><ChartInfoToggle description="Project governance details including classification type (National/International), stakeholders (internal and external), and key financial attributes like financial source and strategic alignment." /></span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Internal Stakeholders
              </h4>
              <div className="space-y-1">
                {project.stakeholders.internal.map(s => (
                  <div key={s} className="text-xs text-gray-800 bg-gray-50 rounded px-2 py-1">{s}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                External Stakeholders
              </h4>
              <div className="space-y-1">
                {project.stakeholders.external.map(s => (
                  <div key={s} className="text-xs text-gray-800 bg-gray-50 rounded px-2 py-1">{s}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Dependencies
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1 font-medium text-gray-600">Project</th>
                      <th className="text-left py-1 font-medium text-gray-600">Type</th>
                      <th className="text-left py-1 font-medium text-gray-600">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.dependencies.map(dep => (
                      <tr key={dep.projectId} className="border-b border-gray-100">
                        <td className="py-1 text-gray-900 font-medium">{dep.projectId}</td>
                        <td className="py-1 text-gray-700">{dep.relationship}</td>
                        <td className="py-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            dep.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                            dep.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {dep.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - 2 Columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Blocked Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Blocked Tasks (Action Required)
              <span className="ml-auto"><ChartInfoToggle description="Tasks currently blocked and requiring immediate attention. Shows what is blocking each task, who is assigned, how long it's been blocked, and priority level." /></span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Task</th>
                    <th className="text-left py-2 font-medium text-gray-600">Blocked By</th>
                    <th className="text-left py-2 font-medium text-gray-600">Assignee</th>
                    <th className="text-left py-2 font-medium text-gray-600">Since</th>
                    <th className="text-left py-2 font-medium text-gray-600">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedTasks.map(task => (
                    <tr key={task.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900 font-medium">{task.name}</td>
                      <td className="py-2 text-gray-700">{task.blockedBy}</td>
                      <td className="py-2 text-gray-700">{task.assignee}</td>
                      <td className="py-2 text-gray-700">{task.blockedSince}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Change History */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Change History
              <span className="ml-auto"><ChartInfoToggle description="Timeline of recent changes to the project including scope changes, budget adjustments, and schedule modifications with the person who made each change." /></span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Date</th>
                    <th className="text-left py-2 font-medium text-gray-600">Type</th>
                    <th className="text-left py-2 font-medium text-gray-600">Description</th>
                    <th className="text-left py-2 font-medium text-gray-600">Schedule</th>
                    <th className="text-left py-2 font-medium text-gray-600">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {changeHistory.map((change, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">{change.date}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {change.type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-900">{change.description}</td>
                      <td className="py-2 text-gray-700">{change.impactSchedule}</td>
                      <td className="py-2 text-gray-700">{change.impactBudget}</td>
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