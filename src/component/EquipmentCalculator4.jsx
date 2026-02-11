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
const raceOptionIds = ['demon', 'boss', 'primate'];
const dealerOptionIds = ['demon', 'boss', 'primate', 'critDmg', 'totalAtk'];

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

// 룬 최대값 (1세트당 1개만 적용)
const runeMaxValues = {
  critRate: 6, atkSpeed: 6, evasion: 6,
  dmgReduce: 12, lifesteal: 12, moveSpeed: 12
};

// 로컬스토리지 키
const STORAGE_KEY = 'equipment_calc_v6';
const STORAGE_KEY_UNIQUE = 'equipment_calc_unique_v6';

// 엑셀 헤더
const excelHeaders = ['장비종류', '단계', '유니크', '고유옵션', '치확', '공속', '회피', '받뎀감', '흡혈', '이속', '악마', '보스', '영장', '치피', '전공', '체력', '방어'];
const headerToOptionId = {
  '치확': 'critRate', '공속': 'atkSpeed', '회피': 'evasion',
  '받뎀감': 'dmgReduce', '흡혈': 'lifesteal', '이속': 'moveSpeed',
  '악마': 'demon', '보스': 'boss', '영장': 'primate',
  '치피': 'critDmg', '전공': 'totalAtk', '체력': 'health', '방어': 'depend'
};

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
  if (tier === '유니크') return 0;
  return GRADE_VALUES[group]?.[tier]?.[grade] || 0;
};

// 목표 달성을 위한 최소 등급 찾기
const findMinGradeForTarget = (tier, group, targetPerSlot) => {
  if (tier === '유니크') return { grade: '-', value: 0 };
  
  // C부터 M까지 검사하여 목표 달성 가능한 최소 등급 찾기
  for (const grade of [...GRADES].reverse()) {
    const val = getGradeValue(tier, group, grade);
    if (val >= targetPerSlot) {
      return { grade, value: val };
    }
  }
  // M으로도 불가능하면 M 반환
  return { grade: 'M', value: getGradeValue(tier, group, 'M') };
};

// ===== 장비별 최적 계승 등급 계산 =====
// 핵심 로직: 딜러 옵션(종족/치피/전공)은 M등급, 목표 옵션은 최소 등급으로 목표 달성
const calculateOptimalGradesForItem = (item, targetConfigs, raceId, includeCritDmg, includeTotalAtk) => {
  if (item.tier === '유니크') {
    // 유니크는 계승 불가
    const optionGrades = {};
    Object.entries(item.options).forEach(([optId, val]) => {
      optionGrades[optId] = { current: val, upgraded: val, grade: '-' };
    });
    return { optionGrades, gradeString: '계승불가', cost: 0, isUnique: true };
  }

  const optionGrades = {};
  const gradeList = [];
  let totalCost = 0;

  // 아이템이 가진 옵션들을 분류 (0도 포함 - M작 가정)
  const itemOptions = Object.keys(item.options).filter(id => item.options[id] !== undefined);
  
  itemOptions.forEach(optId => {
    const optDef = allOptionTypes.find(o => o.id === optId);
    if (!optDef) return;

    const currentValue = item.options[optId];
    let assignedGrade = 'C';
    let upgradedValue = getGradeValue(item.tier, optDef.group, 'C');

    // 1. 딜러 옵션(종족/치피/전공)은 항상 M등급
    if (optId === raceId || 
        (optId === 'critDmg' && includeCritDmg) || 
        (optId === 'totalAtk' && includeTotalAtk)) {
      assignedGrade = 'M';
      upgradedValue = getGradeValue(item.tier, optDef.group, 'M');
    }
    // 2. 목표 옵션은 목표 달성을 위한 최소 등급
    else if (targetConfigs[optId]?.value > 0 && targetConfigs[optId]?.slots > 0) {
      const targetTotal = targetConfigs[optId].value;
      const targetSlots = targetConfigs[optId].slots;
      const runeMax = runeMaxValues[optId] || 0;
      
      // 목표 달성에 필요한 슬롯당 수치 (룬 1개 적용 가정)
      // (슬롯당수치 * 슬롯수) + 룬 >= 목표
      // 슬롯당수치 >= (목표 - 룬) / 슬롯수
      const targetPerSlot = Math.ceil((targetTotal - runeMax) / targetSlots);
      
      const { grade, value } = findMinGradeForTarget(item.tier, optDef.group, targetPerSlot);
      assignedGrade = grade;
      upgradedValue = value;
    }
    // 3. 그 외 옵션은 최저 등급 C
    else {
      assignedGrade = 'C';
      upgradedValue = getGradeValue(item.tier, optDef.group, 'C');
    }

    optionGrades[optId] = {
      current: currentValue,
      upgraded: upgradedValue,
      grade: assignedGrade
    };
    gradeList.push(assignedGrade);
    totalCost += GRADE_COST[assignedGrade] || 0;
  });

  // 등급 문자열 생성 (정렬: M > SS > S > A > B > C)
  const gradeOrder = { M: 0, SS: 1, S: 2, A: 3, B: 4, C: 5 };
  gradeList.sort((a, b) => gradeOrder[a] - gradeOrder[b]);
  const gradeString = gradeList.join('') || '-';

  return { optionGrades, gradeString, cost: totalCost, isUnique: false };
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
      const tier = '심연';
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
        item.options.critDmg || '', item.options.totalAtk || '', item.options.health || '', item.options.depend || ''
      ];
      rows.push(row.join(','));
    });
    const csvContent = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `장비목록_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) { alert('유효한 데이터가 없습니다.'); return; }
        const headers = lines[0].split(',').map(h => h.trim());
        const itemTypeIdx = headers.indexOf('장비종류');
        const tierIdx = headers.indexOf('단계');
        const uniqueIdx = headers.indexOf('유니크');
        const passiveIdx = headers.indexOf('고유옵션');
        if (itemTypeIdx === -1 || tierIdx === -1) { alert('헤더에 "장비종류"와 "단계" 열이 필요합니다.'); return; }
        const newItems = [], newUniqueItems = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 2) continue;
          const itemType = values[itemTypeIdx];
          const tier = values[tierIdx];
          const uniqueName = uniqueIdx !== -1 ? values[uniqueIdx] : '';
          const passiveValue = passiveIdx !== -1 ? parseInt(values[passiveIdx]) || 0 : 0;
          if (!itemTypes.includes(itemType)) continue;
          const options = {};
          headers.forEach((header, idx) => {
            if (['장비종류', '단계', '유니크', '고유옵션'].includes(header)) return;
            const optionId = headerToOptionId[header];
            if (!optionId) return;
            const value = parseInt(values[idx]);
            // 0도 허용 (M작 가정), NaN이나 빈값만 제외
            if (!isNaN(value) && values[idx].trim() !== '') options[optionId] = value;
          });
          if (uniqueName && allUniqueNames.includes(uniqueName)) {
            newUniqueItems.push({ id: Date.now() + i + 10000, itemType, uniqueName, passiveValue, options, selected: false, tier: '유니크' });
          } else if (['혼돈', '심연'].includes(tier)) {
            if (Object.keys(options).length > 0) {
              newItems.push({ id: Date.now() + i, tier, itemType, options });
            }
          }
        }
        if (newItems.length === 0 && newUniqueItems.length === 0) { alert('유효한 장비 데이터가 없습니다.'); return; }
        if (newItems.length > 0) setItems(prev => [...prev, ...newItems]);
        if (newUniqueItems.length > 0) setUniqueEquipments(prev => [...prev, ...newUniqueItems]);
        setIsTestMode(false);
        setRaceResults(null);
        alert(`일반 ${newItems.length}개, 유니크 ${newUniqueItems.length}개 장비가 추가되었습니다.`);
      } catch (error) {
        console.error('Excel parse error:', error);
        alert('파일 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  // 타겟 설정
  const updateTargetValue = (optionId, value) => {
    setTargetConfigs(prev => ({
      ...prev,
      [optionId]: { ...prev[optionId], value: Math.min(parseInt(value) || 0, 100) }
    }));
    setRaceResults(null);
  };

  const updateTargetSlots = (optionId, slots) => {
    setTargetConfigs(prev => ({
      ...prev,
      [optionId]: { ...prev[optionId], slots: Math.min(Math.max(parseInt(slots) || 0, 0), 8) }
    }));
    setRaceResults(null);
  };

  // 일반 장비 CRUD
  const toggleNewItemOption = (optionId) => {
    setNewItem(prev => {
      const newOptions = { ...prev.options };
      if (newOptions[optionId] !== undefined) {
        delete newOptions[optionId];
      } else {
        const opt = allOptionTypes.find(o => o.id === optionId);
        newOptions[optionId] = tierMaxValues[prev.tier][opt.group];
      }
      return { ...prev, options: newOptions };
    });
  };

  const updateNewItemOptionValue = (optionId, value) => {
    const opt = allOptionTypes.find(o => o.id === optionId);
    const max = tierMaxValues[newItem.tier][opt.group];
    setNewItem(prev => ({ ...prev, options: { ...prev.options, [optionId]: Math.min(parseInt(value) || 0, max) } }));
  };

  const updateNewItemTier = (tier) => {
    setNewItem(prev => {
      const newOptions = {};
      Object.keys(prev.options).forEach(optId => {
        const opt = allOptionTypes.find(o => o.id === optId);
        newOptions[optId] = tierMaxValues[tier][opt.group];
      });
      return { ...prev, tier, options: newOptions };
    });
  };

  const addItem = () => {
    if (Object.keys(newItem.options).length === 0) { alert('최소 1개의 옵션을 선택해주세요.'); return; }
    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ tier: '심연', itemType: '무기', options: {} });
    setRaceResults(null);
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItem({ tier: item.tier, itemType: item.itemType, options: { ...item.options } });
  };

  const saveEditItem = () => {
    if (Object.keys(newItem.options).length === 0) { alert('최소 1개의 옵션을 선택해주세요.'); return; }
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
  const clearAllItems = () => { if (confirm('모든 일반 장비를 삭제하시겠습니까?')) { setItems([]); setRaceResults(null); } };

  // 유니크 장비 CRUD
  const toggleNewUniqueOption = (optionId) => {
    setNewUniqueItem(prev => {
      const newOptions = { ...prev.options };
      if (newOptions[optionId] !== undefined) {
        delete newOptions[optionId];
      } else {
        const opt = allOptionTypes.find(o => o.id === optionId);
        newOptions[optionId] = tierMaxValues['유니크'][opt.group];
      }
      return { ...prev, options: newOptions };
    });
  };

  const updateNewUniqueOptionValue = (optionId, value) => {
    const opt = allOptionTypes.find(o => o.id === optionId);
    const max = tierMaxValues['유니크'][opt.group];
    setNewUniqueItem(prev => ({ ...prev, options: { ...prev.options, [optionId]: Math.min(parseInt(value) || 0, max) } }));
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

  // ===== 최적 조합 탐색 =====
  const findBestCombination = useCallback(async (raceId) => {
    setIsCalculating(true);
    setRaceResults(null);
    await new Promise(r => setTimeout(r, 10));

    const selectedUniques = uniqueEquipments.filter(u => u.selected);
    const selectedUniqueTypesList = selectedUniques.map(u => u.itemType);

    // 1. 종족 필터링: 선택한 종족 옵션이 있는 장비만 포함 (0도 허용 - M작 가정)
    const raceFilteredItems = items.filter(item => 
      !selectedUniqueTypesList.includes(item.itemType) && 
      item.options[raceId] !== undefined
    );

    if (raceFilteredItems.length === 0 && selectedUniques.length === 0) {
      alert('선택한 종족 옵션을 가진 장비가 없습니다.');
      setIsCalculating(false);
      return;
    }

    // 활성화된 목표 옵션 목록
    const activeTargetOpts = Object.keys(targetConfigs).filter(id => 
      targetConfigs[id].value > 0 && targetConfigs[id].slots > 0
    );

    // 2. 각 장비에 대해 최적 계승 등급 계산 및 티어 분류
    const processedItems = raceFilteredItems.map(item => {
      const gradeInfo = calculateOptimalGradesForItem(item, targetConfigs, raceId, includeCritDmg, includeTotalAtk);
      
      // 계승 후 수치 계산
      const upgradedValues = {};
      Object.entries(gradeInfo.optionGrades).forEach(([optId, info]) => {
        upgradedValues[optId] = info.upgraded;
      });

      // 장비 특성 분석
      const hasRace = upgradedValues[raceId] !== undefined;
      const hasCritDmg = upgradedValues.critDmg !== undefined;
      const hasTotalAtk = upgradedValues.totalAtk !== undefined;
      
      // 목표 옵션 보유 개수
      const targetOptCount = activeTargetOpts.filter(id => upgradedValues[id] !== undefined).length;
      
      // 딜러 옵션 점수 (종족은 필수이므로 치피+전공만)
      const dealerScore = (hasCritDmg ? 2 : 0) + (hasTotalAtk ? 1 : 0);
      
      // 종합 점수: 목표옵션 있으면서 딜러옵션 많은 게 최고
      // 티어1: 목표옵션O + 치피O + 전공O (점수: 30000+)
      // 티어2: 목표옵션X + 치피O + 전공O (점수: 20000+)
      // 티어3: 목표옵션O + 치피O or 전공O (점수: 10000+)
      // 티어4: 나머지
      let tierScore = 0;
      if (targetOptCount > 0 && hasCritDmg && hasTotalAtk) tierScore = 30000;
      else if (targetOptCount === 0 && hasCritDmg && hasTotalAtk) tierScore = 20000;
      else if (targetOptCount > 0 && (hasCritDmg || hasTotalAtk)) tierScore = 10000;
      else if (targetOptCount > 0) tierScore = 5000;
      
      // 세부 점수: 종족 수치 + 치피 수치 + 전공 수치
      const detailScore = (upgradedValues[raceId] || 0) * 10 +
                          (hasCritDmg ? (upgradedValues.critDmg || 0) : 0) * 5 +
                          (hasTotalAtk ? (upgradedValues.totalAtk || 0) : 0) * 2;

      return {
        ...item,
        gradeInfo,
        upgradedValues,
        hasRace,
        hasCritDmg,
        hasTotalAtk,
        targetOptCount,
        dealerScore,
        score: tierScore + detailScore
      };
    });

    // 3. 부위별 그룹화 및 상위 후보 선택
    const types = itemTypes.filter(t => !selectedUniqueTypesList.includes(t));
    const itemsByType = {};
    
    types.forEach(t => {
      const list = processedItems.filter(it => it.itemType === t);
      if (list.length === 0) {
        itemsByType[t] = [];
        return;
      }
      
      // 점수순 정렬
      list.sort((a, b) => b.score - a.score);
      
      const selected = new Map(); // id -> item
      
      // 1. 최상위 티어 (종족+치피+전공+목표옵션) 최대 2개
      const tier1 = list.filter(it => it.targetOptCount > 0 && it.hasCritDmg && it.hasTotalAtk);
      tier1.slice(0, 2).forEach(it => selected.set(it.id, it));
      
      // 2. 딜러만 (종족+치피+전공, 목표옵션X) 최대 1개
      const tier2 = list.filter(it => it.targetOptCount === 0 && it.hasCritDmg && it.hasTotalAtk && !selected.has(it.id));
      tier2.slice(0, 1).forEach(it => selected.set(it.id, it));
      
      // 3. 각 목표 옵션별로 해당 옵션을 가진 최고 장비 1개씩
      activeTargetOpts.forEach(optId => {
        const bestForOpt = list.find(it => 
          it.upgradedValues[optId] !== undefined && !selected.has(it.id)
        );
        if (bestForOpt) selected.set(bestForOpt.id, bestForOpt);
      });
      
      // 4. 목표옵션 + 치피 (전공X) 조합 1개
      const tier3a = list.find(it => 
        it.targetOptCount > 0 && it.hasCritDmg && !it.hasTotalAtk && !selected.has(it.id)
      );
      if (tier3a) selected.set(tier3a.id, tier3a);
      
      // 5. 목표옵션 + 전공 (치피X) 조합 1개
      const tier3b = list.find(it => 
        it.targetOptCount > 0 && !it.hasCritDmg && it.hasTotalAtk && !selected.has(it.id)
      );
      if (tier3b) selected.set(tier3b.id, tier3b);
      
      // 점수순 재정렬
      itemsByType[t] = Array.from(selected.values()).sort((a, b) => b.score - a.score);
    });

    // 4. 조합 탐색
    let best = { score: -Infinity, result: null };
    const typeKeys = Object.keys(itemsByType);

    const solve = (idx, currentComb) => {
      if (idx === typeKeys.length) {
        const fullComb = [...selectedUniques, ...currentComb];
        
        // 결과 계산
        let raceTotal = 0, critDmgTotal = 0, totalAtkTotal = 0;
        const gearSums = {};
        const usedSlots = {};
        
        baseOptionTypes.forEach(o => { gearSums[o.id] = 0; usedSlots[o.id] = 0; });

        fullComb.forEach(it => {
          const vals = it.upgradedValues || it.options;
          Object.entries(vals).forEach(([optId, val]) => {
            if (optId === raceId) raceTotal += val;
            else if (optId === 'critDmg') critDmgTotal += val;
            else if (optId === 'totalAtk') totalAtkTotal += val;
            else if (gearSums[optId] !== undefined) {
              gearSums[optId] += val;
              usedSlots[optId] += 1;
            }
          });
        });

        // 목표 달성 검사 및 점수 계산
        let allTargetsMet = true;
        let penalty = 0;
        let bonus = 0;
        const optionDetails = {};

        for (const optId of Object.keys(targetConfigs)) {
          const config = targetConfigs[optId];
          if (config.value <= 0) continue;

          const slots = usedSlots[optId];
          const runeMax = runeMaxValues[optId] || 0;
          const gearOnly = gearSums[optId];
          
          // 룬 사용 여부 결정: 계승만으로 목표 달성 가능하면 룬 안 씀
          let runeVal = 0;
          let finalVal = gearOnly;
          
          if (slots > 0) {
            if (gearOnly >= config.value) {
              // 계승만으로 달성 → 룬 불필요
              runeVal = 0;
              finalVal = gearOnly;
            } else if (gearOnly + runeMax >= config.value) {
              // 계승 + 룬으로 달성 가능 → 필요한 만큼만 룬 사용
              runeVal = Math.min(runeMax, config.value - gearOnly);
              finalVal = gearOnly + runeVal;
            } else {
              // 룬 최대로 써도 미달
              runeVal = runeMax;
              finalVal = gearOnly + runeMax;
            }
          }

          // 목표 미달 페널티
          if (finalVal < config.value) {
            allTargetsMet = false;
            penalty += (config.value - finalVal) * 5000;
          }
          
          // 부위 초과 페널티 (강하지만 allTargetsMet은 유지 - 어쩔 수 없이 허용)
          if (slots > config.slots) {
            penalty += (slots - config.slots) * 8000;
          }

          // 부위 절약 보너스 (목표 달성 + 부위 적게 사용)
          if (finalVal >= config.value && slots <= config.slots && slots > 0) {
            bonus += (config.slots - slots) * 2000; // 부위 절약 보너스 강화
          }
          
          // 룬 미사용 보너스 (계승만으로 달성)
          if (finalVal >= config.value && runeVal === 0 && slots > 0) {
            bonus += 500;
          }

          const excess = finalVal - config.value;

          optionDetails[optId] = {
            target: config.value,
            final: finalVal,
            fromGear: gearOnly,
            runeVal,
            runeUsed: runeVal > 0,
            usedSlots: slots,
            targetSlots: config.slots,
            excess
          };
        }

        // 최종 점수: 목표 달성 여부가 최우선
        // 모든 목표 달성 시에만 딜러 옵션으로 비교
        const baseScore = allTargetsMet ? 1000000000 : 0;
        const score = baseScore + 
                     (raceTotal * 100) + 
                     (includeCritDmg ? critDmgTotal * 50 : 0) + 
                     (includeTotalAtk ? totalAtkTotal * 25 : 0) + 
                     bonus - penalty;

        if (score > best.score) {
          best = {
            score,
            result: {
              combination: fullComb,
              raceTotal,
              critDmgTotal,
              totalAtkTotal,
              optionDetails,
              allTargetsMet
            }
          };
        }
        return;
      }

      const currentType = typeKeys[idx];
      const candidates = itemsByType[currentType];
      
      if (candidates.length === 0) {
        // 해당 부위에 장비가 없으면 스킵
        solve(idx + 1, currentComb);
      } else {
        for (const item of candidates) {
          solve(idx + 1, [...currentComb, item]);
        }
      }
    };

    solve(0, []);

    // 5. 결과 설정
    if (best.result) {
      const itemGrades = best.result.combination.map(item => {
        if (item.gradeInfo) {
          return {
            item,
            ...item.gradeInfo
          };
        } else {
          // 유니크
          const optionGrades = {};
          Object.entries(item.options).forEach(([optId, val]) => {
            optionGrades[optId] = { current: val, upgraded: val, grade: '-' };
          });
          return {
            item,
            optionGrades,
            gradeString: '계승불가',
            isUnique: true
          };
        }
      });

      setRaceResults({
        selectedRace: raceId,
        combination: best.result.combination,
        itemGrades,
        raceTotal: best.result.raceTotal,
        critDmgTotal: best.result.critDmgTotal,
        totalAtkTotal: best.result.totalAtkTotal,
        optionDetails: best.result.optionDetails,
        allTargetsMet: best.result.allTargetsMet,
        totalCost: itemGrades.reduce((sum, ig) => sum + (ig.cost || 0), 0)
      });
    } else {
      alert('조합을 찾을 수 없습니다. 장비를 추가해주세요.');
    }

    setIsCalculating(false);
  }, [items, uniqueEquipments, targetConfigs, includeCritDmg, includeTotalAtk]);

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
          <p className="subtitle">목표 수치를 달성하면서 종족/치피/전공을 최대화하는 조합 + 최적 계승 등급 추천</p>
          <img className="hits" alt="Hits" src="https://hits.sh/github.com/worldsource93.svg?view=today-total"></img>
        </div>

        {/* 목표 설정 */}
        <div className="section">
          <h2 className="section-title">목표 설정</h2>
          <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>각 옵션의 목표 수치와 사용할 부위 수를 설정하세요. (룬은 1세트에 1개만 적용)</p>
          <div className="target-grid">
            {baseOptionTypes.map(opt => (
              <div key={opt.id} className="target-box">
                <div className="target-label">
                  {opt.abbr}
                </div>
                <div className="target-inputs">
                  <div className="target-input">
                    <label>목표</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={targetConfigs[opt.id]?.value || ''}
                      onChange={e => updateTargetValue(opt.id, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="target-input">
                    <label>부위</label>
                    <input
                      type="number"
                      min="0"
                      max="8"
                      value={targetConfigs[opt.id]?.slots || ''}
                      onChange={e => updateTargetSlots(opt.id, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 계산 모드 */}
        <div className="section">
          <h2 className="section-title">계산 모드</h2>
          <div className="btn-row">
            <button
              className={`btn ${!isTestMode ? 'active' : ''}`}
              onClick={() => {
                setIsTestMode(false);
                setItems(loadFromStorage(STORAGE_KEY));
                setUniqueEquipments(loadFromStorage(STORAGE_KEY_UNIQUE));
                setRaceResults(null);
              }}
            >
              실제 수치 입력
            </button>
            <button
              className={`btn ${isTestMode ? 'active' : ''}`}
              onClick={() => {
                setIsTestMode(true);
                generateDummyData(80);
              }}
            >
              테스트 모드
            </button>
          </div>

          {isTestMode && (
            <div className="test-controls">
              <span className="test-label">더미 생성:</span>
              <button className="btn btn-sm" onClick={() => generateDummyData(50)}>50개</button>
              <button className="btn btn-sm" onClick={() => generateDummyData(100)}>100개</button>
              <button className="btn btn-sm" onClick={() => generateDummyData(200)}>200개</button>
            </div>
          )}

          {!isTestMode && (
            <div className="excel-controls">
              <label className="btn btn-sm">
                엑셀 업로드
                <input type="file" accept=".csv,.txt" onChange={handleExcelUpload} style={{ display: 'none' }} />
              </label>
              <button className="btn btn-sm" onClick={downloadExcel}>엑셀 다운로드</button>
              <span className="excel-hint">CSV (UTF-8)</span>
            </div>
          )}

          <p className="hint">{isTestMode ? '테스트 모드: 심연 + 종족 + 치피 + 전공 + 1유효옵션 더미 데이터' : '실제 수치 입력 모드. 자동 저장됩니다.'}</p>
        </div>

        {/* 일반 장비 입력 */}
        <div className="section">
          <h2 className="section-title">{editingItemId ? '일반 장비 수정' : '일반 장비 추가'}</h2>
          <div className="form-row">
            <div>
              <label>종류</label>
              <select value={newItem.itemType} onChange={e => setNewItem(prev => ({ ...prev, itemType: e.target.value }))}>
                {itemTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>단계</label>
              <select value={newItem.tier} onChange={e => updateNewItemTier(e.target.value)}>
                <option value="혼돈">혼돈</option>
                <option value="심연">심연</option>
              </select>
            </div>
          </div>

          <div className="option-section-label">기본 옵션</div>
          <div className="option-grid">
            {baseOptionTypes.map(opt => {
              const isSelected = newItem.options[opt.id] !== undefined;
              const max = tierMaxValues[newItem.tier][opt.group];
              return (
                <div
                  key={opt.id}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleNewItemOption(opt.id)}
                >
                  <div className="name">{opt.abbr}</div>
                  {isSelected && (
                    <input
                      type="number"
                      min="0"
                      max={max}
                      value={newItem.options[opt.id] || ''}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateNewItemOptionValue(opt.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="option-section-label">딜러 옵션</div>
          <div className="option-grid">
            {bonusOptionTypes.map(opt => {
              const isSelected = newItem.options[opt.id] !== undefined;
              const max = tierMaxValues[newItem.tier][opt.group];
              return (
                <div
                  key={opt.id}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleNewItemOption(opt.id)}
                >
                  <div className="name">{opt.abbr}</div>
                  {isSelected && (
                    <input
                      type="number"
                      min="0"
                      max={max}
                      value={newItem.options[opt.id] || ''}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateNewItemOptionValue(opt.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="btn-row">
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
              <div className="list-controls">
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <select value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                  <option value="전체">전체 단계</option>
                  <option value="혼돈">혼돈</option>
                  <option value="심연">심연</option>
                </select>
              </div>

              {filteredItems.length === 0 ? (
                <div className="empty-state">{items.length === 0 ? '장비를 추가해주세요' : '검색 결과가 없습니다'}</div>
              ) : (
                <div className="item-list">
                  {filteredItems.map(item => {
                    const optText = Object.entries(item.options)
                      .map(([id, val]) => `${allOptionTypes.find(o => o.id === id)?.abbr}:${val}`)
                      .join(' ');
                    return (
                      <div key={item.id} className="item-row">
                        <div className="item-row-left">
                          <span className={`tier-badge ${item.tier}`}>{item.tier}</span>
                          <span style={{ fontWeight: 500 }}>{item.itemType}</span>
                          <span className="item-options">{optText}</span>
                        </div>
                        <div className="item-row-right">
                          <button className="card-btn" onClick={() => startEditItem(item)}>수정</button>
                          <button className="card-btn" onClick={() => removeItem(item.id)}>삭제</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* 유니크 장비 입력 */}
        <div className="section">
          <h2 className="section-title">
            {editingUniqueId ? '유니크 장비 수정' : '유니크 장비 추가'}
            {selectedUniqueItems.length > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: '#4a90d9' }}>({selectedUniqueItems.length}/2 선택)</span>}
          </h2>
          <div className="form-row">
            <div>
              <label>부위</label>
              <select value={newUniqueItem.itemType} onChange={e => updateNewUniqueItemType(e.target.value)}>
                {Object.keys(uniqueItemDefs).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>장비명</label>
              <select value={newUniqueItem.uniqueName} onChange={e => setNewUniqueItem(prev => ({ ...prev, uniqueName: e.target.value, passiveValue: 0 }))}>
                {(uniqueItemDefs[newUniqueItem.itemType] || []).map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {(() => {
            const def = uniqueDefMap[newUniqueItem.uniqueName];
            if (!def) return null;
            return (
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
                  고유옵션: {def.passive} ({def.min}~{def.max}{def.unit})
                </label>
                <input
                  type="number"
                  min={def.min}
                  max={def.max}
                  value={newUniqueItem.passiveValue || ''}
                  onChange={e => setNewUniqueItem(prev => ({ ...prev, passiveValue: parseInt(e.target.value) || 0 }))}
                  placeholder={`${def.min}~${def.max}`}
                  style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                />
              </div>
            );
          })()}

          <div className="option-section-label">기본 옵션 (계승 불가)</div>
          <div className="option-grid">
            {baseOptionTypes.map(opt => {
              const isSelected = newUniqueItem.options[opt.id] !== undefined;
              const max = tierMaxValues['유니크'][opt.group];
              return (
                <div
                  key={opt.id}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleNewUniqueOption(opt.id)}
                >
                  <div className="name">{opt.abbr}</div>
                  {isSelected && (
                    <input
                      type="number"
                      min="0"
                      max={max}
                      value={newUniqueItem.options[opt.id] || ''}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateNewUniqueOptionValue(opt.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="option-section-label">딜러 옵션 (계승 불가)</div>
          <div className="option-grid">
            {bonusOptionTypes.map(opt => {
              const isSelected = newUniqueItem.options[opt.id] !== undefined;
              const max = tierMaxValues['유니크'][opt.group];
              return (
                <div
                  key={opt.id}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleNewUniqueOption(opt.id)}
                >
                  <div className="name">{opt.abbr}</div>
                  {isSelected && (
                    <input
                      type="number"
                      min="0"
                      max={max}
                      value={newUniqueItem.options[opt.id] || ''}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateNewUniqueOptionValue(opt.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="btn-row">
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
                        <span style={{ color: item.selected ? '#aaa' : '#888' }}>({item.itemType})</span>
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
                
                // 등급 태그 색상 결정
                let gradeClass = 'good';
                if (ig.gradeString === '계승불가') gradeClass = 'unique';
                else if (ig.gradeString.startsWith('MMM')) gradeClass = 'high';
                else if (ig.gradeString.startsWith('MM')) gradeClass = 'mid';

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
                                <span style={{ textDecoration: 'line-through', color: '#999' }}>{info.current}</span>
                                <span className="opt-upgrade">→{info.upgraded}</span>
                              </>
                            ) : (
                              <span className="opt-val">{info.current}</span>
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
                const targetNotMet = detail.final < detail.target;
                const excessWarn = detail.excess > 3 && !targetNotMet && !slotExceeded;
                
                let status = 'achieved';
                if (targetNotMet) status = 'failed';
                else if (slotExceeded) status = 'excess'; // 부위 초과지만 달성은 함
                else if (excessWarn) status = 'excess';

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
                      목표: {detail.target} / 최종: {detail.final}
                      <div style={{ fontSize: '0.85em', color: '#666' }}>
                        계승합 {detail.fromGear}
                        {detail.runeVal > 0 ? ` + 룬 ${detail.runeVal}` : ' (룬 불필요)'}
                      </div>
                    </div>
                    {targetNotMet ? (
                      <div className="target-status err">✗ 미달: {detail.target - detail.final}</div>
                    ) : slotExceeded ? (
                      <div className="target-status warn">⚠ 부위 초과 +{detail.usedSlots - detail.targetSlots} (달성은 함)</div>
                    ) : excessWarn ? (
                      <div className="target-status warn">⚠ 초과: +{detail.excess} (부위 절약 권장)</div>
                    ) : (
                      <div className="target-status ok">✓ 달성 {detail.excess > 0 ? `(+${detail.excess})` : ''}</div>
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
                    <div className="final-detail">장비를 추가하거나 목표/부위 수를 조정해보세요.</div>
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