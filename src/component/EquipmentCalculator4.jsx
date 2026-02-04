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

// 현재 수치로부터 등급 추정
const estimateGrade = (tier, group, value) => {
  if (!value || tier === '유니크') return null;
  const tierGrades = GRADE_VALUES[group]?.[tier];
  if (!tierGrades) return null;
  for (const grade of GRADES) {
    if (value >= tierGrades[grade]) return grade;
  }
  return 'C';
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

  // 더미 데이터 생성
  // const generateDummyData = useCallback((count) => {
  //   const newItems = [];
  //   const tiers = ['혼돈', '심연'];
  //   const races = ['demon', 'boss', 'primate'];
  //   const activeBaseOpts = baseOptionTypes.filter(opt => targetConfigs[opt.id]?.value > 0);

  //   for (let i = 0; i < count; i++) {
  //     const tier = tiers[Math.floor(Math.random() * tiers.length)];
  //     const itemType = itemTypes[i % itemTypes.length];
  //     const options = {};
  //     const quality = Math.random();

  //     // 종족 필수
  //     const race = races[Math.floor(Math.random() * 3)];
  //     options[race] = Math.floor(tierMaxValues[tier].C * (0.7 + Math.random() * 0.3));

  //     if (quality < 0.35) {
  //       // 1티어: 종족+치피+전공+1유효
  //       options.critDmg = Math.floor(tierMaxValues[tier].C * (0.7 + Math.random() * 0.3));
  //       options.totalAtk = Math.floor(tierMaxValues[tier].D * (0.7 + Math.random() * 0.3));
  //       if (activeBaseOpts.length > 0) {
  //         const baseOpt = activeBaseOpts[Math.floor(Math.random() * activeBaseOpts.length)];
  //         options[baseOpt.id] = Math.floor(tierMaxValues[tier][baseOpt.group] * (0.7 + Math.random() * 0.3));
  //       }
  //     } else if (quality < 0.6) {
  //       // 2티어: 종족+치피+2유효
  //       options.critDmg = Math.floor(tierMaxValues[tier].C * (0.7 + Math.random() * 0.3));
  //       const shuffled = [...activeBaseOpts].sort(() => Math.random() - 0.5);
  //       shuffled.slice(0, 2).forEach(opt => {
  //         options[opt.id] = Math.floor(tierMaxValues[tier][opt.group] * (0.7 + Math.random() * 0.3));
  //       });
  //     } else if (quality < 0.8) {
  //       // 3티어: 종족+전공+2유효
  //       options.totalAtk = Math.floor(tierMaxValues[tier].D * (0.7 + Math.random() * 0.3));
  //       const shuffled = [...activeBaseOpts].sort(() => Math.random() - 0.5);
  //       shuffled.slice(0, 2).forEach(opt => {
  //         options[opt.id] = Math.floor(tierMaxValues[tier][opt.group] * (0.7 + Math.random() * 0.3));
  //       });
  //     } else {
  //       // 나머지: 종족+1~2유효
  //       const shuffled = [...activeBaseOpts].sort(() => Math.random() - 0.5);
  //       const numOpts = 1 + Math.floor(Math.random() * 2);
  //       shuffled.slice(0, numOpts).forEach(opt => {
  //         options[opt.id] = Math.floor(tierMaxValues[tier][opt.group] * (0.6 + Math.random() * 0.4));
  //       });
  //     }

  //     newItems.push({ id: `dummy-${Date.now()}-${i}`, tier, itemType, options });
  //   }
  //   setItems(newItems);
  //   setRaceResults(null);
  // }, [targetConfigs]);

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

  // ===== 핵심 추천 알고리즘 =====

  // 장비 단위로 최적 계승 등급 계산 (MMMM, MMSS 등)
  // 목표: 각 기본 옵션이 목표치를 달성하면서 최소 비용
  const calculateOptimalInheritance = useCallback((combination, raceId) => {
    const activeTargets = baseOptionTypes.filter(opt => targetConfigs[opt.id]?.value > 0 && targetConfigs[opt.id]?.slots > 0);
    
    // 각 장비별로 계승 등급 결정
    const itemGrades = combination.map((item, idx) => {
      const isUnique = item.tier === '유니크';
      
      if (isUnique) {
        // 유니크는 계승 불가 - 현재 수치 그대로
        const optionGrades = {};
        Object.entries(item.options).forEach(([optId, val]) => {
          optionGrades[optId] = { grade: '-', current: val, upgraded: val };
        });
        return { itemIdx: idx, item, isUnique: true, gradeString: '계승불가', optionGrades, cost: 0 };
      }

      // 일반 장비: 계승 등급 결정
      // 전략: 딜러 옵션(종족/치피/전공)은 M, 기본 옵션은 목표 달성에 필요한 최소 등급
      const optionGrades = {};
      const gradeList = [];

      Object.entries(item.options).forEach(([optId, currentVal]) => {
        const opt = allOptionTypes.find(o => o.id === optId);
        if (!opt) return;

        // 딜러 옵션은 항상 M등급 권장
        if (['demon', 'boss', 'primate', 'critDmg', 'totalAtk'].includes(optId)) {
          const maxVal = getGradeValue(item.tier, opt.group, 'M');
          optionGrades[optId] = { grade: 'M', current: currentVal, upgraded: maxVal };
          gradeList.push('M');
        } else {
          // 기본 옵션: 현재 등급 추정 후 유지 (나중에 전체 최적화에서 조정)
          const currentGrade = estimateGrade(item.tier, opt.group, currentVal) || 'C';
          optionGrades[optId] = { grade: currentGrade, current: currentVal, upgraded: currentVal };
          gradeList.push(currentGrade);
        }
      });

      // 등급 문자열 생성 (M이 앞으로 오도록 정렬)
      const sortedGrades = [...gradeList].sort((a, b) => GRADES.indexOf(a) - GRADES.indexOf(b));
      const cost = gradeList.reduce((sum, g) => sum + GRADE_COST[g], 0);

      return { itemIdx: idx, item, isUnique: false, gradeString: sortedGrades.join(''), optionGrades, cost };
    });

    // 각 기본 옵션별로 목표 달성 여부 확인 및 최적 등급 조정
    const optionTotals = {};
    const optionDetails = {};

    activeTargets.forEach(target => {
      const optId = target.id;
      const targetVal = targetConfigs[optId].value;
      const targetSlots = targetConfigs[optId].slots;
      const runeMax = runeMaxValues[optId] || 0;

      // 이 옵션을 가진 장비들 찾기
      const itemsWithOption = itemGrades.filter(ig => ig.optionGrades[optId]);
      
      // 실제 사용 부위 수 (초과 가능)
      const usedSlots = itemsWithOption.length;
      // 계산에 사용할 장비는 제한 내로
      const selectedItems = itemsWithOption.slice(0, targetSlots);

      // 현재 합계 (계승 후)
      let currentTotal = 0;
      selectedItems.forEach(ig => {
        if (ig.isUnique) {
          currentTotal += ig.optionGrades[optId].current;
        } else {
          // 계승 등급에 따른 수치
          const grade = ig.optionGrades[optId].grade;
          const opt = allOptionTypes.find(o => o.id === optId);
          currentTotal += getGradeValue(ig.item.tier, opt.group, grade);
        }
      });

      // 목표 달성을 위해 필요한 추가 수치
      const needed = targetVal - currentTotal - runeMax;
      
      if (needed > 0 && selectedItems.length > 0) {
        // 등급 업그레이드 필요
        for (const ig of selectedItems) {
          if (ig.isUnique) continue;
          
          const opt = allOptionTypes.find(o => o.id === optId);
          const currentGrade = ig.optionGrades[optId].grade;
          const currentGradeIdx = GRADES.indexOf(currentGrade);
          
          // 더 높은 등급으로 업그레이드 시도
          for (let i = currentGradeIdx - 1; i >= 0; i--) {
            const newGrade = GRADES[i];
            const oldVal = getGradeValue(ig.item.tier, opt.group, currentGrade);
            const newVal = getGradeValue(ig.item.tier, opt.group, newGrade);
            const gain = newVal - oldVal;
            
            if (gain > 0) {
              ig.optionGrades[optId].grade = newGrade;
              ig.optionGrades[optId].upgraded = newVal;
              currentTotal += gain;
              
              // gradeString 업데이트
              const allGrades = Object.values(ig.optionGrades).map(g => g.grade).filter(g => g !== '-');
              ig.gradeString = allGrades.sort((a, b) => GRADES.indexOf(a) - GRADES.indexOf(b)).join('');
              ig.cost = allGrades.reduce((sum, g) => sum + GRADE_COST[g], 0);
              
              if (currentTotal + runeMax >= targetVal) break;
            }
          }
          if (currentTotal + runeMax >= targetVal) break;
        }
      }

      // 최종 결과 저장
      const finalTotal = selectedItems.reduce((sum, ig) => {
        if (ig.isUnique) return sum + ig.optionGrades[optId].current;
        const opt = allOptionTypes.find(o => o.id === optId);
        return sum + getGradeValue(ig.item.tier, opt.group, ig.optionGrades[optId].grade);
      }, 0);

      const runeNeeded = Math.max(0, Math.min(targetVal - finalTotal, runeMax));
      const shortage = Math.max(0, targetVal - finalTotal - runeMax);
      const excess = finalTotal + runeNeeded - targetVal;

      optionTotals[optId] = finalTotal + runeNeeded;
      optionDetails[optId] = {
        target: targetVal,
        fromGear: finalTotal,
        runeNeeded,
        runeMax,
        final: finalTotal + runeNeeded,
        shortage,
        excess,
        usedSlots,
        targetSlots,
        achieved: shortage === 0 && excess <= 3 // 초과 3 이내
      };
    });

    // 딜러 옵션 합계
    let raceTotal = 0, critDmgTotal = 0, totalAtkTotal = 0;
    itemGrades.forEach(ig => {
      if (ig.optionGrades[raceId]) {
        raceTotal += ig.isUnique ? ig.optionGrades[raceId].current : getGradeValue(ig.item.tier, 'C', ig.optionGrades[raceId].grade);
      }
      if (ig.optionGrades.critDmg) {
        critDmgTotal += ig.isUnique ? ig.optionGrades.critDmg.current : getGradeValue(ig.item.tier, 'C', ig.optionGrades.critDmg.grade);
      }
      if (ig.optionGrades.totalAtk) {
        totalAtkTotal += ig.isUnique ? ig.optionGrades.totalAtk.current : getGradeValue(ig.item.tier, 'D', ig.optionGrades.totalAtk.grade);
      }
    });

    const allTargetsMet = activeTargets.every(t => optionDetails[t.id]?.achieved);
    const totalCost = itemGrades.reduce((sum, ig) => sum + ig.cost, 0);

    return {
      itemGrades,
      optionTotals,
      optionDetails,
      raceTotal,
      critDmgTotal,
      totalAtkTotal,
      allTargetsMet,
      totalCost
    };
  }, [targetConfigs]);

  // 조합 점수 계산
  const calculateScore = useCallback((combination, raceId, withCritDmg, withTotalAtk) => {
    const result = calculateOptimalInheritance(combination, raceId);
    
    // 부위 수 초과 체크 - 초과 시 해당 조합은 실격
    let slotViolation = false;
    baseOptionTypes.forEach(opt => {
      const config = targetConfigs[opt.id];
      if (config?.value > 0 && config?.slots > 0) {
        // 해당 옵션을 가진 장비 수 카운트
        const itemsWithOpt = combination.filter(item => item.options[opt.id] > 0).length;
        if (itemsWithOpt > config.slots) {
          slotViolation = true;
        }
      }
    });
    
    // 부위 초과 시 매우 낮은 점수
    if (slotViolation) {
      return { ...result, score: -999999999, slotViolation: true };
    }
    
    // 점수 계산: 목표 달성 최우선, 그 다음 종족 > 치피 > 전공
    let score = 0;
    
    if (result.allTargetsMet) {
      score = 100000000; // 목표 달성 시 1억점 기본
      score += result.raceTotal * 10000;
      if (withCritDmg) score += result.critDmgTotal * 100;
      if (withTotalAtk) score += result.totalAtkTotal;
      score -= result.totalCost; // 비용 패널티
    } else {
      // 목표 미달성: 달성한 옵션 수에 따른 점수
      const activeTargets = baseOptionTypes.filter(opt => targetConfigs[opt.id]?.value > 0);
      const achievedCount = activeTargets.filter(t => result.optionDetails[t.id]?.achieved).length;
      score = achievedCount * 1000000;
      score += result.raceTotal * 100;
      if (withCritDmg) score += result.critDmgTotal;
      if (withTotalAtk) score += result.totalAtkTotal / 10;
    }

    return { ...result, score };
  }, [calculateOptimalInheritance, targetConfigs]);

  // 최적 조합 탐색
  const findBestCombination = useCallback(async (raceId) => {
    setIsCalculating(true);
    setRaceResults(null);

    await new Promise(r => setTimeout(r, 10));

    // 1. 선택한 종족 옵션이 있는 장비만 필터링
    const availableItems = items.filter(item =>
      !selectedUniqueTypes.includes(item.itemType) &&
      item.options[raceId] > 0
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
      let potScore = item.options[raceId] * 100;
      if (includeCritDmg && item.options.critDmg) potScore += item.options.critDmg * 10;
      if (includeTotalAtk && item.options.totalAtk) potScore += item.options.totalAtk;
      baseOptionTypes.forEach(opt => {
        if (targetConfigs[opt.id]?.value > 0 && item.options[opt.id]) potScore += 50;
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
      <style>{`
        .calc-container { min-height: 100vh; background: #fff; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
        .calc-container * { box-sizing: border-box; }
        .wrapper { max-width: 900px; margin: 0 auto; }
        .header { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0; }
        .title { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
        .subtitle { color: #888; font-size: 13px; margin: 0; }
        .section { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
        .section-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
        .badge { font-size: 11px; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; }
        .badge.selected { background: #333; color: #fff; }
        
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
        .input-box { background: #f8f8f8; border-radius: 4px; padding: 10px; }
        .input-box .label { font-size: 12px; font-weight: 500; margin-bottom: 6px; display: block; }
        .input-row { display: flex; gap: 6px; }
        .input-row .input { flex: 1; }
        .input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
        .input:focus { outline: none; border-color: #666; }
        .input-hint { font-size: 10px; color: #999; margin-top: 4px; }
        
        .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn { flex: 1; min-width: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 13px; transition: all 0.15s; }
        .btn:hover { background: #f5f5f5; }
        .btn.active { background: #333; color: #fff; border-color: #333; }
        .btn-sm { padding: 6px 12px; min-width: auto; flex: none; }
        
        .form-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .form-row > div { flex: 1; }
        .select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
        
        .option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 6px; margin-bottom: 12px; }
        .option-btn { padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; text-align: left; }
        .option-btn.selected { background: #f0f0f0; border-color: #333; }
        .option-name { font-size: 11px; font-weight: 500; }
        .option-input { width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 3px; margin-top: 4px; font-size: 12px; }
        .option-section-title { font-size: 11px; color: #888; margin: 8px 0 6px; }
        
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .list-header-left { display: flex; align-items: center; gap: 8px; }
        .list-header-right { display: flex; gap: 6px; }
        .toggle-btn, .clear-btn { padding: 4px 10px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; }
        .item-count { color: #888; font-size: 12px; }
        
        .list-controls { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .search-input { padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; width: 150px; }
        .filter-select { padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; }
        
        .item-list { max-height: 250px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
        .item-row:last-child { border-bottom: none; }
        .item-row:hover { background: #fafafa; }
        .item-row-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .item-row-right { display: flex; gap: 4px; }
        .tier-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; background: #f0f0f0; }
        .tier-badge.심연 { background: #e8f4ff; color: #1a73e8; }
        .tier-badge.혼돈 { background: #fff3e0; color: #e65100; }
        .item-options { color: #888; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .card-btn { padding: 2px 8px; border: 1px solid #ddd; border-radius: 3px; background: #fff; cursor: pointer; font-size: 11px; }
        
        .unique-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
        .unique-row.selected { background: #333; color: #fff; }
        .unique-row.selected .item-options { color: #ccc; }
        .select-btn { padding: 2px 8px; border: 1px solid #ddd; border-radius: 3px; background: #fff; cursor: pointer; font-size: 11px; }
        .select-btn.selected { background: #333; color: #fff; border-color: #333; }
        .passive-text { font-size: 10px; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
        .unique-row.selected .passive-text { background: #555; }
        
        .race-btn-group { display: flex; gap: 8px; margin-bottom: 12px; }
        .race-btn { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; }
        .race-btn:hover { background: #f5f5f5; }
        .race-btn.active { background: #333; color: #fff; border-color: #333; }
        .race-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .toggle-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 8px 12px; background: #f8f8f8; border-radius: 4px; }
        .toggle-label { font-size: 13px; }
        .toggle-btn-sm { padding: 4px 12px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; }
        .toggle-btn-sm.active { background: #333; color: #fff; border-color: #333; }
        
        .loading { text-align: center; padding: 40px; color: #888; }
        .spinner { width: 30px; height: 30px; border: 3px solid #f0f0f0; border-top-color: #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .result-card { background: #f8f8f8; border-radius: 6px; padding: 16px; }
        .result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .result-badge { background: #333; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; }
        .result-meta { color: #888; font-size: 12px; }
        
        .result-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .summary-item { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px; text-align: center; }
        .summary-label { font-size: 11px; color: #888; margin-bottom: 4px; }
        .summary-value { font-size: 20px; font-weight: 600; }
        
        .sub-title { font-size: 12px; font-weight: 500; color: #666; margin: 16px 0 8px; }
        
        .equip-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px; margin-bottom: 8px; }
        .equip-card.unique { border-left: 3px solid #9c27b0; }
        .equip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .equip-name { font-weight: 500; }
        .grade-tag { font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600; }
        .grade-tag.good { background: linear-gradient(135deg, #4caf50, #8bc34a); color: #fff; }
        .grade-tag.mid { background: linear-gradient(135deg, #ff9800, #ffc107); color: #fff; }
        .grade-tag.high { background: linear-gradient(135deg, #f44336, #ff5722); color: #fff; }
        .grade-tag.unique { background: #9c27b0; color: #fff; }
        .equip-options { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; }
        .opt-item { display: flex; align-items: center; gap: 4px; }
        .opt-name { color: #666; }
        .opt-val { font-weight: 500; }
        .opt-upgrade { color: #4caf50; }
        .opt-grade { font-size: 10px; color: #888; }
        .passive-info { font-size: 10px; color: #9c27b0; margin-top: 6px; }
        
        .target-item { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px 12px; margin-bottom: 6px; }
        .target-item.achieved { border-left: 3px solid #4caf50; }
        .target-item.failed { border-left: 3px solid #f44336; background: #fff5f5; }
        .target-item.excess { border-left: 3px solid #ff9800; }
        .target-header { display: flex; justify-content: space-between; align-items: center; }
        .target-name { font-weight: 500; font-size: 12px; }
        .target-slots { font-size: 10px; color: #888; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
        .target-slots.exceeded { background: #ffebee; color: #f44336; font-weight: 500; }
        .target-detail { font-size: 11px; color: #666; margin-top: 4px; }
        .target-status { font-size: 11px; margin-top: 4px; font-weight: 500; }
        .target-status.ok { color: #4caf50; }
        .target-status.warn { color: #ff9800; }
        .target-status.err { color: #f44336; }
        
        .final-box { margin-top: 16px; padding: 12px; border-radius: 4px; background: #e8f5e9; border: 1px solid #c8e6c9; }
        .final-box.error { background: #ffebee; border-color: #ffcdd2; }
        .final-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
        .final-detail { font-size: 12px; color: #666; }
        
        .empty-state { text-align: center; padding: 30px; color: #888; font-size: 13px; }
        .hint { font-size: 11px; color: #888; margin-top: 8px; }
        
        @media (max-width: 600px) {
          .calc-container { padding: 12px; }
          .section { padding: 12px; }
          .grid-3 { grid-template-columns: repeat(2, 1fr); }
          .btn-group { flex-direction: column; }
          .race-btn-group { flex-direction: column; }
          .form-row { flex-direction: column; }
          .result-summary { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

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