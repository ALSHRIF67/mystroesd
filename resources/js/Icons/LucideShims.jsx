import React from 'react';

const make = (char) => (props) => <span {...props} style={{display:'inline-block',lineHeight:1}}>{char}</span>;

export const Search = make('🔍');
export const Filter = make('⚙️');
export const Eye = make('👁️');
export const CheckCircle = make('✅');
export const XCircle = make('❌');
export const PauseCircle = make('⏸️');
export const Archive = make('🗄️');
export const RefreshCw = make('🔄');
export const AlertCircle = make('⚠️');
export const ChevronDown = make('▾');
export const ChevronUp = make('▴');
export const X = make('✖');
export const AlertTriangle = make('⚠️');
export const Package = make('📦');
export const DollarSign = make('$');
export const User = make('👤');
export const Image = make('🖼️');
export const Calendar = make('📅');
export const BarChart3 = make('📊');
export const FilterIcon = make('🔎');
export const Trash2 = make('🗑️');
export const Edit = make('✏️');
export const Shield = make('🛡️');
export const Store = make('🏬');
export const Tag = make('🏷️');
export const Layers = make('🗂️');
export const Check = make('✔️');
export const Clock = make('⏰');
export const AlertOctagon = make('🚨');

export default {};
