import { DashboardHeader } from '../components/DashboardHeader';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { projects, portfolioTrends, milestones } from '../data/mockData';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Link } from 'react-router';
import { AlertTriangle, TrendingUp, DollarSign, Target, Flag, CheckCircle2, Filter, Info, LayoutDashboard, CalendarCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MilestoneView } from './MilestoneView';
import { InfoTooltip } from '../components/InfoTooltip';
import { ChartInfoToggle } from '../components/ChartInfoToggle';

export function ExecutiveOverview() {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'portfolio' | 'milestone'>('portfolio');
  const [activeTab, setActiveTab] = useState<'performance' | 'cycle' | 'department'>('performance');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tableClassFilter, setTableClassFilter] = useState<'all' | 'National' | 'Council'>('all');
  
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    if (selectedDepartment) {
      filtered = filtered.filter(p => p.department === selectedDepartment);
    }
    
    return filtered;
  }, [selectedStatus, selectedDepartment]);

  const totalProjects = filteredProjects.length;
  const onTrack = filteredProjects.filter(p => p.status === 'on-track').length;
  const atRisk = filteredProjects.filter(p => p.status === 'at-risk').length;
  const critical = filteredProjects.filter(p => p.status === 'critical').length;
  
  const avgSPI = totalProjects > 0 ? (filteredProjects.reduce((sum, p) => sum + p.spi, 0) / totalProjects).toFixed(2) : '0.00';
  const avgCPI = totalProjects > 0 ? (filteredProjects.reduce((sum, p) => sum + p.cpi, 0) / totalProjects).toFixed(2) : '0.00';
  
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
  const totalForecast = filteredProjects.reduce((sum, p) => sum + p.forecast, 0);
  const budgetVariance = totalForecast - totalBudget;

  const classFilteredProjects = useMemo(() => {
    if (tableClassFilter === 'all') return filteredProjects;
    return filteredProjects.filter(p => p.classification.type === tableClassFilter);
  }, [filteredProjects, tableClassFilter]);

  const overBudgetProjects = useMemo(() => {
    return classFilteredProjects
      .filter(p => p.forecast > p.budget)
      .sort((a, b) => (b.forecast - b.budget) - (a.forecast - a.budget))
      .slice(0, 5);
  }, [classFilteredProjects]);

  const delayedProjects = useMemo(() => {
    return classFilteredProjects
      .filter(p => p.sv < 0)
      .sort((a, b) => a.sv - b.sv)
      .slice(0, 5);
  }, [classFilteredProjects]);

  const statusData = [
    { name: t('exec.onTrack'), value: onTrack, color: '#10b981' },
    { name: t('exec.atRisk'), value: atRisk, color: '#f59e0b' },
    { name: t('exec.critical'), value: critical, color: '#ef4444' },
  ];

  const initiativeData = filteredProjects.reduce((acc, p) => {
    const existing = acc.find(i => i.name === p.strategicInitiative);
    if (existing) {
      existing.total++;
      if (p.status === 'on-track') existing.onTrack++;
    } else {
      acc.push({
        name: p.strategicInitiative,
        total: 1,
        onTrack: p.status === 'on-track' ? 1 : 0,
      });
    }
    return acc;
  }, [] as Array<{ name: string; total: number; onTrack: number }>);

  const initiativeChartData = initiativeData.map(i => ({
    name: i.name,
    'Alignment %': Math.round((i.onTrack / i.total) * 100),
  }));

  const budgetBurnData = [{
    category: t('exec.budgetCol'),
    Planned: totalBudget / 1000000,
    Actual: totalSpent / 1000000,
    Forecast: totalForecast / 1000000,
  }];
  
  const totalMilestones = milestones.length;
  const milestonesCompleted = milestones.filter(m => m.status === 'completed').length;
  const milestonesOnTrack = milestones.filter(m => m.status === 'on-track').length;
  const milestonesAtRisk = milestones.filter(m => m.status === 'at-risk').length;
  const milestonesDelayed = milestones.filter(m => m.status === 'delayed').length;
  
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

  const stageNameMap: Record<string, string> = {
    'initiation': t('ms.initiation'),
    'planning': t('ms.planning'),
    'execution': t('ms.execution'),
    'monitoring': t('ms.monitoring'),
    'closure': t('ms.closure'),
  };
  
  const stageChartData = stageDistribution.map(s => ({
    name: stageNameMap[s.stage] || s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    Total: s.count,
    Completed: s.completed,
    'On Track': s.onTrack - s.completed,
    'At Risk': s.count - s.onTrack,
  }));
  
  const departmentData = filteredProjects.reduce((acc, p) => {
    const existing = acc.find(d => d.name === p.portfolio);
    if (existing) {
      existing.total++;
      existing.budget += p.budget;
      existing.spent += p.spent;
      if (p.status === 'on-track') existing.onTrack++;
      if (p.status === 'at-risk') existing.atRisk++;
      if (p.status === 'critical') existing.critical++;
    } else {
      acc.push({
        name: p.portfolio,
        total: 1,
        budget: p.budget,
        spent: p.spent,
        onTrack: p.status === 'on-track' ? 1 : 0,
        atRisk: p.status === 'at-risk' ? 1 : 0,
        critical: p.status === 'critical' ? 1 : 0,
      });
    }
    return acc;
  }, [] as Array<{ name: string; total: number; budget: number; spent: number; onTrack: number; atRisk: number; critical: number }>);
  
  const departmentChartData = departmentData.map(d => ({
    name: d.name,
    'On Track': d.onTrack,
    'At Risk': d.atRisk,
    'Critical': d.critical,
    'Health %': Math.round((d.onTrack / d.total) * 100),
  }));
  
  const departmentBudgetData = departmentData.map(d => ({
    name: d.name,
    Budget: d.budget / 1000000,
    Spent: d.spent / 1000000,
    'Utilization %': Math.round((d.spent / d.budget) * 100),
  }));

  const translateMonth = (month: string) => {
    if (language !== 'ar') return month;
    const map: Record<string, string> = {
      'Oct': t('month.oct'), 'Nov': t('month.nov'), 'Dec': t('month.dec'),
      'Jan': t('month.jan'), 'Feb': t('month.feb'), 'Mar': t('month.mar'),
    };
    return map[month] || month;
  };
  
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title={t('exec.title')}
        subtitle={t('exec.subtitle')}
      />

      <div className="bg-white border-b border-gray-200 px-8 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('portfolio')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              viewMode === 'portfolio'
                ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
                : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('exec.portfolioView')}
          </button>
          <button
            onClick={() => setViewMode('milestone')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              viewMode === 'milestone'
                ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
                : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            {t('exec.milestoneView')}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        
        <div 
          className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${
            viewMode === 'portfolio' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <div className="mb-5 flex-shrink-0 bg-white rounded-xl border border-gray-200/80 shadow-sm p-4">
            
            {(selectedStatus || selectedDepartment) && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">{t('exec.activeFiltersLabel')}</span>
                {selectedStatus && (
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    {t('exec.statusFilter')} {selectedStatus}
                    <span className="text-blue-800">×</span>
                  </button>
                )}
                {selectedDepartment && (
                  <button
                    onClick={() => setSelectedDepartment(null)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    {t('exec.deptFilter')} {selectedDepartment}
                    <span className="text-blue-800">×</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedStatus(null);
                    setSelectedDepartment(null);
                  }}
                  className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t('exec.clearAll')}
                </button>
              </div>
            )}
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-[#8A1538]"></div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('exec.portfolioHealthSection')}</h3>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-1.5">
                <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-[#8A1538]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.portfolioHealthPct')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('portfolioHealth')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'portfolioHealth' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.portfolioHealth')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">{Math.round((onTrack / totalProjects) * 100)}%</p>
                      <p className="text-[9px] text-gray-400">{onTrack}/{totalProjects} {t('exec.onTrackSub')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border-l-[3px] border-l-blue-500 border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.totalActiveProjects')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('totalProjects')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'totalProjects' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.totalProjects')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">{totalProjects}</p>
                      <p className="text-[9px] text-green-600">{t('exec.vsLastQuarterPlus3')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.onTrackProjectsPct')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('onTrackPct')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'onTrackPct' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.onTrackPct')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600 leading-tight">{Math.round((onTrack / totalProjects) * 100)}%</p>
                      <p className="text-[9px] text-gray-400">{onTrack} {t('exec.projectsCount')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.criticalProjects')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('critical')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'critical' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.critical')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-600 leading-tight">{critical}</p>
                      <p className="text-[9px] text-gray-400">{t('exec.immediateAction')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.openRisksLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('openRisks')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'openRisks' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.openRisks')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-amber-600 leading-tight">{atRisk + critical}</p>
                      <p className="text-[9px] text-gray-400">{atRisk} {t('exec.atRiskPlusCriticalSub')} + {critical} {t('exec.criticalSub')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-[#8A1538]"></div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('exec.financialPerformance')}</h3>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-1.5">
                <div className={`bg-white rounded-lg border-l-[3px] ${Number(avgSPI) >= 1 ? 'border-l-green-500' : Number(avgSPI) >= 0.85 ? 'border-l-amber-500' : 'border-l-red-500'} border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${Number(avgSPI) >= 1 ? 'bg-green-50' : Number(avgSPI) >= 0.85 ? 'bg-amber-50' : 'bg-red-50'} flex items-center justify-center flex-shrink-0`}>
                      <TrendingUp className={`w-4 h-4 ${Number(avgSPI) >= 1 ? 'text-green-600' : Number(avgSPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.portfolioSPI')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('spi')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'spi' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.spi')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xl font-bold leading-tight ${Number(avgSPI) >= 1 ? 'text-green-600' : Number(avgSPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`}>{avgSPI}</p>
                      <p className="text-[9px] text-gray-400">{t('exec.schedulePerformanceSub')}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`bg-white rounded-lg border-l-[3px] ${Number(avgCPI) >= 1 ? 'border-l-green-500' : Number(avgCPI) >= 0.85 ? 'border-l-amber-500' : 'border-l-red-500'} border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${Number(avgCPI) >= 1 ? 'bg-green-50' : Number(avgCPI) >= 0.85 ? 'bg-amber-50' : 'bg-red-50'} flex items-center justify-center flex-shrink-0`}>
                      <DollarSign className={`w-4 h-4 ${Number(avgCPI) >= 1 ? 'text-green-600' : Number(avgCPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.portfolioCPI')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('cpi')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'cpi' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.cpi')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xl font-bold leading-tight ${Number(avgCPI) >= 1 ? 'text-green-600' : Number(avgCPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`}>{avgCPI}</p>
                      <p className="text-[9px] text-gray-400">{t('exec.costPerformanceSub')}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`bg-white rounded-lg border-l-[3px] ${budgetVariance > 0 ? 'border-l-red-500' : 'border-l-green-500'} border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${budgetVariance > 0 ? 'bg-red-50' : 'bg-green-50'} flex items-center justify-center flex-shrink-0`}>
                      <DollarSign className={`w-4 h-4 ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.budgetVarianceLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('budgetVariance')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'budgetVariance' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.budgetVariance')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xl font-bold leading-tight ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${(Math.abs(budgetVariance) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-[9px] text-gray-400">{budgetVariance > 0 ? t('exec.overBudgetSub') : t('exec.underBudgetSub')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-[#8A1538]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.forecastAccuracyLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('forecastAccuracy')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'forecastAccuracy' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.forecastAccuracy')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">94%</p>
                      <p className="text-[9px] text-green-600">{t('exec.vsLastQuarterPlus2')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-[#8A1538]"></div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('exec.milestoneDeliverySection')}</h3>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-1.5">
                <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-[#8A1538]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.totalMilestonesLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('totalMilestones')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'totalMilestones' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.totalMilestones')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">{totalMilestones}</p>
                      <p className="text-[9px] text-gray-400">{t('exec.acrossAllProjects')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.milestonesOnTrackLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestonesOnTrack')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestonesOnTrack' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.milestonesOnTrack')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-blue-600 leading-tight">{milestonesOnTrack}</p>
                      <p className="text-[9px] text-gray-400">{Math.round((milestonesOnTrack / totalMilestones) * 100)}% {t('exec.ofTotal')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.milestonesAtRiskLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestonesAtRisk')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestonesAtRisk' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.milestonesAtRisk')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-amber-600 leading-tight">{milestonesAtRisk}</p>
                      <p className="text-[9px] text-gray-400">{t('exec.needsAttention')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.milestonesDelayedLabel')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestonesDelayed')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestonesDelayed' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.milestonesDelayed')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-600 leading-tight">{milestonesDelayed}</p>
                      <p className="text-[9px] text-gray-400">{t('exec.pastDueDate')}</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">{t('exec.milestoneCompletionPct')}</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestoneCompletion')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestoneCompletion' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">{t('tooltip.howCalculated')}</div>
                              <div className="text-gray-200">{t('tooltip.milestoneCompletion')}</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600 leading-tight">
                        {Math.round((milestonesCompleted / totalMilestones) * 100)}%
                      </p>
                      <p className="text-[9px] text-gray-400">{milestonesCompleted} {t('exec.completedSub')}</p>
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
              <TrendingUp className="w-4 h-4" />
              {t('exec.portfolioPerformance')}
            </button>
            <button
              onClick={() => setActiveTab('cycle')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'cycle'
                  ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
                  : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Target className="w-4 h-4" />
              {t('exec.pmoCycleHealth')}
            </button>
            <button
              onClick={() => setActiveTab('department')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'department'
                  ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
                  : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('exec.departmentDistribution')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'performance' && (
              <div className="flex flex-col gap-5 p-4 pb-6">
                <div className="grid grid-cols-3 gap-4" style={{ height: '280px' }}>
                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 h-full flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.statusDistribution')} <ChartInfoToggle description={t('chart.statusDistDesc')} /></h3>
                    <div className="flex-1" style={{ minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 h-full flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.spiCpiTrend')} <ChartInfoToggle description={t('chart.spiCpiTrendDesc')} /></h3>
                    <div className="flex-1" style={{ minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={portfolioTrends}>
                          <defs>
                            <linearGradient id="execSpiGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8A1538" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8A1538" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="execCpiGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6b7280" tickFormatter={translateMonth} />
                          <YAxis domain={[0.8, 1.1]} tick={{ fontSize: 10 }} stroke="#6b7280" />
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
                            dataKey="spi" 
                            stroke="#8A1538" 
                            strokeWidth={2} 
                            name="SPI"
                            dot={{ fill: '#8A1538', r: 3 }}
                            fill="url(#execSpiGradient)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cpi" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            name="CPI"
                            dot={{ fill: '#10b981', r: 3 }}
                            fill="url(#execCpiGradient)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 h-full flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.strategicAlignmentPct')} <ChartInfoToggle description={t('chart.strategicAlignDesc')} /></h3>
                    <div className="flex-1" style={{ minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={initiativeChartData} layout="vertical">
                          <defs>
                            <linearGradient id="alignmentGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                              <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#6b7280" />
                          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10 }} stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '11px'
                            }}
                          />
                          <Bar dataKey="Alignment %" name={t('exec.alignmentPct')} fill="url(#alignmentGradient)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-3">
                    {(['all', 'National', 'Council'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setTableClassFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          tableClassFilter === filter
                            ? 'bg-[#8A1538] text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {filter === 'all' ? t('common.all') : filter === 'National' ? t('common.national') : t('common.council')}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.overBudgetProjectsTitle')} <ChartInfoToggle description={t('chart.overBudgetDesc')} /></h3>
                    <div className="overflow-hidden rounded-lg border border-gray-100">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.projectCol')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.budgetCol')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.forecastCol')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.varianceCol')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overBudgetProjects.map(project => (
                            <tr 
                              key={project.id} 
                              className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                            >
                              <td className="py-2">
                                <div className="flex items-center gap-1.5">
                                  <Link 
                                    to={`/project-details?id=${project.id}`}
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {project.name}
                                  </Link>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    project.classification.type === 'National' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {project.classification.type}
                                  </span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{project.classification.dgCode} · {project.classification.nscCode}</div>
                              </td>
                              <td className="text-right text-gray-900">
                                ${(project.budget / 1000000).toFixed(1)}M
                              </td>
                              <td className="text-right text-red-600 font-medium">
                                ${(project.forecast / 1000000).toFixed(1)}M
                              </td>
                              <td className="text-right text-red-600 font-semibold">
                                +${((project.forecast - project.budget) / 1000000).toFixed(1)}M
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.delayedProjectsTitle')} <ChartInfoToggle description={t('chart.delayedDesc')} /></h3>
                    <div className="overflow-hidden rounded-lg border border-gray-100">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.projectCol')}</th>
                            <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.statusCol')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.spiCol')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.delayCol')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.pmCol')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {delayedProjects.map(project => (
                            <tr 
                              key={project.id} 
                              className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                            >
                              <td className="py-2">
                                <div className="flex items-center gap-1.5">
                                  <Link 
                                    to={`/project-details?id=${project.id}`}
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {project.name}
                                  </Link>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    project.classification.type === 'National' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {project.classification.type}
                                  </span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{project.classification.dgCode} · {project.classification.nscCode}</div>
                              </td>
                              <td className="text-center">
                                <StatusBadge status={project.status} size="sm" />
                              </td>
                              <td className="text-right text-red-600 font-medium">
                                {project.spi.toFixed(2)}
                              </td>
                              <td className="text-right text-red-600 font-semibold">
                                {Math.abs(project.sv)}{t('common.daysShort')}
                              </td>
                              <td className="text-right text-gray-700">
                                {project.projectManager.split(' ')[0]}
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

            {activeTab === 'cycle' && (
              <div className="flex flex-col gap-5 p-4 pb-6">
                <div className="grid grid-cols-3 gap-4" style={{ height: '400px' }}>
                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.pmoCycleStageDistribution')} <ChartInfoToggle description={t('chart.pmoCycleStageDesc')} /></h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stageChartData}>
                          <defs>
                            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                              <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="onTrackGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="atRiskGradient" x1="0" y1="0" x2="0" y2="1">
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
                          <Bar dataKey="Completed" name={t('exec.completed')} stackId="a" fill="url(#completedGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="On Track" name={t('exec.onTrack')} stackId="a" fill="url(#onTrackGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="At Risk" name={t('exec.atRisk')} stackId="a" fill="url(#atRiskGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.milestoneStatusSummary')} <ChartInfoToggle description={t('chart.milestoneStatusDesc')} /></h3>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{t('exec.completed')}</span>
                        <span className="text-2xl font-bold text-green-600">{milestonesCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{t('exec.onTrack')}</span>
                        <span className="text-2xl font-bold text-blue-600">{milestonesOnTrack}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{t('exec.atRisk')}</span>
                        <span className="text-2xl font-bold text-amber-600">{milestonesAtRisk}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{t('exec.delayed')}</span>
                        <span className="text-2xl font-bold text-red-600">{milestonesDelayed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.pmoStageBreakdown')} <ChartInfoToggle description={t('chart.pmoStageBreakdownDesc')} /></h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                          <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.stageCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.totalCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.completedCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.onTrackCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.atRiskCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.healthPctCol')}</th>
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
            )}

            {activeTab === 'department' && (
              <div className="flex flex-col gap-5 p-4 pb-6">
                <div className="grid grid-cols-2 gap-4" style={{ height: '400px' }}>
                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.departmentHealthStatus')} <ChartInfoToggle description={t('chart.deptHealthDesc')} /></h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentChartData}>
                          <defs>
                            <linearGradient id="onTrackDeptGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                              <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="atRiskDeptGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                              <stop offset="100%" stopColor="#fbbf24" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="criticalDeptGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                              <stop offset="100%" stopColor="#fca5a5" stopOpacity={1} />
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
                          <Bar dataKey="On Track" name={t('exec.onTrack')} stackId="a" fill="url(#onTrackDeptGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="At Risk" name={t('exec.atRisk')} stackId="a" fill="url(#atRiskDeptGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Critical" name={t('exec.critical')} stackId="a" fill="url(#criticalDeptGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.departmentBudgetUtil')} <ChartInfoToggle description={t('chart.deptBudgetDesc')} /></h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentBudgetData} layout="horizontal">
                          <defs>
                            <linearGradient id="budgetDeptGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#64748b" stopOpacity={1} />
                              <stop offset="100%" stopColor="#cbd5e1" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="spentDeptGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8A1538" stopOpacity={1} />
                              <stop offset="100%" stopColor="#c9395f" stopOpacity={1} />
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
                          <Bar dataKey="Budget" name={t('exec.budgetLabel')} fill="url(#budgetDeptGradient)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Spent" name={t('exec.spentLabel')} fill="url(#spentDeptGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">{t('exec.departmentPortfolioSummary')} <ChartInfoToggle description={t('chart.deptSummaryDesc')} /></h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                          <th className="text-left py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.departmentCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.totalCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.onTrackCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.atRiskCol')}</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.criticalCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.budgetMCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.spentMCol')}</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t('exec.healthPctCol')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentData.map(dept => (
                          <tr key={dept.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-2 font-medium text-gray-900">{dept.name}</td>
                            <td className="text-center text-gray-700">{dept.total}</td>
                            <td className="text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                                {dept.onTrack}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-700 font-semibold">
                                {dept.atRisk}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
                                {dept.critical}
                              </span>
                            </td>
                            <td className="text-right text-gray-700">${(dept.budget / 1000000).toFixed(1)}M</td>
                            <td className="text-right font-medium" style={{ color: '#8A1538' }}>
                              ${(dept.spent / 1000000).toFixed(1)}M
                            </td>
                            <td className="text-right">
                              <span className={`font-semibold ${
                                Math.round((dept.onTrack / dept.total) * 100) >= 60 
                                  ? 'text-green-600' 
                                  : Math.round((dept.onTrack / dept.total) * 100) >= 40 
                                  ? 'text-amber-600' 
                                  : 'text-red-600'
                              }`}>
                                {Math.round((dept.onTrack / dept.total) * 100)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        <div 
          className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${
            viewMode === 'milestone' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <MilestoneView />
        </div>
      </div>
    </div>
  );
}
