import { DashboardHeader } from '../components/DashboardHeader';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { projects, portfolioTrends, milestones } from '../data/mockData';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Link } from 'react-router';
import { AlertTriangle, TrendingUp, DollarSign, Target, Flag, CheckCircle2, Filter, Info, Languages, LayoutDashboard, CalendarCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MilestoneView } from './MilestoneView';
import { InfoTooltip } from '../components/InfoTooltip';
import { ChartInfoToggle } from '../components/ChartInfoToggle';

export function ExecutiveOverview() {
  const { t, language, toggleLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState<'portfolio' | 'milestone'>('portfolio');
  const [activeTab, setActiveTab] = useState<'performance' | 'cycle' | 'department'>('performance');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Filter projects based on selections
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

  // Calculate KPIs
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

  // Top 5 over-budget projects
  const overBudgetProjects = useMemo(() => {
    return filteredProjects
      .filter(p => p.forecast > p.budget)
      .sort((a, b) => (b.forecast - b.budget) - (a.forecast - a.budget))
      .slice(0, 5);
  }, [filteredProjects]);

  // Top 5 delayed projects
  const delayedProjects = useMemo(() => {
    return filteredProjects
      .filter(p => p.sv < 0)
      .sort((a, b) => a.sv - b.sv)
      .slice(0, 5);
  }, [filteredProjects]);

  // Status distribution
  const statusData = [
    { name: 'On Track', value: onTrack, color: '#10b981' },
    { name: 'At Risk', value: atRisk, color: '#f59e0b' },
    { name: 'Critical', value: critical, color: '#ef4444' },
  ];

  // Strategic alignment
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

  // Budget burn vs progress
  const budgetBurnData = [{
    category: 'Budget',
    Planned: totalBudget / 1000000,
    Actual: totalSpent / 1000000,
    Forecast: totalForecast / 1000000,
  }];
  
  // PMO Cycle Health data
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
  
  const stageChartData = stageDistribution.map(s => ({
    name: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    Total: s.count,
    Completed: s.completed,
    'On Track': s.onTrack - s.completed,
    'At Risk': s.count - s.onTrack,
  }));
  
  // Department Distribution data
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
  
  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <DashboardHeader 
          title={t('exec.title')}
          subtitle={t('exec.subtitle')}
          hideLanguageToggle
        />
        
        {/* Language Toggle - Top Right */}
        <div className="absolute right-6 top-6 z-10 flex flex-col items-end gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
            title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            <Languages className="w-4 h-4" style={{ color: '#8A1538' }} />
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          </button>
        </div>
      </div>

      {/* Portfolio / Milestone View Tabs */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-8 py-2">
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
            Portfolio View
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
            Milestone View
          </button>
        </div>
      </div>
      
      {/* Main Content Area - Both Containers Always Exist */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* Portfolio View Container */}
        <div 
          className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${
            viewMode === 'portfolio' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Scrollable wrapper for Portfolio View */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Grouped Multi-Row KPI Container */}
            <div className="mb-4 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 p-3">
            
            {/* Interactive Filters */}
            {(selectedStatus || selectedDepartment) && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Active Filters:</span>
                {selectedStatus && (
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    Status: {selectedStatus}
                    <span className="text-blue-800">×</span>
                  </button>
                )}
                {selectedDepartment && (
                  <button
                    onClick={() => setSelectedDepartment(null)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    Dept: {selectedDepartment}
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
                  Clear All
                </button>
              </div>
            )}
            
            {/* Portfolio Health Group */}
            <div className="mb-3 max-w-5xl">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 pb-0.5 border-b-2 border-[#8A1538]">
                Portfolio Health
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-[#8A1538]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">Portfolio Health %</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('portfolioHealth')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'portfolioHealth' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Percentage of projects with "On Track" status. Formula: (On Track Projects / Total Projects) × 100</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">{Math.round((onTrack / totalProjects) * 100)}%</p>
                      <p className="text-[9px] text-gray-400">{onTrack}/{totalProjects} on track</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Total Active Projects</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('totalProjects')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'totalProjects' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Count of all projects in the portfolio with active status (not completed or cancelled).</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">{totalProjects}</p>
                      <p className="text-[9px] text-green-600">+3 vs last quarter</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">On Track Projects %</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('onTrackPct')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'onTrackPct' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Projects meeting both schedule (SPI ≥ 0.95) and cost (CPI ≥ 0.95) targets with no critical issues.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600 leading-tight">{Math.round((onTrack / totalProjects) * 100)}%</p>
                      <p className="text-[9px] text-gray-400">{onTrack} projects</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Critical Projects</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('critical')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'critical' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Projects with SPI &lt; 0.8 or CPI &lt; 0.8, or those with 6+ open high-impact risks requiring immediate executive intervention.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-600 leading-tight">{critical}</p>
                      <p className="text-[9px] text-gray-400">immediate action</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Open Risks</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('openRisks')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'openRisks' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Count of projects with "At Risk" or "Critical" status that have unresolved issues affecting timeline or budget.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-amber-600 leading-tight">{atRisk + critical}</p>
                      <p className="text-[9px] text-gray-400">{atRisk} at risk + {critical} critical</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance Group */}
            <div className="mb-3 max-w-4xl">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 pb-0.5 border-b-2 border-[#8A1538]">
                Financial Performance
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                <div className={`bg-white rounded-lg border-l-[3px] ${Number(avgSPI) >= 1 ? 'border-l-green-500' : Number(avgSPI) >= 0.85 ? 'border-l-amber-500' : 'border-l-red-500'} border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${Number(avgSPI) >= 1 ? 'bg-green-50' : Number(avgSPI) >= 0.85 ? 'bg-amber-50' : 'bg-red-50'} flex items-center justify-center flex-shrink-0`}>
                      <TrendingUp className={`w-4 h-4 ${Number(avgSPI) >= 1 ? 'text-green-600' : Number(avgSPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">Portfolio SPI</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('spi')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'spi' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Schedule Performance Index = Earned Value / Planned Value. &gt; 1.0 = ahead of schedule, &lt; 1.0 = behind schedule. Averaged across all projects.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xl font-bold leading-tight ${Number(avgSPI) >= 1 ? 'text-green-600' : Number(avgSPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`}>{avgSPI}</p>
                      <p className="text-[9px] text-gray-400">Schedule performance</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Portfolio CPI</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('cpi')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'cpi' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Cost Performance Index = Earned Value / Actual Cost. &gt; 1.0 = under budget, &lt; 1.0 = over budget. Averaged across all projects.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xl font-bold leading-tight ${Number(avgCPI) >= 1 ? 'text-green-600' : Number(avgCPI) >= 0.85 ? 'text-amber-600' : 'text-red-600'}`}>{avgCPI}</p>
                      <p className="text-[9px] text-gray-400">Cost performance</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Budget Variance</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('budgetVariance')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'budgetVariance' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Total Forecast Cost - Total Budget. Positive = over budget, Negative = under budget. Sum across all active projects.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xl font-bold leading-tight ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${(Math.abs(budgetVariance) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-[9px] text-gray-400">{budgetVariance > 0 ? 'Over' : 'Under'} budget</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Forecast Accuracy</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('forecastAccuracy')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'forecastAccuracy' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Percentage of projects where final cost was within ±10% of forecasted cost. Higher = better prediction accuracy.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">94%</p>
                      <p className="text-[9px] text-green-600">+2% vs last quarter</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Delivery Group */}
            <div className="max-w-5xl">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 pb-0.5 border-b-2 border-[#8A1538]">
                Milestone Delivery
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                <div className="bg-white rounded-lg border-l-[3px] border-l-[#8A1538] border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-[#8A1538]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-medium">Total Milestones</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('totalMilestones')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'totalMilestones' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Count of all planned milestones across active projects, including completed, in-progress, and upcoming milestones.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">{totalMilestones}</p>
                      <p className="text-[9px] text-gray-400">across all projects</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Milestones On Track</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestonesOnTrack')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestonesOnTrack' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Milestones expected to be completed by their planned date based on current progress and no blocking issues.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-blue-600 leading-tight">{milestonesOnTrack}</p>
                      <p className="text-[9px] text-gray-400">{Math.round((milestonesOnTrack / totalMilestones) * 100)}% of total</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Milestones At Risk</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestonesAtRisk')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestonesAtRisk' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Milestones with potential delays due to dependencies, resource constraints, or project slippage.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-amber-600 leading-tight">{milestonesAtRisk}</p>
                      <p className="text-[9px] text-gray-400">needs attention</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Milestones Delayed</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestonesDelayed')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestonesDelayed' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Milestones that have passed their planned completion date without being marked complete.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-600 leading-tight">{milestonesDelayed}</p>
                      <p className="text-[9px] text-gray-400">past due date</p>
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
                        <p className="text-[10px] text-gray-500 font-medium">Milestone Completion %</p>
                        <div className="relative">
                          <Info 
                            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('milestoneCompletion')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'milestoneCompletion' && (
                            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Formula: (Completed Milestones / Total Milestones) × 100. Shows overall portfolio progress.</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600 leading-tight">
                        {Math.round((milestonesCompleted / totalMilestones) * 100)}%
                      </p>
                      <p className="text-[9px] text-gray-400">{milestonesCompleted} completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 flex-shrink-0 bg-gray-50 rounded-lg p-1.5 border border-gray-200">
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'performance'
                  ? 'bg-gradient-to-r from-[#8A1538] to-[#a91d47] text-white shadow-md shadow-[#8A1538]/20'
                  : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Portfolio Performance
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
              PMO Cycle Health
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
              Department Distribution
            </button>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'performance' && (
              <div className="flex flex-col gap-4 p-4 pb-6">
                {/* Performance Charts Grid */}
                <div className="grid grid-cols-3 gap-4" style={{ height: '280px' }}>
                  {/* Status Distribution */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Status Distribution <ChartInfoToggle description="Shows the breakdown of all projects by their current status (On Track, At Risk, Critical, Completed). Helps identify the overall health of the portfolio at a glance." /></h3>
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

                  {/* SPI & CPI Trend */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">SPI & CPI Trend (6 Months) <ChartInfoToggle description="Tracks Schedule Performance Index (SPI) and Cost Performance Index (CPI) over the last 6 months. Values above 1.0 indicate ahead of schedule/under budget; below 1.0 means behind schedule/over budget." /></h3>
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
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6b7280" />
                          <YAxis domain={[0.8, 1.1]} tick={{ fontSize: 10 }} stroke="#6b7280" />
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

                  {/* Strategic Alignment */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Strategic Alignment % <ChartInfoToggle description="Measures how well the portfolio aligns with each strategic initiative. Higher percentages indicate stronger alignment between projects and organizational goals." /></h3>
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
                          <Bar dataKey="Alignment %" fill="url(#alignmentGradient)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Tables Row */}
                <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                  {/* Top 5 Over-Budget Projects */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Top 5 Over-Budget Projects <ChartInfoToggle description="Lists the top 5 projects with the largest budget overruns, showing budget vs forecast variance. These projects need immediate financial review." /></h3>
                    <div className="overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-600">Project</th>
                            <th className="text-right py-2 font-medium text-gray-600">Budget</th>
                            <th className="text-right py-2 font-medium text-gray-600">Forecast</th>
                            <th className="text-right py-2 font-medium text-gray-600">Variance</th>
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

                  {/* Top 5 Delayed Projects */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Top 5 Delayed Projects <ChartInfoToggle description="Lists the top 5 projects with the most schedule delays based on SPI. Lower SPI indicates greater schedule slippage requiring corrective action." /></h3>
                    <div className="overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-600">Project</th>
                            <th className="text-center py-2 font-medium text-gray-600">Status</th>
                            <th className="text-right py-2 font-medium text-gray-600">SPI</th>
                            <th className="text-right py-2 font-medium text-gray-600">Delay</th>
                            <th className="text-right py-2 font-medium text-gray-600">PM</th>
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
                                {Math.abs(project.sv)}d
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
            )}

            {activeTab === 'cycle' && (
              <div className="flex flex-col gap-4 p-4 pb-6">
                {/* PMO Cycle Charts Grid */}
                <div className="grid grid-cols-3 gap-4" style={{ height: '400px' }}>
                  {/* PMO Stage Distribution */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">PMO Cycle Stage Distribution <ChartInfoToggle description="Shows milestone distribution across PMO lifecycle stages (Initiation through Closure). Each bar is stacked by status: Completed, On Track, and At Risk." /></h3>
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
                          <Bar dataKey="Completed" stackId="a" fill="url(#completedGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="On Track" stackId="a" fill="url(#onTrackGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="At Risk" stackId="a" fill="url(#atRiskGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Milestone Status Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Milestone Status Summary <ChartInfoToggle description="Quick overview of milestone counts by status: Completed, On Track, At Risk, and Delayed. Provides an at-a-glance view of delivery health." /></h3>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Completed</span>
                        <span className="text-2xl font-bold text-green-600">{milestonesCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">On Track</span>
                        <span className="text-2xl font-bold text-blue-600">{milestonesOnTrack}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">At Risk</span>
                        <span className="text-2xl font-bold text-amber-600">{milestonesAtRisk}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Delayed</span>
                        <span className="text-2xl font-bold text-red-600">{milestonesDelayed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage Details Table */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">PMO Stage Breakdown <ChartInfoToggle description="Detailed table showing milestone health per PMO stage, including completed, on track, and at risk counts with health percentage." /></h3>
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
            )}

            {activeTab === 'department' && (
              <div className="flex flex-col gap-4 p-4 pb-6">
                {/* Department Charts Grid */}
                <div className="grid grid-cols-2 gap-4" style={{ height: '400px' }}>
                  {/* Department Health Status */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Department Health Status <ChartInfoToggle description="Stacked bar chart showing project status distribution per department. Identifies which departments have the most critical or at-risk projects." /></h3>
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
                          <Bar dataKey="On Track" stackId="a" fill="url(#onTrackDeptGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="At Risk" stackId="a" fill="url(#atRiskDeptGradient)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Critical" stackId="a" fill="url(#criticalDeptGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Department Budget Utilization */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Department Budget Utilization ($M) <ChartInfoToggle description="Compares allocated budget vs actual spend for each department. Helps identify departments that are overspending or underspending their budgets." /></h3>
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
                          <Bar dataKey="Budget" fill="url(#budgetDeptGradient)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Spent" fill="url(#spentDeptGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Department Details Table */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">Department Portfolio Summary <ChartInfoToggle description="Comprehensive table with project counts, status breakdown, budget allocation, spend, and health percentage for each department." /></h3>
                  <div className="overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-600">Department</th>
                          <th className="text-center py-2 font-medium text-gray-600">Total Projects</th>
                          <th className="text-center py-2 font-medium text-gray-600">On Track</th>
                          <th className="text-center py-2 font-medium text-gray-600">At Risk</th>
                          <th className="text-center py-2 font-medium text-gray-600">Critical</th>
                          <th className="text-right py-2 font-medium text-gray-600">Budget ($M)</th>
                          <th className="text-right py-2 font-medium text-gray-600">Spent ($M)</th>
                          <th className="text-right py-2 font-medium text-gray-600">Health %</th>
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

        {/* Milestone View Container */}
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