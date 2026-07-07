import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

/* ============================================================
   TYPE DEFINITIONS
   ============================================================ */

export interface ColumnMapping {
  employee_id?: string;
  department?: string;
  hire_date?: string;
  termination_date?: string;
  end_date?: string;
  tenure?: string;
  gender?: string;
  age?: string;
  salary?: string;
  performance_score?: string;
  absence_days?: string;
  training_hours?: string;
  promotion_count?: string;
  engagement_score?: string;
}

export interface MappedData {
  raw: Record<string, unknown>[];
  mapped: Record<string, unknown>[];
  columns: string[];
  columnMapping: ColumnMapping;
  warnings: string[];
  columnTypes: Record<string, 'date' | 'number' | 'text'>;
}

export interface FilterState {
  departments: string[];
  genders: string[];
  ageRange: [number, number];
  salaryRange: [number, number];
  hireYears: number[];
  performanceRange: [number, number];
  engagementRange: [number, number];
}

export interface KPIData {
  totalEmployees: number;
  activeEmployees: number;
  terminatedEmployees: number;
  turnoverRate: number;
  avgSalary: number | null;
  avgAge: number | null;
  avgTenure: number | null;
  avgPerformance: number | null;
  avgEngagement: number | null;
  avgAbsenceDays: number | null;
  avgPromotion: number | null;
  avgTrainingHours: number | null;
}

export interface FilterOptions {
  departments: string[];
  genders: string[];
  ageRange: [number, number];
  salaryRange: [number, number];
  hireYears: number[];
  performanceRange: [number, number];
  engagementRange: [number, number];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AppState {
  data: MappedData | null;
  filteredData: Record<string, unknown>[];
  filters: FilterState;
  kpis: KPIData | null;
  theme: 'light' | 'dark';
  apiKey: string;
  view: 'upload' | 'dashboard';
  activeTab: string;
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  filterOptions: FilterOptions | null;
}

export type AppAction =
  | { type: 'SET_DATA'; payload: MappedData }
  | { type: 'SET_FILTERED_DATA'; payload: Record<string, unknown>[] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS'; payload: FilterState }
  | { type: 'SET_KPIS'; payload: KPIData }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_VIEW'; payload: 'upload' | 'dashboard' }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_FILTER_OPTIONS'; payload: FilterOptions };

/* ============================================================
   HELPER - get a value from row using column mapping
   ============================================================ */

export function getVal(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  field: keyof ColumnMapping
): unknown {
  const col = mapping[field];
  if (!col) return undefined;
  return row[col];
}

export function getNumVal(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  field: keyof ColumnMapping
): number | null {
  const v = getVal(row, mapping, field);
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function getStrVal(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  field: keyof ColumnMapping
): string {
  const v = getVal(row, mapping, field);
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

/* ============================================================
   DEFAULT STATE
   ============================================================ */

const defaultFilters: FilterState = {
  departments: [],
  genders: [],
  ageRange: [0, 100],
  salaryRange: [0, 1000000],
  hireYears: [],
  performanceRange: [0, 10],
  engagementRange: [0, 10],
};

const initialState: AppState = {
  data: null,
  filteredData: [],
  filters: defaultFilters,
  kpis: null,
  theme: (localStorage.getItem('hr-theme') as 'light' | 'dark') || 'dark',
  apiKey: localStorage.getItem('hr-gemini-key') || '',
  view: 'upload',
  activeTab: 'overview',
  chatOpen: false,
  chatMessages: [],
  filterOptions: null,
};

/* ============================================================
   REDUCER
   ============================================================ */

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload, view: 'dashboard' };
    case 'SET_FILTERED_DATA':
      return { ...state, filteredData: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_KPIS':
      return { ...state, kpis: action.payload };
    case 'SET_THEME':
      localStorage.setItem('hr-theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_API_KEY':
      localStorage.setItem('hr-gemini-key', action.payload);
      return { ...state, apiKey: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_CHAT':
      return { ...state, chatOpen: !state.chatOpen };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'CLEAR_CHAT':
      return { ...state, chatMessages: [] };
    case 'SET_FILTER_OPTIONS':
      return { ...state, filterOptions: action.payload };
    default:
      return state;
  }
}

/* ============================================================
   CONTEXT
   ============================================================ */

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
