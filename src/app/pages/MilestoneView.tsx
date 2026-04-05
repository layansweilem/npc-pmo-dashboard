import { KPICard } from '../components/KPICard';
import { milestones, projects } from '../data/mockData';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, LineChart, Line 
} from 'recharts';
import { Link } from 'react-router';
import { Flag, CheckCircle2, AlertTriangle, Clock, TrendingUp, Info, CalendarCheck, Layers, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { ChartInfoToggle } from '../components/ChartInfoToggle';
import { useLanguage } from '../contexts/LanguageContext';

export function MilestoneView() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'performance' | 'stage' | 'risk'>('performance');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const totalMilestones = milestones.length;
  const milestonesCompleted = milestones.filter(m => m.status === 'completed').length;
  const milestonesOnTrack = milestones.filter(m => m.status === 'on-track').length;
  const milestonesAtRisk = milestones.filter(m => m.status === 'at-risk').length;
  const milestonesDelayed = milestones.filter(m => m.status === 'delayed').length;
  const milestonesUpcoming = milestones.filter(m => m.status === 'upcoming').length;
  const milestoneCompletionRate = totalMilestones > 0 ? Math.round((milestonesCompleted / totalMilestones) * 100) : 0;
  
  const milestoneRAGData = [
    { name: t('ms.completed'), value: milestonesCompleted, color: '#10b981' },
    { name: t('ms.onTrack'), value: milestonesOnTrack, color: '#3b82f6' },
    { name: t('ms.atRisk'), value: milestonesAtRisk, color: '#f59e0b' },
    { name: t('ms.delayed'), value: milestonesDelayed, color: '#ef4444' },
    { name: t('ms.upcoming'), value: milestonesUpcoming, color: '#cbd5e1' },
  ];

  const stageNameMap: Record<string, string> = {
    'initiation': t('ms.initiation'),
    'planning': t('ms.planning'),
    'execution': t('ms.execution'),
    'monitoring': t('ms.monitoring'),
    'closure': t('ms.closure'),
  };
  
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
    name: stageNameMap[s.stage] || s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    Total: s.count,
    Completed: s.completed,
    'On Track': s.onTrack - s.completed,
    'At Risk': s.count - s.onTrack,
  })).sort((a, b) => b.Total - a.Total);
  
  const delayedMilestones = milestones
    .filter(m => m.status === 'delayed')
    .map(m => {
      const project = projects.find(p => p.id === m.projectId);
      return { ...m, projectName: project?.name || t('common.unknown'), projectStatus: project?.status };
    })
    .slice(0, 10);
  
  const atRiskByDepartment = milestones
    .filter(m => m.status === 'at-risk' || m.status === 'delayed')
    .reduce((acc, m) => {
      const project = projects.find(p => p.id === m.projectId);
      const dept = project?.portfolio || t('common.unknown');
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

  const translateMonth = (month: string) => {
    if (language !== 'ar') return month;
    const parts = month.split(' ');
    const monthName = parts[0];
    const year = parts[1] || '';
    const map: Record<string, string> = {
      'Oct': t('month.oct'), 'Nov': t('month.nov'), 'Dec': t('month.dec'),
      'Jan': t('month.jan'), 'Feb': t('month.feb'), 'Mar': t('month.mar'),
    };
    return (map[monthName] || monthName) + (year ? ' ' + year : '');
  };
  
  const milestoneCompletionTrend = [
    { month: 'Oct 2025', planned: 15, actual: 12 },
    { month: 'Nov 2025', planned: 18, actual: 16 },
    { month: 'Dec 2025', planned: 20, actual: 19 },
    { month: 'Jan 2026', planned: 22, actual: 21 },
    { month: 'Feb 2026', planned: 19, actual: 18 },
    { month: 'Mar 2026', planned: 21, actual: 19 },
  ];
  
  const criticalPathCount = milestones.filter(m => m.criticalPath).length;
  const criticalPathAtRisk = milestones.filter(m => m.criticalPath && (m.status === 'delayed' || m.status === 'at-risk')).length;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      <div className="mb-5 flex-shrink-0 bg-white rounded-xl border border-gray-200/80 shadow-sm p-4">
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#8A1538]"></div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('ms.milestoneStatusOverview')}</h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-1.5">
            <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                  <Flag className="w-4 h-4 text-[#8A1538]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.totalMilestones')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('totalMilestones')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'totalMilestones' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.totalMilestones')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{totalMilestones}</p>
                  <p className="text-[9px] text-gray-400">{criticalPathCount} {t('ms.criticalPathSub')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-green-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.completed')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('completed')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'completed' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.completed')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600 leading-tight">{milestonesCompleted}</p>
                  <p className="text-[9px] text-gray-400">{Math.round((milestonesCompleted / totalMilestones) * 100)}% {t('ms.ofTotal')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-blue-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.onTrack')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('onTrack')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'onTrack' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.onTrack')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600 leading-tight">{milestonesOnTrack}</p>
                  <p className="text-[9px] text-gray-400">{Math.round((milestonesOnTrack / totalMilestones) * 100)}% {t('ms.ofTotal')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-amber-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.atRisk')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('atRisk')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'atRisk' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.atRisk')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-amber-600 leading-tight">{milestonesAtRisk}</p>
                  <p className="text-[9px] text-gray-400">{criticalPathAtRisk} {t('ms.criticalPathSub')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-red-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.delayed')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('delayed')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'delayed' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.delayed')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-red-600 leading-tight">{milestonesDelayed}</p>
                  <p className="text-[9px] text-gray-400">{t('ms.requiresAction')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-gray-400 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Flag className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.upcoming')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('upcoming')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'upcoming' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.upcoming')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{milestonesUpcoming}</p>
                  <p className="text-[9px] text-gray-400">{t('ms.next30Days')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#8A1538]"></div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('ms.criticalPathHealth')}</h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-1.5">
            <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-[#8A1538]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.totalCriticalPath')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('totalCriticalPath')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'totalCriticalPath' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.totalCriticalPath')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{criticalPathCount}</p>
                  <p className="text-[9px] text-gray-400">{Math.round((criticalPathCount / totalMilestones) * 100)}% {t('ms.ofTotal')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-green-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.criticalPathOnTrack')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('criticalPathOnTrack')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'criticalPathOnTrack' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.criticalPathOnTrack')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600 leading-tight">{criticalPathCount - criticalPathAtRisk}</p>
                  <p className="text-[9px] text-green-600">
                    {Math.round(((criticalPathCount - criticalPathAtRisk) / criticalPathCount) * 100)}% {t('ms.healthy')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-red-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.criticalPathAtRisk')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('criticalPathAtRisk')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'criticalPathAtRisk' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.criticalPathAtRisk')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-red-600 leading-tight">{criticalPathAtRisk}</p>
                  <p className="text-[9px] text-red-600">{t('ms.immediateAction')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#8A1538]"></div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('ms.deliveryPerformance')}</h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-1.5">
            <div className="bg-white rounded-lg border-l-[3px] border-l-green-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.completionRate')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('completionRate')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'completionRate' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.completionRate')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{milestoneCompletionRate}%</p>
                  <p className="text-[9px] text-green-600">{t('ms.vsLastMonth')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-gray-400 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Flag className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.plannedYTD')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('plannedYTD')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'plannedYTD' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.plannedYTD')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">115</p>
                  <p className="text-[9px] text-gray-400">{t('ms.totalPlanned')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#8A1538]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.actualYTD')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('actualYTD')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'actualYTD' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.actualYTD')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold leading-tight" style={{ color: '#8A1538' }}>105</p>
                  <p className="text-[9px] text-amber-600">{t('ms.ofPlanned')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-green-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.onTimeDelivery')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('onTimeDelivery')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'onTimeDelivery' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.onTimeDelivery')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600 leading-tight">87%</p>
                  <p className="text-[9px] text-green-600">{t('ms.improvement')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-l-[3px] border-l-amber-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500 font-medium">{t('ms.averageDelay')}</p>
                    <div className="relative">
                      <Info 
                        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setActiveTooltip('avgDelay')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {activeTooltip === 'avgDelay' && (
                        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                          <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                          <div className="text-gray-200">{t('ms.tooltip.avgDelay')}</div>
                          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-amber-600 leading-tight">8</p>
                  <p className="text-[9px] text-gray-400">{t('ms.forDelayedItems')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-shrink-0 bg-white rounded-xl p-1.5 border border-gray-200/80 shadow-sm">
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'performance'
              ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
              : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          {t('ms.milestonePerformance')}
        </button>
        <button
          onClick={() => setActiveTab('stage')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'stage'
              ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
              : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          {t('ms.stageAnalysis')}
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'risk'
              ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
              : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          {t('ms.riskDelays')}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'performance' && (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-5 p-4">
              <div className="grid grid-cols-3 gap-4" style={{ height: '300px' }}>
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.ragDistribution')} <ChartInfoToggle description={t('ms.chart.ragDistDesc')} /></h3>
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

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.criticalPathStatus')} <ChartInfoToggle description={t('ms.chart.critPathDesc')} /></h3>
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{t('ms.totalCriticalPathLabel')}</span>
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
                        <p className="text-xs text-gray-600">{t('ms.onTrack')}</p>
                        <p className="text-lg font-bold text-green-600">{criticalPathCount - criticalPathAtRisk}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs text-gray-600">{t('ms.atRisk')}</p>
                        <p className="text-lg font-bold text-red-600">{criticalPathAtRisk}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.completionTrend')} <ChartInfoToggle description={t('ms.chart.completionTrendDesc')} /></h3>
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
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6b7280" tickFormatter={translateMonth} />
                        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                          labelFormatter={translateMonth}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="planned" 
                          stroke="#64748b" 
                          strokeWidth={2} 
                          name={t('ms.planned')}
                          dot={{ fill: '#64748b', r: 3 }}
                          fill="url(#plannedMilestoneGradient)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#8A1538" 
                          strokeWidth={2} 
                          name={t('ms.actual')}
                          dot={{ fill: '#8A1538', r: 3 }}
                          fill="url(#actualMilestoneGradient)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.completionMetrics')} <ChartInfoToggle description={t('ms.chart.completionMetricsDesc')} /></h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">{t('ms.plannedYTD')}</p>
                      <p className="text-2xl font-bold text-gray-900">115</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">{t('ms.actualYTD')}</p>
                      <p className="text-2xl font-bold" style={{ color: '#8A1538' }}>105</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded col-span-2">
                      <p className="text-xs text-gray-600 mb-1">{t('ms.completionRate')}</p>
                      <p className="text-2xl font-bold text-green-600">{milestoneCompletionRate}%</p>
                      <p className="text-xs text-green-600 mt-1">{t('ms.vsLastMonth')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.statusBreakdown')} <ChartInfoToggle description={t('ms.chart.statusBreakdownDesc')} /></h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-xs font-medium text-gray-700">{t('ms.completed')}</span>
                      <span className="text-lg font-bold text-green-600">{milestonesCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-xs font-medium text-gray-700">{t('ms.onTrack')}</span>
                      <span className="text-lg font-bold text-blue-600">{milestonesOnTrack}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                      <span className="text-xs font-medium text-gray-700">{t('ms.atRisk')}</span>
                      <span className="text-lg font-bold text-amber-600">{milestonesAtRisk}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-xs font-medium text-gray-700">{t('ms.delayed')}</span>
                      <span className="text-lg font-bold text-red-600">{milestonesDelayed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stage' && (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-5 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col" style={{ height: '300px' }}>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.pmoCycleStageDistribution')} <ChartInfoToggle description={t('ms.chart.stageDistDesc')} /></h3>
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
                        <Bar dataKey="Completed" name={t('ms.completed')} stackId="a" fill="url(#milestoneCompletedGradient)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="On Track" name={t('ms.onTrack')} stackId="a" fill="url(#milestoneOnTrackGradient)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="At Risk" name={t('ms.atRisk')} stackId="a" fill="url(#milestoneAtRiskGradient)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col" style={{ height: '300px' }}>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('ms.pmoStageDefinitions')}</h3>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="p-2.5 bg-blue-50 rounded">
                      <span className="font-semibold text-blue-900 text-sm">{t('ms.initiation')}</span>
                      <p className="text-xs text-blue-700 mt-0.5">{t('ms.initiationDesc')}</p>
                    </div>
                    <div className="p-2.5 bg-purple-50 rounded">
                      <span className="font-semibold text-purple-900 text-sm">{t('ms.planning')}</span>
                      <p className="text-xs text-purple-700 mt-0.5">{t('ms.planningDesc')}</p>
                    </div>
                    <div className="p-2.5 bg-green-50 rounded">
                      <span className="font-semibold text-green-900 text-sm">{t('ms.execution')}</span>
                      <p className="text-xs text-green-700 mt-0.5">{t('ms.executionDesc')}</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded">
                      <span className="font-semibold text-amber-900 text-sm">{t('ms.monitoring')}</span>
                      <p className="text-xs text-amber-700 mt-0.5">{t('ms.monitoringDesc')}</p>
                    </div>
                    <div className="p-2.5 bg-gray-100 rounded">
                      <span className="font-semibold text-gray-900 text-sm">{t('ms.closure')}</span>
                      <p className="text-xs text-gray-700 mt-0.5">{t('ms.closureDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.pmoStageBreakdown')} <ChartInfoToggle description={t('ms.chart.stageBreakdownDesc')} /></h3>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.stageCol')}</th>
                        <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.totalCol')}</th>
                        <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.completedCol')}</th>
                        <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.onTrackCol')}</th>
                        <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.atRiskCol')}</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.healthPctCol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stageDistribution.map(stage => (
                        <tr key={stage.stage} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2 font-medium text-gray-900">
                            {stageNameMap[stage.stage] || stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)}
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

        {activeTab === 'risk' && (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-5 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col" style={{ height: '300px' }}>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.atRiskByDepartment')} <ChartInfoToggle description={t('ms.chart.atRiskByDeptDesc')} /></h3>
                  <div className="flex-1" style={{ minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={atRiskByDepartment} barCategoryGap="20%">
                        <defs>
                          <linearGradient id="milestoneAtRiskBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                            <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="milestoneCriticalBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8A1538" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a91d47" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="count" fill="url(#milestoneAtRiskBarGradient)" radius={[4, 4, 0, 0]} name={t('ms.atRisk')} />
                        <Bar dataKey="criticalPath" fill="url(#milestoneCriticalBarGradient)" radius={[4, 4, 0, 0]} name={t('ms.criticalPathCol')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col" style={{ height: '300px' }}>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.riskSummary')} <ChartInfoToggle description={t('ms.chart.riskSummaryDesc')} /></h3>
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">{criticalPathAtRisk}</p>
                          <p className="text-xs text-red-700">{t('ms.critPathMilestonesAtRisk')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-amber-600" />
                        <div>
                          <p className="text-2xl font-bold text-amber-600">{milestonesDelayed}</p>
                          <p className="text-xs text-amber-700">{t('ms.delayedMilestonesLabel')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-900">
                        <span className="font-semibold">{t('ms.actionRequired')}</span> {t('ms.actionRequiredText1')} {criticalPathAtRisk} {t('ms.actionRequiredText2')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.top10Delayed')} <ChartInfoToggle description={t('ms.chart.top10DelayedDesc')} /></h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                          <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.milestoneCol')}</th>
                          <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.projectCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.stageCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.criticalCol')}</th>
                          <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.ownerCol')}</th>
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
                                {stageNameMap[milestone.stage] || milestone.stage}
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

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('ms.atRiskByDeptTable')} <ChartInfoToggle description={t('ms.chart.atRiskByDeptTableDesc')} /></h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                          <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.departmentCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.atRiskCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.criticalPathCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('ms.pctOfTotalCol')}</th>
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
