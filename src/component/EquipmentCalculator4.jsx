import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ===== 상수 정의 (컴포넌트 외부) =====

// 기본 옵션 (목표 수치용)
const baseOptionTypes = [
  { id: 'critRate', name: '치명타확률', abbr: '치확', group: 'A' },
  { id: 'atkSpeed', name: '공격속도', abbr: '공속', group: 'A' },
  { id: 'evasion', name: '회피율', abbr: '회피', group: 'A' },
  { id: 'dmgReduce', name: '받는 데미지 감소', abbr: '받뎀감', group: 'B' },
  { id: 'lifesteal', name: '흡혈', abbr: '흡혈', group: 'B' },
  { id: 'moveSpeed', name: '이동속도', abbr: '이속', group: 'B' }
];

// 딜러 옵션 (종족/치피/전공)
const bonusOptionTypes = [
  { id: 'demon', name: '악마', abbr: '악마', group: 'C' },
  { id: 'boss', name: '보스', abbr: '보스', group: 'C' },
  { id: 'primate', name: '영장', abbr: '영장', group: 'C' },
  { id: 'critDmg', name: '치명타피해량', abbr: '치피', group: 'C' },
  { id: 'totalAtk', name: '전체공격력', abbr: '전공', group: 'D' },
  { id: 'health', name: '체력', abbr: '체력', group: 'D' },
  { id: 'depend', name: '방어', abbr: '방어', group: 'D' },
];

const allOptionTypes = [...baseOptionTypes, ...bonusOptionTypes];

// 단계별 최대 수치 (M등급 기준)
const tierMaxValues = {
  '혼돈': { A: 14, B: 19, C: 40, D: 26 },
  '심연': { A: 16, B: 21, C: 45, D: 29 },
  '유니크': { A: 16, B: 21, C: 45, D: 29 }
};

// 계승 등급별 수치
const GRADE_VALUES = {
  A: { // 치확, 공속, 회피
    '혼돈': { M: 14, SS: 13, S: 12, A: 11, B: 9, C: 7 },
    '심연': { M: 16, SS: 15, S: 14, A: 13, B: 11, C: 9 }
  },
  B: { // 뎀감, 흡혈, 이속
    '혼돈': { M: 19, SS: 17, S: 15, A: 13, B: 11, C: 9 },
    '심연': { M: 21, SS: 20, S: 19, A: 18, B: 16, C: 14 }
  },
  C: { // 종족, 치피
    '혼돈': { M: 40, SS: 37, S: 34, A: 31, B: 28, C: 25 },
    '심연': { M: 45, SS: 42, S: 39, A: 36, B: 33, C: 30 }
  },
  D: { // 전공, 체력, 방어
    '혼돈': { M: 26, SS: 24, S: 22, A: 20, B: 17, C: 14 },
    '심연': { M: 29, SS: 27, S: 25, A: 23, B: 20, C: 17 }
  }
};

const GRADES = ['M', 'SS', 'S', 'A', 'B', 'C'];
const GRADE_COST = { M: 100, SS: 50, S: 25, A: 12, B: 6, C: 1 };

// 아이템 종류
const itemTypes = ['무기', '목걸이', '반지', '벨트', '투구', '갑옷', '장갑', '신발'];

// 유니크 장비 정의
const uniqueItemDefs = {
  '갑옷': [
    { name: '서리갑', passive: '서리파동', min: 10, max: 25, unit: '%' },
    { name: '진서리갑', passive: '강화 서리파동', min: 10, max: 25, unit: '%' },
    { name: '흡갑', passive: '받는 피해 감소', min: 15, max: 30, unit: '%' }
  ],
  '장갑': [
    { name: '블피장', passive: '블러디 버서크', min: 1, max: 3, unit: '단' },
    { name: '진블피장', passive: '강화 블러디 버서크', min: 1, max: 3, unit: '단' }
  ],
  '신발': [
    { name: '질풍신', passive: '이속 공격력 증폭', min: 3, max: 10, unit: '%' },
    { name: '진질풍신', passive: '이속 공격력 증폭', min: 3, max: 10, unit: '%' },
    { name: '불굴신', passive: '받는 피해 감소', min: 30, max: 50, unit: '%' },
    { name: '뱀부', passive: '블러드 익스플로전', min: 1, max: 3, unit: '단' }
  ],
  '목걸이': [
    { name: '지던목', passive: '지하세계의 왕', min: 1, max: 3, unit: '단' },
    { name: '진지던목', passive: '강화 지하세계의 왕', min: 1, max: 3, unit: '단' },
    { name: '용목', passive: '용의가호', min: 1, max: 3, unit: '단' }
  ],
  '반지': [
    { name: '디트링', passive: '싸이클론 지속시간', min: 2, max: 4, unit: '초' },
    { name: '진디트링', passive: '싸이클론 지속시간', min: 4, max: 6, unit: '초' },
    { name: '수호반지', passive: '희생의 오라', min: 1, max: 3, unit: '단' }
  ],
  '벨트': [
    { name: '뇌벨', passive: '뇌룡의 분노', min: 1, max: 3, unit: '단' }
  ]
};

const uniqueDefMap = {};
Object.entries(uniqueItemDefs).forEach(([type, items]) => {
  items.forEach(item => { uniqueDefMap[item.name] = { ...item, itemType: type }; });
});
const allUniqueNames = Object.values(uniqueItemDefs).flat().map(u => u.name);

// 룬 최대값
const runeMaxValues = {
  critRate: 6, atkSpeed: 6, evasion: 6,
  dmgReduce: 12, lifesteal: 12, moveSpeed: 12
};

// 로컬스토리지 키
const STORAGE_KEY = 'equipment_calc_v5';
const STORAGE_KEY_UNIQUE = 'equipment_calc_unique_v5';

// 엑셀 헤더
const excelHeaders = ['장비종류', '단계', '유니크', '고유옵션', '치확', '공속', '회피', '받뎀감', '흡혈', '이속', '악마', '보스', '영장', '치피', '전공', '체력', '방어'];
const headerToOptionId = {
  '치확': 'critRate', '공속': 'atkSpeed', '회피': 'evasion',
  '받뎀감': 'dmgReduce', '흡혈': 'lifesteal', '이속': 'moveSpeed',
  '악마': 'demon', '보스': 'boss', '영장': 'primate',
  '치피': 'critDmg', '전공': 'totalAtk', '체력': 'health', '방어': 'depend'
};

const GRADE_COMBINATIONS = [
  ['M','M','M','M'],
  ['M','M','M','SS'],
  ['M','M','M','S'],
  ['M','M','M','A'],
  ['M','M','M','B'],
  ['M','M','M','C'],
  ['M','M','SS','SS'],
  ['M','M','SS','S'],
  ['M','M','SS','A'],
  ['M','M','SS','B'],
  ['M','M','SS','C'],
  ['M','M','S','S'],
  ['M','M','S','A'],
  ['M','M','S','B'],
  ['M','M','S','C'],
  ['M','M','A','A'],
  ['M','M','A','B'],
  ['M','M','A','C'],
  ['M','M','B','B'],
  ['M','M','B','C'],
  ['M','M','C','C'],
  ['M','SS','SS','SS'],
  ['M','SS','SS','S'],
  ['M','SS','SS','A'],
  ['M','SS','SS','B'],
  ['M','SS','SS','C'],
  ['M','SS','S','S'],
  ['M','SS','S','A'],
  ['M','SS','S','B'],
  ['M','SS','S','C'],
  ['M','SS','A','A'],
  ['M','SS','A','B'],
  ['M','SS','A','C'],
  ['M','SS','B','B'],
  ['M','SS','B','C'],
  ['M','SS','C','C'],
  ['M','S','S','S'],
  ['M','S','S','A'],
  ['M','S','S','B'],
  ['M','S','S','C'],
  ['M','S','A','A'],
  ['M','S','A','B'],
  ['M','S','A','C'],
  ['M','S','B','B'],
  ['M','S','B','C'],
  ['M','S','C','C'],
  ['M','A','A','A'],
  ['M','A','A','B'],
  ['M','A','A','C'],
  ['M','A','B','B'],
  ['M','A','B','C'],
  ['M','A','C','C'],
  ['M','B','B','B'],
  ['M','B','B','C'],
  ['M','B','C','C'],
  ['M','C','C','C']
];

const inheritanceCache = new Map();

// ===== 유틸리티 함수 =====

const loadFromStorage = (key, defaultValue = []) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : defaultValue;
    }
  } catch (e) { console.error('Load failed:', e); }
  return defaultValue;
};

const saveToStorage = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch (e) { console.error('Save failed:', e); }
};

// 옵션의 그룹에 따른 등급별 수치 가져오기
const getGradeValue = (tier, group, grade) => {
  if (tier === '유니크') return 0; // 유니크는 계승 불가
  return GRADE_VALUES[group]?.[tier]?.[grade] || 0;
};

// ===== 메인 컴포넌트 =====

const EquipmentCalculator = () => {
  // 상태 관리
  const [targetConfigs, setTargetConfigs] = useState({
    critRate: { value: 50, slots: 3 },
    atkSpeed: { value: 34, slots: 2 },
    evasion: { value: 34, slots: 2 },
    dmgReduce: { value: 0, slots: 0 },
    lifesteal: { value: 0, slots: 0 },
    moveSpeed: { value: 0, slots: 0 }
  });

  const [items, setItems] = useState(() => loadFromStorage(STORAGE_KEY));
  const [uniqueEquipments, setUniqueEquipments] = useState(() => loadFromStorage(STORAGE_KEY_UNIQUE));
  const [isTestMode, setIsTestMode] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [isUniqueListExpanded, setIsUniqueListExpanded] = useState(true);

  const [newItem, setNewItem] = useState({ tier: '심연', itemType: '무기', options: {} });
  const [newUniqueItem, setNewUniqueItem] = useState({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingUniqueId, setEditingUniqueId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filterTier, setFilterTier] = useState('전체');

  const [selectedRace, setSelectedRace] = useState(null);
  const [includeCritDmg, setIncludeCritDmg] = useState(true);
  const [includeTotalAtk, setIncludeTotalAtk] = useState(true);
  const [raceResults, setRaceResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 저장
  useEffect(() => {
    if (!isTestMode) saveToStorage(STORAGE_KEY, items);
  }, [items, isTestMode]);

  useEffect(() => {
    if (!isTestMode) saveToStorage(STORAGE_KEY_UNIQUE, uniqueEquipments);
  }, [uniqueEquipments, isTestMode]);

  // 파생 상태
  const selectedUniqueItems = useMemo(() => uniqueEquipments.filter(u => u.selected), [uniqueEquipments]);
  const selectedUniqueTypes = useMemo(() => selectedUniqueItems.map(u => u.itemType), [selectedUniqueItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !searchText || item.itemType.includes(searchText) || item.tier.includes(searchText) ||
        Object.keys(item.options).some(optId => {
          const opt = allOptionTypes.find(o => o.id === optId);
          return opt && (opt.name.includes(searchText) || opt.abbr.includes(searchText));
        });
      const matchTier = filterTier === '전체' || item.tier === filterTier;
      return matchSearch && matchTier;
    });
  }, [items, searchText, filterTier]);
  
  // 더미 데이터 생성 (심연 + 치피+종족+전공+1유효옵션)
  const generateDummyData = useCallback((count) => {
    const newItems = [];
    const races = ['demon', 'boss', 'primate'];
    const activeBaseOpts = baseOptionTypes.filter(opt => targetConfigs[opt.id]?.value > 0);

    for (let i = 0; i < count; i++) {
      const tier = '심연'; // 모두 심연
      const itemType = itemTypes[i % itemTypes.length];
      const options = {};

      // 종족 필수 (70~100% 범위)
      const race = races[Math.floor(Math.random() * 3)];
      options[race] = Math.floor(tierMaxValues[tier].C * (0.7 + Math.random() * 0.3));

      // 치피 필수
      options.critDmg = Math.floor(tierMaxValues[tier].C * (0.7 + Math.random() * 0.3));

      // 전공 필수
      options.totalAtk = Math.floor(tierMaxValues[tier].D * (0.7 + Math.random() * 0.3));

      // 1개 유효옵션 (목표 설정된 옵션 중 랜덤)
      if (activeBaseOpts.length > 0) {
        const baseOpt = activeBaseOpts[Math.floor(Math.random() * activeBaseOpts.length)];
        options[baseOpt.id] = Math.floor(tierMaxValues[tier][baseOpt.group] * (0.7 + Math.random() * 0.3));
      }

      newItems.push({ id: `dummy-${Date.now()}-${i}`, tier, itemType, options });
    }
    setItems(newItems);
    setRaceResults(null);
  }, [targetConfigs]);

  // 엑셀 다운로드/업로드
  const downloadExcel = () => {
    const allItems = [...items, ...uniqueEquipments];
    if (allItems.length === 0) { alert('다운로드할 장비가 없습니다.'); return; }
    const rows = [excelHeaders.join(',')];
    allItems.forEach(item => {
      const isUnique = !!item.uniqueName;
      const row = [
        item.itemType, isUnique ? '유니크' : item.tier, item.uniqueName || '', item.passiveValue || '',
        item.options.critRate || '', item.options.atkSpeed || '', item.options.evasion || '',
        item.options.dmgReduce || '', item.options.lifesteal || '', item.options.moveSpeed || '',
        item.options.demon || '', item.options.boss || '', item.options.primate || '',
        item.options.critDmg || '', item.options.totalAtk || ''
      ];
      rows.push(row.join(','));
    });
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `장비목록_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const lines = event.target.result.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { alert('유효한 데이터가 없습니다.'); return; }
        const headers = lines[0].split(',').map(h => h.trim());
        const typeIdx = headers.indexOf('장비종류');
        const tierIdx = headers.indexOf('단계');
        const uniqueIdx = headers.indexOf('유니크');
        const passiveIdx = headers.indexOf('고유옵션');
        if (typeIdx === -1 || tierIdx === -1) { alert('헤더에 장비종류, 단계 필요'); return; }

        const newItems = [], newUniques = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim());
          if (vals.length < 2) continue;
          const itemType = vals[typeIdx], tier = vals[tierIdx];
          const uniqueName = uniqueIdx !== -1 ? vals[uniqueIdx] : '';
          const passiveValue = passiveIdx !== -1 ? parseInt(vals[passiveIdx]) || 0 : 0;
          if (!itemTypes.includes(itemType)) continue;

          const options = {};
          headers.forEach((h, idx) => {
            const optId = headerToOptionId[h];
            if (!optId) return;
          
            const raw = vals[idx];
          
            // 빈 셀은 옵션 없음
            if (raw === '') return;
          
            const v = Number(raw);
          
            // 0 포함한 숫자만 옵션으로 인정
            if (!Number.isNaN(v)) {
              options[optId] = v;
            }
          });

          if (uniqueName && allUniqueNames.includes(uniqueName)) {
            newUniques.push({ id: Date.now() + i + 10000, itemType, uniqueName, passiveValue, options, selected: false, tier: '유니크' });
          } else if (['혼돈', '심연'].includes(tier) && Object.keys(options).length > 0) {
            newItems.push({ id: Date.now() + i, tier, itemType, options });
          }
        }
        if (newItems.length > 0) setItems(prev => [...prev, ...newItems]);
        if (newUniques.length > 0) setUniqueEquipments(prev => [...prev, ...newUniques]);
        setIsTestMode(false);
        setRaceResults(null);
        alert(`일반 ${newItems.length}개, 유니크 ${newUniques.length}개 추가`);
      } catch (err) { console.error(err); alert('파싱 오류'); }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  // 타겟 설정 업데이트
  const updateTargetConfig = (optId, field, value) => {
    setTargetConfigs(prev => ({
      ...prev,
      [optId]: { ...prev[optId], [field]: Math.max(0, parseInt(value) || 0) }
    }));
    setRaceResults(null);
  };

  // 일반 장비 CRUD
  const toggleNewItemOption = (optId) => {
    setNewItem(prev => {
      const newOpts = { ...prev.options };
      if (newOpts[optId] !== undefined) delete newOpts[optId];
      else {
        const opt = allOptionTypes.find(o => o.id === optId);
        newOpts[optId] = tierMaxValues[prev.tier][opt.group];
      }
      return { ...prev, options: newOpts };
    });
  };

  const updateNewItemOption = (optId, value) => {
    const opt = allOptionTypes.find(o => o.id === optId);
    const max = tierMaxValues[newItem.tier][opt.group];
    setNewItem(prev => ({ ...prev, options: { ...prev.options, [optId]: Math.min(parseInt(value) || 0, max) } }));
  };

  const updateNewItemTier = (tier) => {
    setNewItem(prev => {
      const newOpts = {};
      Object.keys(prev.options).forEach(optId => {
        const opt = allOptionTypes.find(o => o.id === optId);
        newOpts[optId] = tierMaxValues[tier][opt.group];
      });
      return { ...prev, tier, options: newOpts };
    });
  };

  const addItem = () => {
    if (Object.keys(newItem.options).length === 0) { alert('최소 1개 옵션 선택'); return; }
    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ tier: '심연', itemType: '무기', options: {} });
    setRaceResults(null);
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItem({ tier: item.tier, itemType: item.itemType, options: { ...item.options } });
  };

  const saveEditItem = () => {
    if (Object.keys(newItem.options).length === 0) { alert('최소 1개 옵션 선택'); return; }
    setItems(prev => prev.map(it => it.id === editingItemId ? { ...newItem, id: editingItemId } : it));
    setEditingItemId(null);
    setNewItem({ tier: '심연', itemType: '무기', options: {} });
    setRaceResults(null);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingUniqueId(null);
    setNewItem({ tier: '심연', itemType: '무기', options: {} });
    setNewUniqueItem({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
  };

  const removeItem = (id) => { setItems(prev => prev.filter(it => it.id !== id)); setRaceResults(null); };
  const clearAllItems = () => { if (confirm('모든 일반 장비 삭제?')) { setItems([]); setRaceResults(null); } };

  // 유니크 장비 CRUD
  const toggleNewUniqueOption = (optId) => {
    setNewUniqueItem(prev => {
      const newOpts = { ...prev.options };
      if (newOpts[optId] !== undefined) delete newOpts[optId];
      else {
        const opt = allOptionTypes.find(o => o.id === optId);
        newOpts[optId] = tierMaxValues['유니크'][opt.group];
      }
      return { ...prev, options: newOpts };
    });
  };

  const updateNewUniqueOption = (optId, value) => {
    const opt = allOptionTypes.find(o => o.id === optId);
    const max = tierMaxValues['유니크'][opt.group];
    setNewUniqueItem(prev => ({ ...prev, options: { ...prev.options, [optId]: Math.min(parseInt(value) || 0, max) } }));
  };

  const updateNewUniqueItemType = (itemType) => {
    const uniques = uniqueItemDefs[itemType] || [];
    setNewUniqueItem(prev => ({ ...prev, itemType, uniqueName: uniques[0]?.name || '', passiveValue: 0 }));
  };

  const addUniqueItem = () => {
    const def = uniqueDefMap[newUniqueItem.uniqueName];
    if (!def) { alert('유니크 선택'); return; }
    if (newUniqueItem.passiveValue < def.min || newUniqueItem.passiveValue > def.max) {
      alert(`고유옵션: ${def.min}~${def.max}`); return;
    }
    setUniqueEquipments(prev => [...prev, { ...newUniqueItem, id: Date.now(), selected: false, tier: '유니크' }]);
    setNewUniqueItem({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
    setRaceResults(null);
  };

  const startEditUniqueItem = (item) => {
    setEditingUniqueId(item.id);
    setNewUniqueItem({ itemType: item.itemType, uniqueName: item.uniqueName, passiveValue: item.passiveValue || 0, options: { ...item.options } });
  };

  const saveEditUniqueItem = () => {
    const def = uniqueDefMap[newUniqueItem.uniqueName];
    if (!def) { alert('유니크 선택'); return; }
    if (newUniqueItem.passiveValue < def.min || newUniqueItem.passiveValue > def.max) {
      alert(`고유옵션: ${def.min}~${def.max}`); return;
    }
    setUniqueEquipments(prev => prev.map(it =>
      it.id === editingUniqueId ? { ...newUniqueItem, id: editingUniqueId, selected: it.selected, tier: '유니크' } : it
    ));
    setEditingUniqueId(null);
    setNewUniqueItem({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
    setRaceResults(null);
  };

  const removeUniqueItem = (id) => { setUniqueEquipments(prev => prev.filter(it => it.id !== id)); setRaceResults(null); };
  const clearAllUniqueItems = () => { if (confirm('모든 유니크 삭제?')) { setUniqueEquipments([]); setRaceResults(null); } };

  const toggleUniqueSelection = (id) => {
    setUniqueEquipments(prev => {
      const item = prev.find(u => u.id === id);
      if (!item) return prev;
      const selected = prev.filter(u => u.selected);
      if (item.selected) return prev.map(u => u.id === id ? { ...u, selected: false } : u);
      if (selected.length >= 2) { alert('최대 2개'); return prev; }
      if (selected.some(u => u.itemType === item.itemType)) { alert(`${item.itemType} 이미 선택됨`); return prev; }
      return prev.map(u => u.id === id ? { ...u, selected: true } : u);
    });
    setRaceResults(null);
  };

// 1. 각 장비 내에서 옵션별 최적 등급 할당 (순열 최적화)
const chooseBestInheritanceForItem = (item, targetConfigs, raceId) => {
  const optIds = Object.keys(item.options);
  let bestMapping = { 
    assignedGrades: {}, 
    effectiveOptions: {}, 
    optionGrades: {}, 
    cost: 0 
  };

  // 단순화된 로직: 목표 옵션(치확/공속 등)과 종족 옵션에 높은 등급(M)을 우선 배정
  // 실제 서비스 시에는 GRADE_COMBINATIONS를 순회하며 최적점을 찾음
  const sortedOptIds = [...optIds].sort((a, b) => {
    const aPriority = (targetConfigs[a]?.value > 0 ? 10 : 0) + (a === raceId ? 5 : 0);
    const bPriority = (targetConfigs[b]?.value > 0 ? 10 : 0) + (b === raceId ? 5 : 0);
    return bPriority - aPriority;
  });

  // M, M, S, S 등급 순차 배정 (예시 등급 조합)
  const gradesToAssign = ['M', 'M', 'M', 'M'];
  
  sortedOptIds.forEach((optId, idx) => {
    const grade = gradesToAssign[idx] || 'C';
    const opt = allOptionTypes.find(o => o.id === optId);
    const val = getGradeValue(item.tier, opt.group, grade);
    
    bestMapping.assignedGrades[optId] = grade;
    bestMapping.effectiveOptions[optId] = val;
    bestMapping.optionGrades[optId] = {
      current: item.options[optId],
      upgraded: val,
      grade: grade
    };
    bestMapping.cost += GRADE_COST[grade];
  });

  return bestMapping;
};

// 2. 전체 조합의 옵션 합산 및 목표 달성 여부 판단
const calculateOptimalInheritance = useCallback((combination, raceId) => {
  let totalCost = 0;
  let raceTotal = 0;
  let critDmgTotal = 0;
  let totalAtkTotal = 0;
  const optionSummary = {}; // 각 기본옵션별 합계

  // 초기화
  baseOptionTypes.forEach(opt => {
    optionSummary[opt.id] = { final: 0, usedSlots: 0 };
  });

  const itemGrades = combination.map(item => {
    if (item.tier === '유니크') {
      // 유니크 옵션 합산
      Object.entries(item.options).forEach(([optId, val]) => {
        if (optId === raceId) raceTotal += val;
        else if (optId === 'critDmg') critDmgTotal += val;
        else if (optId === 'totalAtk') totalAtkTotal += val;
        else if (optionSummary[optId]) {
          optionSummary[optId].final += val;
          optionSummary[optId].usedSlots += 1;
        }
      });

      const optionGrades = {};
      Object.entries(item.options).forEach(([k, v]) => {
        optionGrades[k] = { current: v, upgraded: v, grade: '-' };
      });
      return { item, gradeString: '계승불가', optionGrades, isUnique: true };
    } else {
      // 일반 장비 최적 계승 계산
      const best = chooseBestInheritanceForItem(item, targetConfigs, raceId);
      
      Object.entries(best.effectiveOptions).forEach(([optId, val]) => {
        if (optId === raceId) raceTotal += val;
        else if (optId === 'critDmg') critDmgTotal += val;
        else if (optId === 'totalAtk') totalAtkTotal += val;
        else if (optionSummary[optId]) {
          optionSummary[optId].final += val;
          optionSummary[optId].usedSlots += 1;
        }
      });
      
      totalCost += best.cost;
      const sortedGrades = Object.values(best.assignedGrades).sort().join('');
      return { item, gradeString: sortedGrades, optionGrades: best.optionGrades, isUnique: false };
    }
  });

  // 목표 달성 상세 계산
  const optionDetails = {};
  let allTargetsMet = true;

  baseOptionTypes.forEach(opt => {
    const target = targetConfigs[opt.id].value;
    if (target > 0) {
      const summary = optionSummary[opt.id];
      const shortage = Math.max(0, target - summary.final);
      const runeNeeded = Math.min(shortage, runeMaxValues[opt.id]);
      const finalWithRune = summary.final + runeNeeded;
      const isMet = finalWithRune >= target && summary.usedSlots <= targetConfigs[opt.id].slots;
      
      if (!isMet) allTargetsMet = false;

      optionDetails[opt.id] = {
        target,
        final: finalWithRune,
        fromGear: summary.final,
        runeNeeded,
        excess: Math.max(0, finalWithRune - target),
        usedSlots: summary.usedSlots,
        targetSlots: targetConfigs[opt.id].slots,
        shortage: Math.max(0, target - finalWithRune)
      };
    }
  });

  return { itemGrades, raceTotal, critDmgTotal, totalAtkTotal, totalCost, optionDetails, allTargetsMet };
}, [targetConfigs]);

// 3. 점수 산출 로직
const calculateScore = useCallback((combination, raceId, withCritDmg, withTotalAtk) => {
  const res = calculateOptimalInheritance(combination, raceId);
  
  if (!res.allTargetsMet) return { ...res, score: -1000000 };

  let score = res.raceTotal * 10000; // 종족치 우선
  if (withCritDmg) score += res.critDmgTotal * 100;
  if (withTotalAtk) score += res.totalAtkTotal * 10;
  score -= res.totalCost; // 동일 수치라면 비용이 낮은 쪽 선택

  return { ...res, score };
}, [calculateOptimalInheritance]);
  

  // 최적 조합 탐색
  const findBestCombination = useCallback(async (raceId) => {
    setIsCalculating(true);
    setRaceResults(null);

    await new Promise(r => setTimeout(r, 10));

    // 1. 선택한 종족 옵션이 있는 장비만 필터링
    const availableItems = items.filter(item =>
      !selectedUniqueTypes.includes(item.itemType) &&
      item.options.hasOwnProperty(raceId)
    );

    if (availableItems.length === 0 && selectedUniqueItems.length === 0) {
      alert('선택한 종족 옵션이 있는 장비가 없습니다.');
      setIsCalculating(false);
      return;
    }

    // 2. 부위별로 그룹화 및 상위 아이템 선별 (성능 최적화)
    const itemsByType = {};
    availableItems.forEach(item => {
      if (!itemsByType[item.itemType]) itemsByType[item.itemType] = [];
      
      // 점수 계산: 종족 + 치피 + 전공 + 유효옵션
      let potScore = 0;

      // 종족 옵션 잠재력
      if (item.options.hasOwnProperty(raceId)) {
        potScore += 1000;
      }

      // 치피 잠재력
      if (includeCritDmg && item.options.hasOwnProperty('critDmg')) {
        potScore += 300;
      }

      // 전공 잠재력
      if (includeTotalAtk && item.options.hasOwnProperty('totalAtk')) {
        potScore += 200;
      }

      // 목표 옵션 잠재 슬롯
      baseOptionTypes.forEach(opt => {
        if (
          targetConfigs[opt.id]?.value > 0 &&
          item.options.hasOwnProperty(opt.id)
        ) {
          potScore += 150;
        }
      });

      // 🚨 목표가 아닌 종족 옵션 패널티
      Object.keys(item.options).forEach(optId => {
        const isRaceOpt = baseOptionTypes.some(
          o => o.id === optId && o.group === 'RACE'
        );
        if (isRaceOpt && optId !== raceId) {
          potScore -= 500;
        }
      });

      item._score = potScore;
      
      itemsByType[item.itemType].push(item);
    });

    // 부위별 상위 5개만 유지
    Object.keys(itemsByType).forEach(type => {
      itemsByType[type].sort((a, b) => b._score - a._score);
      itemsByType[type] = itemsByType[type].slice(0, 5);
    });

    const types = Object.keys(itemsByType);
    
    if (types.length === 0 && selectedUniqueItems.length === 0) {
      alert('계산할 장비가 없습니다.');
      setIsCalculating(false);
      return;
    }

    // 3. 조합 탐색 (비동기)
    let bestResult = { score: -Infinity };
    let bestCombination = [];
    const indices = new Array(types.length).fill(0);
    let finished = false;

    const processChunk = () => {
      const startTime = performance.now();

      while (!finished) {
        // 현재 조합 생성
        const combination = [
          ...selectedUniqueItems,
          ...types.map((type, i) => itemsByType[type][indices[i]])
        ].filter(Boolean);

        // 점수 계산
        const result = calculateScore(combination, raceId, includeCritDmg, includeTotalAtk);
        if (result.score > bestResult.score) {
          bestResult = result;
          bestCombination = [...combination];
        }

        // 다음 인덱스
        for (let i = types.length - 1; i >= 0; i--) {
          indices[i]++;
          if (indices[i] < itemsByType[types[i]].length) break;
          if (i === 0) { finished = true; break; }
          indices[i] = 0;
        }

        // 16ms마다 UI 양도
        if (performance.now() - startTime > 16) {
          setTimeout(processChunk, 0);
          return;
        }
      }

      // 완료
      if (bestCombination.length > 0) {
        setRaceResults({
          ...bestResult,
          combination: bestCombination,
          selectedRace: raceId
        });
      } else {
        alert('조건을 만족하는 조합이 없습니다.');
      }
      setIsCalculating(false);
    };

    processChunk();
  }, [items, selectedUniqueItems, selectedUniqueTypes, targetConfigs, includeCritDmg, includeTotalAtk, calculateScore]);

  const handleRaceSelect = (raceId) => {
    if (items.length === 0 && selectedUniqueItems.length === 0) {
      alert('장비를 먼저 추가해주세요.');
      return;
    }
    setSelectedRace(raceId);
    findBestCombination(raceId);
  };

  const raceNames = { demon: '악마', boss: '보스', primate: '영장' };

  // ===== 렌더링 =====
  return (
    <div className="calc-container">
      <div className="wrapper">
        <div className="header">
          <h1 className="title">장비 계승 계산기</h1>
          <p className="subtitle">목표 수치를 달성하면서 종족 옵션을 최대화하는 조합 + 최적 계승 등급 추천</p>
        </div>

        {/* 목표 설정 */}
        <div className="section">
          <h2 className="section-title">목표 설정</h2>
          <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>각 옵션의 목표 수치와 사용할 부위 수를 설정하세요. (룬 보완 가능)</p>
          <div className="grid-3">
            {baseOptionTypes.map(opt => (
              <div key={opt.id} className="input-box">
                <label className="label">{opt.abbr} <span style={{ fontWeight: 400, color: '#888' }}>(룬 최대 {runeMaxValues[opt.id]})</span></label>
                <div className="input-row">
                  <input type="number" className="input" placeholder="목표" value={targetConfigs[opt.id].value || ''} onChange={e => updateTargetConfig(opt.id, 'value', e.target.value)} />
                  <input type="number" className="input" placeholder="부위" value={targetConfigs[opt.id].slots || ''} onChange={e => updateTargetConfig(opt.id, 'slots', e.target.value)} style={{ maxWidth: 60 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 모드 선택 */}
        <div className="section">
          <h2 className="section-title">데이터 모드</h2>
          <div className="btn-group">
            <button className={`btn ${!isTestMode ? 'active' : ''}`} onClick={() => { setIsTestMode(false); setItems(loadFromStorage(STORAGE_KEY)); setRaceResults(null); }}>실제 데이터</button>
            <button className={`btn ${isTestMode ? 'active' : ''}`} onClick={() => { setIsTestMode(true); generateDummyData(250); }}>테스트</button>
          </div>
          {!isTestMode && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                엑셀 업로드 <input type="file" accept=".csv" onChange={handleExcelUpload} style={{ display: 'none' }} />
              </label>
              <button className="btn btn-sm" onClick={downloadExcel}>엑셀 다운로드</button>
              <span className="hint">CSV (UTF-8)</span>
            </div>
          )}
        </div>

        {/* 일반 장비 입력 */}
        <div className="section">
          <h2 className="section-title">{editingItemId ? '장비 수정' : '일반 장비 추가'}</h2>
          <div className="form-row">
            <div>
              <label className="label" style={{ fontSize: 11, color: '#888' }}>종류</label>
              <select className="select" value={newItem.itemType} onChange={e => setNewItem(p => ({ ...p, itemType: e.target.value }))}>
                {itemTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label" style={{ fontSize: 11, color: '#888' }}>단계</label>
              <select className="select" value={newItem.tier} onChange={e => updateNewItemTier(e.target.value)}>
                <option value="혼돈">혼돈</option>
                <option value="심연">심연</option>
              </select>
            </div>
          </div>
          <div className="option-section-title">기본 옵션</div>
          <div className="option-grid">
            {baseOptionTypes.map(opt => {
              const sel = newItem.options[opt.id] !== undefined;
              const max = tierMaxValues[newItem.tier][opt.group];
              return (
                <button key={opt.id} className={`option-btn ${sel ? 'selected' : ''}`} onClick={() => toggleNewItemOption(opt.id)}>
                  <div className="option-name">{opt.abbr}</div>
                  {sel && <input type="number" className="option-input" min="0" max={max} value={newItem.options[opt.id] || ''} onChange={e => updateNewItemOption(opt.id, e.target.value)} onClick={e => e.stopPropagation()} />}
                </button>
              );
            })}
          </div>
          <div className="option-section-title">딜러 옵션</div>
          <div className="option-grid">
            {bonusOptionTypes.map(opt => {
              const sel = newItem.options[opt.id] !== undefined;
              const max = tierMaxValues[newItem.tier][opt.group];
              return (
                <button key={opt.id} className={`option-btn ${sel ? 'selected' : ''}`} onClick={() => toggleNewItemOption(opt.id)}>
                  <div className="option-name">{opt.abbr}</div>
                  {sel && <input type="number" className="option-input" min="0" max={max} value={newItem.options[opt.id] || ''} onChange={e => updateNewItemOption(opt.id, e.target.value)} onClick={e => e.stopPropagation()} />}
                </button>
              );
            })}
          </div>
          <div className="btn-group">
            {editingItemId ? (
              <>
                <button className="btn active" onClick={saveEditItem}>수정 완료</button>
                <button className="btn" onClick={cancelEdit}>취소</button>
              </>
            ) : (
              <button className="btn active" onClick={addItem}>추가</button>
            )}
          </div>
        </div>

        {/* 일반 장비 목록 */}
        <div className="section">
          <div className="list-header">
            <div className="list-header-left">
              <h2 className="section-title" style={{ margin: 0 }}>일반 장비</h2>
              <span className="item-count">({filteredItems.length}/{items.length})</span>
            </div>
            <div className="list-header-right">
              <button className="toggle-btn" onClick={() => setIsListExpanded(!isListExpanded)}>{isListExpanded ? '접기' : '펼치기'}</button>
              {items.length > 0 && <button className="clear-btn" onClick={clearAllItems}>전체 삭제</button>}
            </div>
          </div>
          {isListExpanded && (
            <>
              {items.length > 5 && (
                <div className="list-controls">
                  <input className="search-input" placeholder="단계, 장비, 옵션 검색" value={searchText} onChange={e => setSearchText(e.target.value)} />
                  <select className="filter-select" value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                    <option value="전체">전체 단계</option>
                    <option value="혼돈">혼돈</option>
                    <option value="심연">심연</option>
                  </select>
                </div>
              )}
              {filteredItems.length === 0 ? (
                <div className="empty-state">{items.length === 0 ? '장비를 추가해주세요' : '검색 결과 없음'}</div>
              ) : (
                <div className="item-list">
                  {filteredItems.map(item => (
                    <div key={item.id} className="item-row">
                      <div className="item-row-left">
                        <span className={`tier-badge ${item.tier}`}>{item.tier}</span>
                        <span style={{ fontWeight: 500 }}>{item.itemType}</span>
                        <span className="item-options">
                          {Object.entries(item.options).map(([k, v]) => `${allOptionTypes.find(o => o.id === k)?.abbr}:${v}`).join(' ')}
                        </span>
                      </div>
                      <div className="item-row-right">
                        <button className="card-btn" onClick={() => startEditItem(item)}>수정</button>
                        <button className="card-btn" onClick={() => removeItem(item.id)}>삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 유니크 장비 */}
        <div className="section">
          <h2 className="section-title">
            {editingUniqueId ? '유니크 수정' : '유니크 장비 추가'}
            {selectedUniqueItems.length > 0 && <span className="badge selected">{selectedUniqueItems.length}/2 선택</span>}
          </h2>
          <div className="form-row">
            <div>
              <label className="label" style={{ fontSize: 11, color: '#888' }}>부위</label>
              <select className="select" value={newUniqueItem.itemType} onChange={e => updateNewUniqueItemType(e.target.value)}>
                {Object.keys(uniqueItemDefs).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label" style={{ fontSize: 11, color: '#888' }}>장비</label>
              <select className="select" value={newUniqueItem.uniqueName} onChange={e => setNewUniqueItem(p => ({ ...p, uniqueName: e.target.value, passiveValue: 0 }))}>
                {(uniqueItemDefs[newUniqueItem.itemType] || []).map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          {(() => {
            const def = uniqueDefMap[newUniqueItem.uniqueName];
            return def && (
              <div className="input-box" style={{ marginBottom: 12 }}>
                <label className="label">고유: {def.passive} ({def.min}~{def.max}{def.unit})</label>
                <input type="number" className="input" min={def.min} max={def.max} value={newUniqueItem.passiveValue || ''} onChange={e => setNewUniqueItem(p => ({ ...p, passiveValue: parseInt(e.target.value) || 0 }))} />
              </div>
            );
          })()}
          <div className="option-section-title">옵션 (계승 불가 - 현재 수치)</div>
          <div className="option-grid">
            {[...baseOptionTypes, ...bonusOptionTypes].map(opt => {
              const sel = newUniqueItem.options[opt.id] !== undefined;
              const max = tierMaxValues['유니크'][opt.group];
              return (
                <button key={opt.id} className={`option-btn ${sel ? 'selected' : ''}`} onClick={() => toggleNewUniqueOption(opt.id)}>
                  <div className="option-name">{opt.abbr}</div>
                  {sel && <input type="number" className="option-input" min="0" max={max} value={newUniqueItem.options[opt.id] || ''} onChange={e => updateNewUniqueOption(opt.id, e.target.value)} onClick={e => e.stopPropagation()} />}
                </button>
              );
            })}
          </div>
          <div className="btn-group">
            {editingUniqueId ? (
              <>
                <button className="btn active" onClick={saveEditUniqueItem}>수정 완료</button>
                <button className="btn" onClick={cancelEdit}>취소</button>
              </>
            ) : (
              <button className="btn active" onClick={addUniqueItem}>추가</button>
            )}
          </div>
        </div>

        {/* 유니크 목록 */}
        <div className="section">
          <div className="list-header">
            <div className="list-header-left">
              <h2 className="section-title" style={{ margin: 0 }}>유니크 장비</h2>
              <span className="item-count">({uniqueEquipments.length})</span>
            </div>
            <div className="list-header-right">
              <button className="toggle-btn" onClick={() => setIsUniqueListExpanded(!isUniqueListExpanded)}>{isUniqueListExpanded ? '접기' : '펼치기'}</button>
              {uniqueEquipments.length > 0 && <button className="clear-btn" onClick={clearAllUniqueItems}>전체 삭제</button>}
            </div>
          </div>
          {isUniqueListExpanded && (
            uniqueEquipments.length === 0 ? (
              <div className="empty-state">유니크 장비를 추가해주세요</div>
            ) : (
              <div className="item-list">
                {uniqueEquipments.map(item => {
                  const def = uniqueDefMap[item.uniqueName];
                  return (
                    <div key={item.id} className={`unique-row ${item.selected ? 'selected' : ''}`}>
                      <div className="item-row-left">
                        <button className={`select-btn ${item.selected ? 'selected' : ''}`} onClick={() => toggleUniqueSelection(item.id)}>{item.selected ? '✓' : '○'}</button>
                        <span style={{ fontWeight: 500 }}>{item.uniqueName}</span>
                        <span style={{ color: '#888' }}>({item.itemType})</span>
                        {def && <span className="passive-text">{def.passive} {item.passiveValue}{def.unit}</span>}
                      </div>
                      <div className="item-row-right">
                        <button className="card-btn" onClick={() => startEditUniqueItem(item)}>수정</button>
                        <button className="card-btn" onClick={() => removeUniqueItem(item.id)}>삭제</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
          <p className="hint">유니크는 계승 불가. 선택 시 해당 부위 제외. (최대 2개)</p>
        </div>

        {/* 장비 추천 */}
        <div className="section">
          <h2 className="section-title">장비 추천</h2>
          <div className="toggle-row">
            <span className="toggle-label">치피:</span>
            <button className={`toggle-btn-sm ${includeCritDmg ? 'active' : ''}`} onClick={() => { setIncludeCritDmg(!includeCritDmg); setRaceResults(null); }}>{includeCritDmg ? 'ON' : 'OFF'}</button>
            <span className="toggle-label" style={{ marginLeft: 16 }}>전공:</span>
            <button className={`toggle-btn-sm ${includeTotalAtk ? 'active' : ''}`} onClick={() => { setIncludeTotalAtk(!includeTotalAtk); setRaceResults(null); }}>{includeTotalAtk ? 'ON' : 'OFF'}</button>
          </div>
          <div className="race-btn-group">
            {['demon', 'boss', 'primate'].map(race => (
              <button key={race} className={`race-btn ${selectedRace === race ? 'active' : ''}`} onClick={() => handleRaceSelect(race)} disabled={isCalculating || (items.length === 0 && selectedUniqueItems.length === 0)}>
                {raceNames[race]}
              </button>
            ))}
          </div>

          {isCalculating && (
            <div className="loading">
              <div className="spinner"></div>
              <p>최적 조합 분석 중...</p>
            </div>
          )}

          {raceResults && !isCalculating && (
            <div className="result-card">
              <div className="result-header">
                <span className="result-badge">{raceNames[raceResults.selectedRace]} 최적 조합</span>
                {includeCritDmg && <span className="result-meta">+ 치피</span>}
                {includeTotalAtk && <span className="result-meta">+ 전공</span>}
                <span className="result-meta">비용: {raceResults.totalCost}</span>
              </div>

              <div className="result-summary">
                <div className="summary-item">
                  <div className="summary-label">{raceNames[raceResults.selectedRace]}</div>
                  <div className="summary-value">{raceResults.raceTotal}</div>
                </div>
                {includeCritDmg && (
                  <div className="summary-item">
                    <div className="summary-label">치피</div>
                    <div className="summary-value">{raceResults.critDmgTotal}</div>
                  </div>
                )}
                {includeTotalAtk && (
                  <div className="summary-item">
                    <div className="summary-label">전공</div>
                    <div className="summary-value">{raceResults.totalAtkTotal}</div>
                  </div>
                )}
              </div>

              <div className="sub-title">추천 장비 ({raceResults.combination.length}개)</div>
              {raceResults.itemGrades.map((ig, idx) => {
                const item = ig.item;
                const isUnique = ig.isUnique;
                const def = isUnique ? uniqueDefMap[item.uniqueName] : null;
                const gradeClass = ig.gradeString.startsWith('MMM') ? 'high' : ig.gradeString.startsWith('MM') ? 'mid' : ig.gradeString === '계승불가' ? 'unique' : 'good';

                return (
                  <div key={idx} className={`equip-card ${isUnique ? 'unique' : ''}`}>
                    <div className="equip-header">
                      <span className="equip-name">{isUnique ? item.uniqueName : item.itemType} {!isUnique && `(${item.tier})`}</span>
                      <span className={`grade-tag ${gradeClass}`}>{ig.gradeString}</span>
                    </div>
                    <div className="equip-options">
                      {Object.entries(ig.optionGrades).map(([optId, info]) => {
                        const opt = allOptionTypes.find(o => o.id === optId);
                        const upgraded = info.upgraded !== info.current;
                        return (
                          <span key={optId} className="opt-item">
                            <span className="opt-name">{opt?.abbr}:</span>
                            {upgraded ? (
                              <>
                                <span style={{ textDecoration: 'line-through', color: '#999' }}>{info.current === 0 ? info.upgraded : info.current}</span>
                                <span className="opt-upgrade">→{info.upgraded}</span>
                              </>
                            ) : (
                              <span className="opt-val">{info.current === 0 ? info.upgraded : info.current}</span>
                            )}
                            {info.grade !== '-' && <span className="opt-grade">({info.grade})</span>}
                          </span>
                        );
                      })}
                    </div>
                    {def && <div className="passive-info">{def.passive}: {item.passiveValue}{def.unit}</div>}
                  </div>
                );
              })}

              <div className="sub-title">목표 달성 현황</div>
              {baseOptionTypes.map(opt => {
                const detail = raceResults.optionDetails[opt.id];
                if (!detail) return null;
                const slotExceeded = detail.usedSlots > detail.targetSlots;
                const status = slotExceeded ? 'failed' : detail.shortage > 0 ? 'failed' : detail.excess > 3 ? 'excess' : 'achieved';
                return (
                  <div key={opt.id} className={`target-item ${status}`}>
                    <div className="target-header">
                      <span className="target-name">{opt.name}</span>
                      <span className={`target-slots ${slotExceeded ? 'exceeded' : ''}`}>
                        {detail.usedSlots}/{detail.targetSlots} 부위
                        {slotExceeded && ' ⚠'}
                      </span>
                    </div>
                    <div className="target-detail">
                      목표: {detail.target} / 계승: {detail.fromGear}
                      {detail.runeNeeded > 0 && <span style={{ color: '#1a73e8' }}> + 룬 {detail.runeNeeded}</span>}
                      {' '}= <strong>{detail.final}</strong>
                    </div>
                    {slotExceeded ? (
                      <div className="target-status err">⚠ 부위 초과: {detail.usedSlots - detail.targetSlots}개</div>
                    ) : detail.shortage > 0 ? (
                      <div className="target-status err">⚠ 부족: {detail.shortage}</div>
                    ) : detail.excess > 3 ? (
                      <div className="target-status warn">⚠ 초과: +{detail.excess} (3 이내 권장)</div>
                    ) : detail.excess > 0 ? (
                      <div className="target-status ok">✓ 달성 (+{detail.excess})</div>
                    ) : (
                      <div className="target-status ok">✓ 정확히 달성</div>
                    )}
                  </div>
                );
              })}

              <div className={`final-box ${raceResults.allTargetsMet ? '' : 'error'}`}>
                {raceResults.allTargetsMet ? (
                  <>
                    <div className="final-title">✓ 모든 목표 달성</div>
                    <div className="final-detail">
                      {raceNames[raceResults.selectedRace]}: {raceResults.raceTotal}
                      {includeCritDmg && ` / 치피: ${raceResults.critDmgTotal}`}
                      {includeTotalAtk && ` / 전공: ${raceResults.totalAtkTotal}`}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="final-title">⚠ 일부 목표 미달성</div>
                    <div className="final-detail">장비를 추가하거나 부위 수를 조정해보세요.</div>
                  </>
                )}
              </div>
            </div>
          )}

          {!raceResults && !isCalculating && (items.length > 0 || selectedUniqueItems.length > 0) && (
            <div className="empty-state">종족 버튼을 클릭하여 최적 조합을 확인하세요</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCalculator;