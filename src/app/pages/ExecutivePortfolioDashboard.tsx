import { useState, useMemo } from 'react';
import { projects, portfolioTrends } from '../data/mockData';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Link } from 'react-router';
import { 
  Target, TrendingUp, DollarSign, Flag, CheckCircle2, AlertTriangle, 
  Menu, Bell, Search, User, Info 
} from 'lucide-react';

export function ExecutivePortfolioDashboard() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Portfolio Health Calculations
  const totalProjects = projects.length;
  const onTrack = projects.filter(p => p.status === 'on-track').length;
  const atRisk = projects.filter(p => p.status === 'at-risk').length;
  const critical = projects.filter(p => p.status === 'critical').length;
  const portfolioHealth = Math.round((onTrack / totalProjects) * 100);

  // Financial Performance Calculations
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const budgetVariance = totalSpent - totalBudget;
  
  const avgSPI = (projects.reduce((sum, p) => sum + parseFloat(p.spi), 0) / totalProjects).toFixed(2);
  const avgCPI = (projects.reduce((sum, p) => sum + parseFloat(p.cpi), 0) / totalProjects).toFixed(2);

  // Milestone Delivery Calculations
  const totalMilestones = projects.reduce((sum, p) => sum + p.milestones, 0);
  const completedMilestones = projects.reduce((sum, p) => sum + p.completedMilestones, 0);
  const onTrackMilestones = Math.round(totalMilestones * 0.65);
  const atRiskMilestones = Math.round(totalMilestones * 0.2);
  const delayedMilestones = Math.round(totalMilestones * 0.15);

  // Status Distribution Data
  const statusData = [
    { name: 'On Track', value: onTrack, color: '#28A745' },
    { name: 'At Risk', value: atRisk, color: '#FFC107' },
    { name: 'Critical', value: critical, color: '#DC3545' },
  ];

  // Strategic Alignment Data
  const alignmentData = [
    { name: 'Digital Transformation', value: 85, color: '#8A1538' },
    { name: 'Customer Experience', value: 72, color: '#A29475' },
    { name: 'Operational Excellence', value: 68, color: '#28A745' },
    { name: 'Innovation', value: 55, color: '#FFC107' },
    { name: 'Market Expansion', value: 45, color: '#DC3545' },
  ].sort((a, b) => b.value - a.value);

  // Over Budget Projects
  const overBudgetProjects = projects
    .filter(p => p.spent > p.budget)
    .map(p => ({
      ...p,
      variance: p.spent - p.budget,
      variancePct: ((p.spent - p.budget) / p.budget) * 100,
    }))
    .sort((a, b) => b.variance - a.variance)
    .slice(0, 5);

  // Delayed Projects
  const delayedProjects = projects
    .filter(p => p.status === 'critical' || p.status === 'at-risk')
    .sort((a, b) => parseFloat(a.spi) - parseFloat(b.spi))
    .slice(0, 5);

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      {/* Sidebar Navigation - Fixed Width */}
      <div className="w-64 bg-[#8A1538] flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <Target className="w-6 h-6 text-[#8A1538]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">PMO</h1>
              <p className="text-white/60 text-xs">Portfolio Dashboard</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg text-white font-medium text-sm">
                <Target className="w-4 h-4" />
                Executive Overview
              </a>
            </li>
            <li>
              <Link to="/portfolio-deep-dive" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
                <TrendingUp className="w-4 h-4" />
                Portfolio Deep Dive
              </Link>
            </li>
            <li>
              <Link to="/project-manager" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
                <Flag className="w-4 h-4" />
                Project Manager
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-[#A29475] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">John Smith</p>
              <p className="text-white/60 text-xs">PMO Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Fill Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2E2E38]">Executive Portfolio Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time portfolio health and performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC3545] rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1920px] mx-auto">
            {/* Portfolio Health KPI Row - Responsive Auto Layout */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#2E2E38]">Portfolio Health</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Portfolio Health % */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Portfolio Health %</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('portfolioHealth')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'portfolioHealth' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Percentage of projects with "On Track" status. Formula: (On Track / Total) × 100</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#2E2E38]">{portfolioHealth}%</p>
                      <p className="text-xs text-gray-500 mt-1">{onTrack}/{totalProjects} on track</p>
                    </div>
                    <Target className="w-8 h-8 text-[#8A1538]" />
                  </div>
                </div>

                {/* Total Projects */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Projects</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('totalProjects')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'totalProjects' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Count of all active projects in the portfolio</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#2E2E38]">{totalProjects}</p>
                      <p className="text-xs text-[#28A745] mt-1">+3 vs last quarter</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-[#28A745]" />
                  </div>
                </div>

                {/* On Track % */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">On Track %</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('onTrackPct')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'onTrackPct' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Projects meeting schedule and cost targets with no critical issues</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#28A745]">{Math.round((onTrack / totalProjects) * 100)}%</p>
                      <p className="text-xs text-gray-500 mt-1">{onTrack} projects</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-[#28A745]" />
                  </div>
                </div>

                {/* At Risk */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">At Risk</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('atRisk')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'atRisk' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Projects with SPI or CPI between 0.8-0.95 requiring attention</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#FFC107]">{atRisk}</p>
                      <p className="text-xs text-gray-500 mt-1">needs attention</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-[#FFC107]" />
                  </div>
                </div>

                {/* Critical */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Critical</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('critical')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'critical' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Projects with SPI or CPI &lt; 0.8 requiring immediate action</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#DC3545]">{critical}</p>
                      <p className="text-xs text-gray-500 mt-1">immediate action</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-[#DC3545]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance KPI Row - Responsive Auto Layout */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#2E2E38]">Financial Performance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Portfolio SPI */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Portfolio SPI</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('spi')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'spi' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Schedule Performance Index = EV / PV. &gt; 1.0 ahead, &lt; 1.0 behind</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-3xl font-bold ${
                        Number(avgSPI) >= 1 ? 'text-[#28A745]' : Number(avgSPI) >= 0.85 ? 'text-[#FFC107]' : 'text-[#DC3545]'
                      }`}>{avgSPI}</p>
                      <p className="text-xs text-gray-500 mt-1">Schedule index</p>
                    </div>
                    <TrendingUp className={`w-8 h-8 ${
                      Number(avgSPI) >= 1 ? 'text-[#28A745]' : Number(avgSPI) >= 0.85 ? 'text-[#FFC107]' : 'text-[#DC3545]'
                    }`} />
                  </div>
                </div>

                {/* Portfolio CPI */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Portfolio CPI</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('cpi')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'cpi' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Cost Performance Index = EV / AC. &gt; 1.0 under, &lt; 1.0 over budget</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-3xl font-bold ${
                        Number(avgCPI) >= 1 ? 'text-[#28A745]' : Number(avgCPI) >= 0.85 ? 'text-[#FFC107]' : 'text-[#DC3545]'
                      }`}>{avgCPI}</p>
                      <p className="text-xs text-gray-500 mt-1">Cost index</p>
                    </div>
                    <DollarSign className={`w-8 h-8 ${
                      Number(avgCPI) >= 1 ? 'text-[#28A745]' : Number(avgCPI) >= 0.85 ? 'text-[#FFC107]' : 'text-[#DC3545]'
                    }`} />
                  </div>
                </div>

                {/* Total Budget */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Budget</p>
                      </div>
                      <p className="text-3xl font-bold text-[#2E2E38]">${(totalBudget / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-gray-500 mt-1">Portfolio budget</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-[#A29475]" />
                  </div>
                </div>

                {/* Budget Variance */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Budget Variance</p>
                        <div className="relative">
                          <Info 
                            className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                            onMouseEnter={() => setActiveTooltip('budgetVariance')}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                          {activeTooltip === 'budgetVariance' && (
                            <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-[#2E2E38] text-white text-xs rounded-lg shadow-xl">
                              <div className="font-semibold mb-1.5">How it's calculated:</div>
                              <div className="text-gray-200">Total Spent - Total Budget. Positive = over, Negative = under</div>
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2E2E38] transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-3xl font-bold ${budgetVariance > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}`}>
                        ${(Math.abs(budgetVariance) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{budgetVariance > 0 ? 'Over' : 'Under'} budget</p>
                    </div>
                    <DollarSign className={`w-8 h-8 ${budgetVariance > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Delivery KPI Row - Responsive Auto Layout */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#2E2E38]">Milestone Delivery</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Milestones */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Milestones</p>
                      </div>
                      <p className="text-3xl font-bold text-[#2E2E38]">{totalMilestones}</p>
                      <p className="text-xs text-gray-500 mt-1">Across all projects</p>
                    </div>
                    <Flag className="w-8 h-8 text-[#8A1538]" />
                  </div>
                </div>

                {/* On Track Milestones */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">On Track</p>
                      </div>
                      <p className="text-3xl font-bold text-[#28A745]">{onTrackMilestones}</p>
                      <p className="text-xs text-gray-500 mt-1">{Math.round((onTrackMilestones / totalMilestones) * 100)}% of total</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-[#28A745]" />
                  </div>
                </div>

                {/* At Risk Milestones */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">At Risk</p>
                      </div>
                      <p className="text-3xl font-bold text-[#FFC107]">{atRiskMilestones}</p>
                      <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-[#FFC107]" />
                  </div>
                </div>

                {/* Delayed Milestones */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Delayed</p>
                      </div>
                      <p className="text-3xl font-bold text-[#DC3545]">{delayedMilestones}</p>
                      <p className="text-xs text-gray-500 mt-1">Immediate action</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-[#DC3545]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row - 3 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Status Distribution Pie Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-base font-bold text-[#2E2E38] mb-4">Project Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

              {/* SPI & CPI Trend Line Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
                <h3 className="text-base font-bold text-[#2E2E38] mb-4">SPI & CPI Trend (6 Months)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" domain={[0.7, 1.1]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="spi" 
                        stroke="#8A1538" 
                        strokeWidth={3}
                        name="SPI"
                        dot={{ fill: '#8A1538', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cpi" 
                        stroke="#A29475" 
                        strokeWidth={3}
                        name="CPI"
                        dot={{ fill: '#A29475', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Strategic Alignment Horizontal Bar Chart - Full Width */}
            <div className="mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-base font-bold text-[#2E2E38] mb-4">Strategic Alignment Score</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alignmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {alignmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tables Row - 2 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 Over Budget Projects Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-base font-bold text-[#2E2E38] mb-4">Top 5 Over Budget Projects</h3>
                <div className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 font-semibold text-gray-700">Project</th>
                        <th className="text-right py-3 font-semibold text-gray-700">Variance</th>
                        <th className="text-right py-3 font-semibold text-gray-700">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overBudgetProjects.map((project, index) => (
                        <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <Link 
                              to={`/project-details?id=${project.id}`}
                              className="text-[#8A1538] hover:underline font-medium"
                            >
                              {project.name}
                            </Link>
                          </td>
                          <td className="text-right text-[#DC3545] font-semibold">
                            ${(project.variance / 1000000).toFixed(1)}M
                          </td>
                          <td className="text-right text-[#DC3545] font-semibold">
                            +{project.variancePct.toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top 5 Delayed Projects Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-base font-bold text-[#2E2E38] mb-4">Top 5 Delayed Projects</h3>
                <div className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 font-semibold text-gray-700">Project</th>
                        <th className="text-center py-3 font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 font-semibold text-gray-700">SPI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delayedProjects.map((project, index) => (
                        <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <Link 
                              to={`/project-details?id=${project.id}`}
                              className="text-[#8A1538] hover:underline font-medium"
                            >
                              {project.name}
                            </Link>
                          </td>
                          <td className="text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              project.status === 'critical' 
                                ? 'bg-[#DC3545] text-white' 
                                : 'bg-[#FFC107] text-[#2E2E38]'
                            }`}>
                              {project.status === 'critical' ? 'Critical' : 'At Risk'}
                            </span>
                          </td>
                          <td className="text-right font-semibold text-[#DC3545]">
                            {project.spi}
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
      </div>
    </div>
  );
}
