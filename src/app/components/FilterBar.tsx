import { Filter, X } from 'lucide-react';
import { projects, type Project } from '../data/mockData';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface FilterState {
  portfolio: string;
  program: string;
  status: string;
  projectManager: string;
  strategicInitiative: string;
}

const statusMap: Record<string, string> = {
  'On Track': 'on-track',
  'At Risk': 'at-risk',
  'Critical': 'critical',
};

export function filterProjects(allProjects: Project[], filters: FilterState): Project[] {
  return allProjects.filter(p => {
    if (filters.portfolio && p.portfolio !== filters.portfolio) return false;
    if (filters.program && p.program !== filters.program) return false;
    if (filters.status && filters.status !== 'All') {
      const mappedStatus = statusMap[filters.status];
      if (mappedStatus && p.status !== mappedStatus) return false;
    }
    if (filters.projectManager && p.projectManager !== filters.projectManager) return false;
    if (filters.strategicInitiative && p.strategicInitiative !== filters.strategicInitiative) return false;
    return true;
  });
}

export const defaultFilterState: FilterState = {
  portfolio: '',
  program: '',
  status: '',
  projectManager: '',
  strategicInitiative: '',
};

interface FilterBarProps {
  filters?: FilterState;
  setFilters?: (filters: FilterState) => void;
}

export function FilterBar({ filters: externalFilters, setFilters: externalSetFilters }: FilterBarProps) {
  const { t } = useLanguage();
  
  // Internal state for when no external state is provided
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    portfolio: '',
    program: '',
    status: '',
    projectManager: '',
    strategicInitiative: '',
  });

  // Use external state if provided, otherwise use internal state
  const filters = externalFilters || internalFilters;
  const setFilters = externalSetFilters || setInternalFilters;

  const portfolios = [...new Set(projects.map(p => p.portfolio))];
  const programs = [...new Set(projects.map(p => p.program))];
  const statuses = ['All', 'On Track', 'At Risk', 'Critical'];
  const projectManagers = [...new Set(projects.map(p => p.projectManager))];
  const initiatives = [...new Set(projects.map(p => p.strategicInitiative))];

  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      portfolio: '',
      program: '',
      status: '',
      projectManager: '',
      strategicInitiative: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters:</span>
        </div>
        
        <select 
          value={filters.portfolio}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={(e) => handleChange('portfolio', e.target.value)}
        >
          <option value="">All Portfolios</option>
          {portfolios.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select 
          value={filters.program}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={(e) => handleChange('program', e.target.value)}
        >
          <option value="">All Programs</option>
          {programs.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select 
          value={filters.status}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All</option>
          {statuses.filter(s => s !== 'All').map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select 
          value={filters.projectManager}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={(e) => handleChange('projectManager', e.target.value)}
        >
          <option value="">All Project Managers</option>
          {projectManagers.map(pm => (
            <option key={pm} value={pm}>{pm}</option>
          ))}
        </select>

        <select 
          value={filters.strategicInitiative}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={(e) => handleChange('strategicInitiative', e.target.value)}
        >
          <option value="">All Initiatives</option>
          {initiatives.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}

        <div className="ml-auto">
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}