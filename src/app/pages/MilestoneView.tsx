import { KPICard } from '../components/KPICard';
import { milestones, projects } from '../data/mockData';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, LineChart, Line 
} from 'recharts';
import { Link } from 'react-router';
import { Flag, CheckCircle2, AlertTriangle, Clock, TrendingUp, Info } from 'lucide-react';
import { useState } from 'react';

export function MilestoneView() {
  const [activeTab, setActiveTab] = useState<'performance' | 'stage' | 'risk'>('performance');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // ===== MILESTONE CALCULATIONS =====
  const totalMilestones = milestones.length;
  const milestonesCompleted = milestones.filter(m => m.status === 'completed').length;
  const milestonesOnTrack = milestones.filter(m => m.status === 'on-track').length;
  const milestonesAtRisk = milestones.filter(m => m.status === 'at-risk').length;
  const milestonesDelayed = milestones.filter(m => m.status === 'delayed').length;
  const milestonesUpcoming = milestones.filter(m => m.status === 'upcoming').length;
  const milestoneCompletionRate = totalMilestones > 0 ? Math.round((milestonesCompleted / totalMilestones) * 100) : 0;
  
  // Milestone RAG Distribution
  const milestoneRAGData = [
    { name: 'Completed', value: milestonesCompleted, color: '#10b981' },
    { name: 'On Track', value: milestonesOnTrack, color: '#3b82f6' },
    { name: 'At Risk', value: milestonesAtRisk, color: '#f59e0b' },
    { name: 'Delayed', value: milestonesDelayed, color: '#ef4444' },
    { name: 'Upcoming', value: milestonesUpcoming, color: '#cbd5e1' },
  ];
  
  // PMO Cycle Stage Distribution
  const stageDistribution = milestones.reduce((acc, m) => {
    const existing = acc.find(s => s.stage === m.stage);
    if (existing) {
      existing.count++;
      if (m.status === 'completed') existing.completed++;
      if (m.status === 'on-track' || m.status === 'completed') existing.onTrack++;
    } else {
      acc.push({
        stage: m.stage,
        count: 1,
        completed: m.status === 'completed' ? 1 : 0,
        onTrack: (m.status === 'on-track' || m.status === 'completed') ? 1 : 0,
      });
    }
    return acc;
  }, [] as Array<{ stage: string; count: number; completed: number; onTrack: number }>);
  
  const stageChartData = stageDistribution.map(s => ({
    name: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    Total: s.count,
    Completed: s.completed,
    'On Track': s.onTrack - s.completed,
    'At Risk': s.count - s.onTrack,
  })).sort((a, b) => b.Total - a.Total);
  
  // Top 10 Delayed Milestones
  const delayedMilestones = milestones
    .filter(m => m.status === 'delayed')
    .map(m => {
      const project = projects.find(p => p.id === m.projectId);
      return { ...m, projectName: project?.name || 'Unknown', projectStatus: project?.status };
    })
    .slice(0, 10);
  
  // Milestones At Risk by Department (using portfolio as department proxy)
  const atRiskByDepartment = milestones
    .filter(m => m.status === 'at-risk' || m.status === 'delayed')
    .reduce((acc, m) => {
      const project = projects.find(p => p.id === m.projectId);
      const dept = project?.portfolio || 'Unknown';
      const existing = acc.find(d => d.department === dept);
      if (existing) {
        existing.count++;
        if (m.criticalPath) existing.criticalPath++;
      } else {
        acc.push({
          department: dept,
          count: 1,
          criticalPath: m.criticalPath ? 1 : 0,
        });
      }
      return acc;
    }, [] as Array<{ department: string; count: number; criticalPath: number }>)
    .sort((a, b) => b.count - a.count);
  
  // Milestone completion trend
  const milestoneCompletionTrend = [
    { month: 'Oct 2025', planned: 15, actual: 12 },
    { month: 'Nov 2025', planned: 18, actual: 16 },
    { month: 'Dec 2025', planned: 20, actual: 19 },
    { month: 'Jan 2026', planned: 22, actual: 21 },
    { month: 'Feb 2026', planned: 19, actual: 18 },
    { month: 'Mar 2026', planned: 21, actual: 19 },
  ];
  
  // Critical path milestones
  const criticalPathCount = milestones.filter(m => m.criticalPath).length;
  const criticalPathAtRisk = milestones.filter(m => m.criticalPath && (m.status === 'delayed' || m.status === 'at-risk')).length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Grouped Multi-Row KPI Container */}
      <div className="mb-4 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 p-3">
        
        {/* Milestone Status Overview Group */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 pb-0.5 border-b-2 border-[#8A1538]">
            Milestone Status Overview
          </h3>
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Total Milestones</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('totalMilestones')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'totalMilestones' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Count of all milestones across active projects, including completed, on-track, at-risk, delayed, and upcoming statuses.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{totalMilestones}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{criticalPathCount} critical path</p>
                </div>
                <Flag className="w-3 h-3 text-[#8A1538]" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Completed</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('completed')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'completed' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Milestones marked as completed with all deliverables signed off and verified.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">{milestonesCompleted}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{Math.round((milestonesCompleted / totalMilestones) * 100)}% of total</p>
                </div>
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">On Track</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('onTrack')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'onTrack' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Milestones progressing as planned with no impediments, expected to complete by target date.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{milestonesOnTrack}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{Math.round((milestonesOnTrack / totalMilestones) * 100)}% of total</p>
                </div>
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">At Risk</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('atRisk')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'atRisk' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Milestones facing potential delays due to dependencies, resource issues, or scope changes that may impact timeline.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-amber-600">{milestonesAtRisk}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{criticalPathAtRisk} critical path</p>
                </div>
                <AlertTriangle className="w-3 h-3 text-amber-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Delayed</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('delayed')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'delayed' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Milestones that have passed their planned date without completion, requiring immediate corrective action.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">{milestonesDelayed}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">requires action</p>
                </div>
                <Clock className="w-3 h-3 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Upcoming</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('upcoming')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'upcoming' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Milestones scheduled within the next 30 days that haven't started yet or are in early planning stages.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{milestonesUpcoming}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">next 30 days</p>
                </div>
                <Flag className="w-3 h-3 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Path Health Group */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 pb-0.5 border-b-2 border-[#8A1538]">
            Critical Path Health
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Total Critical Path</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('totalCriticalPath')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'totalCriticalPath' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Milestones on the critical path where any delay directly impacts project completion date.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{criticalPathCount}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{Math.round((criticalPathCount / totalMilestones) * 100)}% of total</p>
                </div>
                <AlertTriangle className="w-3 h-3 text-[#8A1538]" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Critical Path On Track</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('criticalPathOnTrack')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'criticalPathOnTrack' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Critical path milestones progressing on schedule with no issues. Essential for on-time project delivery.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">{criticalPathCount - criticalPathAtRisk}</p>
                  <p className="text-[9px] text-green-600 mt-0.5">
                    {Math.round(((criticalPathCount - criticalPathAtRisk) / criticalPathCount) * 100)}% healthy
                  </p>
                </div>
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Critical Path At Risk</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('criticalPathAtRisk')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'criticalPathAtRisk' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Critical path milestones that are delayed or at-risk. Immediate executive attention required to avoid project delays.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">{criticalPathAtRisk}</p>
                  <p className="text-[9px] text-red-600 mt-0.5">immediate action</p>
                </div>
                <AlertTriangle className="w-3 h-3 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Performance Group */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 pb-0.5 border-b-2 border-[#8A1538]">
            Delivery Performance
          </h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Completion Rate</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('completionRate')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'completionRate' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Formula: (Completed Milestones / Total Milestones) × 100. Measures overall milestone delivery progress.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{milestoneCompletionRate}%</p>
                  <p className="text-[9px] text-green-600 mt-0.5">+3% vs last month</p>
                </div>
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Planned YTD</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('plannedYTD')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'plannedYTD' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Total number of milestones planned to be completed from January 1 to current date this year.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">115</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">total planned</p>
                </div>
                <Flag className="w-3 h-3 text-gray-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Actual YTD</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('actualYTD')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'actualYTD' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Number of milestones actually completed from January 1 to current date this year.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#8A1538' }}>105</p>
                  <p className="text-[9px] text-amber-600 mt-0.5">91% of planned</p>
                </div>
                <CheckCircle2 className="w-3 h-3" style={{ color: '#8A1538' }} />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">On-Time Delivery %</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('onTimeDelivery')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'onTimeDelivery' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Percentage of completed milestones delivered by or before their planned date. Higher = better delivery discipline.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">87%</p>
                  <p className="text-[9px] text-green-600 mt-0.5">+5% improvement</p>
                </div>
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] text-gray-600">Average Delay (Days)</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('avgDelay')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'avgDelay' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">How it's calculated:</div>
                          <div className="text-gray-200">Average number of days past target date for delayed milestones. Lower = better recovery capability.</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-amber-600">8</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">for delayed items</p>
                </div>
                <Clock className="w-3 h-3 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 flex-shrink-0 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'performance'
              ? 'border-[#8A1538] text-[#8A1538]'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Milestone Performance
        </button>
        <button
          onClick={() => setActiveTab('stage')}
          className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'stage'
              ? 'border-[#8A1538] text-[#8A1538]'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Stage Analysis
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'risk'
              ? 'border-[#8A1538] text-[#8A1538]'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Risk & Delays
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Milestone Performance Tab */}
        {activeTab === 'performance' && (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-3 gap-4" style={{ height: '300px' }}>
                {/* Milestone RAG Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Milestone RAG Distribution</h3>
                  <div className="flex-1" style={{ minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={milestoneRAGData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {milestoneRAGData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {milestoneRAGData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-700">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Path Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Critical Path Status</h3>
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Total Critical Path</span>
                      <span className="text-lg font-bold text-gray-900">{criticalPathCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${((criticalPathCount - criticalPathAtRisk) / criticalPathCount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs text-gray-600">On Track</p>
                        <p className="text-lg font-bold text-green-600">{criticalPathCount - criticalPathAtRisk}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs text-gray-600">At Risk</p>
                        <p className="text-lg font-bold text-red-600">{criticalPathAtRisk}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Completion Trend */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Completion Trend (6 Months)</h3>
                  <div className="flex-1" style={{ minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={milestoneCompletionTrend}>
                        <defs>
                          <linearGradient id="plannedMilestoneGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#64748b" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="actualMilestoneGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8A1538" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8A1538" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="planned" 
                          stroke="#64748b" 
                          strokeWidth={2} 
                          name="Planned"
                          dot={{ fill: '#64748b', r: 3 }}
                          fill="url(#plannedMilestoneGradient)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#8A1538" 
                          strokeWidth={2} 
                          name="Actual"
                          dot={{ fill: '#8A1538', r: 3 }}
                          fill="url(#actualMilestoneGradient)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Performance Summary Cards */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Completion Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Planned YTD</p>
                      <p className="text-2xl font-bold text-gray-900">115</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Actual YTD</p>
                      <p className="text-2xl font-bold" style={{ color: '#8A1538' }}>105</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
                      <p className="text-2xl font-bold text-green-600">{milestoneCompletionRate}%</p>
                      <p className="text-xs text-green-600 mt-1">+3% vs last month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Status Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-xs font-medium text-gray-700">Completed</span>
                      <span className="text-lg font-bold text-green-600">{milestonesCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-xs font-medium text-gray-700">On Track</span>
                      <span className="text-lg font-bold text-blue-600">{milestonesOnTrack}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                      <span className="text-xs font-medium text-gray-700">At Risk</span>
                      <span className="text-lg font-bold text-amber-600">{milestonesAtRisk}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-xs font-medium text-gray-700">Delayed</span>
                      <span className="text-lg font-bold text-red-600">{milestonesDelayed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage Analysis Tab */}
        {activeTab === 'stage' && (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-2 gap-4" style={{ height: '320px' }}>
                {/* PMO Cycle Stage Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">PMO Cycle Stage Distribution</h3>
                  <div className="flex-1" style={{ minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageChartData}>
                        <defs>
                          <linearGradient id="milestoneCompletedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="milestoneOnTrackGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="milestoneAtRiskGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="Completed" stackId="a" fill="url(#milestoneCompletedGradient)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="On Track" stackId="a" fill="url(#milestoneOnTrackGradient)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="At Risk" stackId="a" fill="url(#milestoneAtRiskGradient)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stage Definitions */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">PMO Stage Definitions</h3>
                  <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-3">
                      <li className="p-3 bg-blue-50 rounded">
                        <span className="font-semibold text-blue-900">Initiation</span>
                        <p className="text-xs text-blue-700 mt-1">Requirements gathering & project approval</p>
                      </li>
                      <li className="p-3 bg-purple-50 rounded">
                        <span className="font-semibold text-purple-900">Planning</span>
                        <p className="text-xs text-purple-700 mt-1">Design phase & resource allocation</p>
                      </li>
                      <li className="p-3 bg-green-50 rounded">
                        <span className="font-semibold text-green-900">Execution</span>
                        <p className="text-xs text-green-700 mt-1">Development & delivery phase</p>
                      </li>
                      <li className="p-3 bg-amber-50 rounded">
                        <span className="font-semibold text-amber-900">Monitoring</span>
                        <p className="text-xs text-amber-700 mt-1">Testing & validation phase</p>
                      </li>
                      <li className="p-3 bg-gray-50 rounded">
                        <span className="font-semibold text-gray-900">Closure</span>
                        <p className="text-xs text-gray-700 mt-1">Go-live & handover to operations</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stage Details Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex-shrink-0">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">PMO Stage Breakdown</h3>
                <div className="overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-600">Stage</th>
                        <th className="text-center py-2 font-medium text-gray-600">Total Milestones</th>
                        <th className="text-center py-2 font-medium text-gray-600">Completed</th>
                        <th className="text-center py-2 font-medium text-gray-600">On Track</th>
                        <th className="text-center py-2 font-medium text-gray-600">At Risk</th>
                        <th className="text-right py-2 font-medium text-gray-600">Health %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stageDistribution.map(stage => (
                        <tr key={stage.stage} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2 font-medium text-gray-900">
                            {stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)}
                          </td>
                          <td className="text-center text-gray-700">{stage.count}</td>
                          <td className="text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                              {stage.completed}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                              {stage.onTrack - stage.completed}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
                              {stage.count - stage.onTrack}
                            </span>
                          </td>
                          <td className="text-right text-gray-700 font-medium">
                            {Math.round((stage.onTrack / stage.count) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk & Delays Tab */}
        {activeTab === 'risk' && (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-2 gap-4" style={{ height: '280px' }}>
                {/* At Risk by Department */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">At Risk by Department</h3>
                  <div className="flex-1" style={{ minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={atRiskByDepartment} layout="horizontal">
                        <defs>
                          <linearGradient id="milestoneAtRiskBarGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                            <stop offset="100%" stopColor="#fca5a5" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <YAxis type="category" dataKey="department" width={120} tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                        />
                        <Bar dataKey="count" fill="url(#milestoneAtRiskBarGradient)" radius={[0, 4, 4, 0]} name="At Risk" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Alert Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Risk Summary</h3>
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">{criticalPathAtRisk}</p>
                          <p className="text-xs text-red-700">Critical Path Milestones At Risk</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-amber-600" />
                        <div>
                          <p className="text-2xl font-bold text-amber-600">{milestonesDelayed}</p>
                          <p className="text-xs text-amber-700">Delayed Milestones</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-900">
                        <span className="font-semibold">⚠️ Action Required:</span> Immediate attention needed for {criticalPathAtRisk} critical path milestones to avoid project delays.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Tables Row */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                {/* Top 10 Delayed Milestones */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Top 10 Delayed Milestones</h3>
                  <div className="overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-600">Milestone</th>
                          <th className="text-left py-2 font-medium text-gray-600">Project</th>
                          <th className="text-center py-2 font-medium text-gray-600">Stage</th>
                          <th className="text-center py-2 font-medium text-gray-600">Critical</th>
                          <th className="text-left py-2 font-medium text-gray-600">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {delayedMilestones.map(milestone => (
                          <tr 
                            key={milestone.id} 
                            className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                          >
                            <td className="py-2 font-medium text-gray-900">
                              {milestone.name}
                            </td>
                            <td className="py-2">
                              <Link 
                                to={`/project-details?id=${milestone.projectId}`}
                                className="text-blue-600 hover:underline"
                              >
                                {milestone.projectName}
                              </Link>
                            </td>
                            <td className="text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {milestone.stage}
                              </span>
                            </td>
                            <td className="text-center">
                              {milestone.criticalPath ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 rounded-full font-bold text-xs">
                                  !
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="text-left text-gray-700">
                              {milestone.owner.split(' ')[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Milestones At Risk by Department */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Milestones At Risk by Department</h3>
                  <div className="overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-600">Department</th>
                          <th className="text-right py-2 font-medium text-gray-600">At Risk Count</th>
                          <th className="text-right py-2 font-medium text-gray-600">Critical Path</th>
                          <th className="text-right py-2 font-medium text-gray-600">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atRiskByDepartment.map(dept => (
                          <tr 
                            key={dept.department} 
                            className="border-b border-gray-100 hover:bg-amber-50 transition-colors"
                          >
                            <td className="py-2 font-medium text-gray-900">
                              {dept.department}
                            </td>
                            <td className="text-right">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
                                {dept.count}
                              </span>
                            </td>
                            <td className="text-right">
                              {dept.criticalPath > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-white font-semibold">
                                  {dept.criticalPath}
                                </span>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </td>
                            <td className="text-right text-gray-700 font-medium">
                              {Math.round((dept.count / (milestonesAtRisk + milestonesDelayed)) * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}