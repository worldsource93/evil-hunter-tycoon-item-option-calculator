import React, { useState, useEffect, useCallback } from 'react';

const EquipmentCalculator = () => {
  // 기본 옵션 (목표 수치용)
  const baseOptionTypes = [
    { id: 'critRate', name: '치명타확률', abbr: '치확', group: 'A' },
    { id: 'atkSpeed', name: '공격속도', abbr: '공속', group: 'A' },
    { id: 'evasion', name: '회피율', abbr: '회피', group: 'A' },
    { id: 'dmgReduce', name: '받는 데미지 감소', abbr: '받뎀감', group: 'B' },
    { id: 'lifesteal', name: '흡혈', abbr: '흡혈', group: 'B' },
    { id: 'moveSpeed', name: '이동속도', abbr: '이속', group: 'B' }
  ];

  // 추가 옵션 (종족/치피/전공)
  const bonusOptionTypes = [
    { id: 'demon', name: '악마', abbr: '악마', group: 'C' },
    { id: 'boss', name: '보스', abbr: '보스', group: 'C' },
    { id: 'primate', name: '영장', abbr: '영장', group: 'C' },
    { id: 'critDmg', name: '치명타피해량', abbr: '치피', group: 'C' },
    { id: 'totalAtk', name: '전체공격력', abbr: '전공', group: 'D' }
  ];

  const allOptionTypes = [...baseOptionTypes, ...bonusOptionTypes];

  // 단계별 최대 수치
  const tierMaxValues = {
    '태초': { A: 12, B: 17, C: 35, D: 23 },
    '혼돈': { A: 14, B: 19, C: 40, D: 26 },
    '심연': { A: 16, B: 21, C: 45, D: 29 },
    '유니크': { A: 16, B: 21, C: 45, D: 29 } // 유니크는 심연급
  };

  // 아이템 종류 정의
  const itemTypes = ['무기', '목걸이', '반지', '벨트', '투구', '갑옷', '장갑', '신발'];

  // 유니크 장비 정의 (고유옵션 포함)
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

  // 유니크 장비 부위 매핑
  const uniqueToItemType = {};
  const uniqueDefMap = {};
  Object.entries(uniqueItemDefs).forEach(([type, items]) => {
    items.forEach(item => {
      uniqueToItemType[item.name] = type;
      uniqueDefMap[item.name] = item;
    });
  });

  // 모든 유니크 장비 이름 목록
  const allUniqueNames = Object.values(uniqueItemDefs).flat().map(u => u.name);

  // 룬 최대값 정의
  const runeMaxValues = {
    critRate: 6, atkSpeed: 6, evasion: 6,
    dmgReduce: 12, lifesteal: 12, moveSpeed: 12
  };

  // 로컬스토리지 키
  const STORAGE_KEY = 'equipment_calculator_items_v3';
  const STORAGE_KEY_UNIQUE = 'equipment_calculator_unique_v3';

  // 더미 데이터 생성
  const generateDummyData = (count = 250) => {
    const dummyItems = [];
    const tiers = ['태초', '혼돈', '심연'];
    const allOptions = [...baseOptionTypes, ...bonusOptionTypes];
    
    for (let i = 0; i < count; i++) {
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const itemType = itemTypes[i % itemTypes.length];
      const numOptions = Math.floor(Math.random() * 4) + 1;
      
      const options = {};
      const usedOptions = new Set();
      
      if (Math.random() < 0.7) {
        const raceOptions = ['demon', 'boss', 'primate'];
        const selectedRace = raceOptions[Math.floor(Math.random() * raceOptions.length)];
        const raceOpt = allOptions.find(o => o.id === selectedRace);
        options[selectedRace] = Math.floor(tierMaxValues[tier][raceOpt.group] * (0.6 + Math.random() * 0.4));
        usedOptions.add(selectedRace);
        
        if (numOptions >= 2 && Math.random() < 0.5) {
          const critOpt = allOptions.find(o => o.id === 'critDmg');
          options['critDmg'] = Math.floor(tierMaxValues[tier][critOpt.group] * (0.6 + Math.random() * 0.4));
          usedOptions.add('critDmg');
        }
        
        if (numOptions >= 3 && Math.random() < 0.4) {
          const atkOpt = allOptions.find(o => o.id === 'totalAtk');
          options['totalAtk'] = Math.floor(tierMaxValues[tier][atkOpt.group] * (0.6 + Math.random() * 0.4));
          usedOptions.add('totalAtk');
        }
      }
      
      const remainingOptions = allOptions.filter(o => !usedOptions.has(o.id));
      const shuffled = remainingOptions.sort(() => Math.random() - 0.5);
      
      let currentCount = Object.keys(options).length;
      for (const option of shuffled) {
        if (currentCount >= numOptions) break;
        options[option.id] = Math.floor(tierMaxValues[tier][option.group] * (0.6 + Math.random() * 0.4));
        currentCount++;
      }
      
      dummyItems.push({ id: Date.now() + i, tier, itemType, options });
    }
    
    return dummyItems;
  };

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Failed to load:', e); }
    return [];
  };

  const loadUniqueFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNIQUE);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Failed to load unique:', e); }
    return [];
  };

  const saveToStorage = (data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { console.error('Failed to save:', e); }
  };

  const saveUniqueToStorage = (data) => {
    try { localStorage.setItem(STORAGE_KEY_UNIQUE, JSON.stringify(data)); }
    catch (e) { console.error('Failed to save unique:', e); }
  };

  // 엑셀 헤더 매핑
  const excelHeaders = ['장비종류', '단계', '유니크', '고유옵션', '치확', '공속', '회피', '받뎀감', '흡혈', '이속', '악마', '보스', '영장', '치피', '전공'];
  const headerToOptionId = {
    '치확': 'critRate', '공속': 'atkSpeed', '회피': 'evasion',
    '받뎀감': 'dmgReduce', '흡혈': 'lifesteal', '이속': 'moveSpeed',
    '악마': 'demon', '보스': 'boss', '영장': 'primate',
    '치피': 'critDmg', '전공': 'totalAtk'
  };

  // 엑셀 다운로드
  const downloadExcel = () => {
    const allItems = [...items, ...uniqueEquipments];
    if (allItems.length === 0) {
      alert('다운로드할 장비가 없습니다.');
      return;
    }

    const rows = [excelHeaders.join(',')];
    
    allItems.forEach(item => {
      const isUnique = !!item.uniqueName;
      const row = [
        item.itemType,
        isUnique ? '유니크' : item.tier,
        item.uniqueName || '',
        item.passiveValue || '',
        item.options.critRate || '',
        item.options.atkSpeed || '',
        item.options.evasion || '',
        item.options.dmgReduce || '',
        item.options.lifesteal || '',
        item.options.moveSpeed || '',
        item.options.demon || '',
        item.options.boss || '',
        item.options.primate || '',
        item.options.critDmg || '',
        item.options.totalAtk || ''
      ];
      rows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `장비목록_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 엑셀 업로드
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('유효한 데이터가 없습니다.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const itemTypeIdx = headers.indexOf('장비종류');
        const tierIdx = headers.indexOf('단계');
        const uniqueIdx = headers.indexOf('유니크');
        const passiveIdx = headers.indexOf('고유옵션');
        
        if (itemTypeIdx === -1 || tierIdx === -1) {
          alert('헤더에 "장비종류"와 "단계" 열이 필요합니다.');
          return;
        }

        const newItems = [];
        const newUniqueItems = [];
        
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
            if (value && value > 0) options[optionId] = value;
          });
          
          if (uniqueName && allUniqueNames.includes(uniqueName)) {
            // 유니크 장비
            newUniqueItems.push({
              id: Date.now() + i + 10000,
              itemType,
              uniqueName,
              passiveValue,
              options,
              selected: false
            });
          } else if (['태초', '혼돈', '심연'].includes(tier)) {
            // 일반 장비
            if (Object.keys(options).length > 0) {
              newItems.push({ id: Date.now() + i, tier, itemType, options });
            }
          }
        }

        if (newItems.length === 0 && newUniqueItems.length === 0) {
          alert('유효한 장비 데이터가 없습니다.');
          return;
        }

        if (newItems.length > 0) setItems(prev => [...prev, ...newItems]);
        if (newUniqueItems.length > 0) setUniqueEquipments(prev => [...prev, ...newUniqueItems]);
        
        setIsTestMode(false);
        setUseActualValues(true);
        setRaceResults(null);
        setMCraftSimulation({});
        alert(`일반 ${newItems.length}개, 유니크 ${newUniqueItems.length}개 장비가 추가되었습니다.`);
        
      } catch (error) {
        console.error('Excel parse error:', error);
        alert('파일 파싱 중 오류가 발생했습니다.');
      }
    };
    
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  // 상태 관리
  const [targetValues, setTargetValues] = useState({
    critRate: 50, atkSpeed: 40, evasion: 40,
    dmgReduce: 0, lifesteal: 40, moveSpeed: 0
  });

  const [items, setItems] = useState(() => loadFromStorage());
  const [uniqueEquipments, setUniqueEquipments] = useState(() => loadUniqueFromStorage());
  const [useActualValues, setUseActualValues] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [isUniqueListExpanded, setIsUniqueListExpanded] = useState(true);
  
  const [newItem, setNewItem] = useState({ tier: '태초', itemType: '무기', options: {} });
  const [newUniqueItem, setNewUniqueItem] = useState({ 
    itemType: '갑옷', 
    uniqueName: '서리갑', 
    passiveValue: 0,
    options: {} 
  });
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingUniqueId, setEditingUniqueId] = useState(null);
  
  // 검색 및 필터
  const [searchText, setSearchText] = useState('');
  const [filterItemType, setFilterItemType] = useState('전체');
  const [filterTier, setFilterTier] = useState('전체');
  
  const [uniqueSearchText, setUniqueSearchText] = useState('');
  
  // 추천 모드 상태
  const [selectedRace, setSelectedRace] = useState(null);
  const [includeCritDmg, setIncludeCritDmg] = useState(false);
  const [includeTotalAtk, setIncludeTotalAtk] = useState(false);
  const [raceResults, setRaceResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mCraftSimulation, setMCraftSimulation] = useState({});

  // 로컬스토리지 저장
  useEffect(() => {
    if (useActualValues && !isTestMode) {
      saveToStorage(items);
    }
  }, [items, useActualValues, isTestMode]);

  useEffect(() => {
    if (useActualValues && !isTestMode) {
      saveUniqueToStorage(uniqueEquipments);
    }
  }, [uniqueEquipments, useActualValues, isTestMode]);

  // 선택된 유니크 장비
  const selectedUniqueItems = uniqueEquipments.filter(u => u.selected);
  const selectedUniqueTypes = selectedUniqueItems.map(u => u.itemType);

  // 필터링된 아이템
  const filteredItems = items.filter(item => {
    const matchSearch = searchText === '' || 
      item.itemType.includes(searchText) || 
      item.tier.includes(searchText) ||
      Object.entries(item.options).some(([optId, val]) => {
        const opt = allOptionTypes.find(o => o.id === optId);
        return opt && (opt.name.includes(searchText) || opt.abbr.includes(searchText));
      });
    const matchType = filterItemType === '전체' || item.itemType === filterItemType;
    const matchTier = filterTier === '전체' || item.tier === filterTier;
    return matchSearch && matchType && matchTier;
  });

  const filteredUniqueItems = uniqueEquipments.filter(item => {
    return uniqueSearchText === '' || 
      item.uniqueName.includes(uniqueSearchText) || 
      item.itemType.includes(uniqueSearchText) ||
      item.tier.includes(uniqueSearchText);
  });

  // 결과 초기화 헬퍼
  const resetResults = () => {
    setShowResults(false);
    setRaceResults(null);
    setMCraftSimulation({});
  };

  // 일반 장비 CRUD
  const toggleNewItemOption = (optionId) => {
    setNewItem(prev => {
      const newOptions = { ...prev.options };
      if (newOptions[optionId] !== undefined) {
        delete newOptions[optionId];
      } else {
        const option = allOptionTypes.find(o => o.id === optionId);
        newOptions[optionId] = useActualValues ? 0 : tierMaxValues[prev.tier][option.group];
      }
      return { ...prev, options: newOptions };
    });
  };

  const updateNewItemOptionValue = (optionId, value) => {
    const option = allOptionTypes.find(o => o.id === optionId);
    const maxValue = tierMaxValues[newItem.tier][option.group];
    setNewItem(prev => ({
      ...prev,
      options: { ...prev.options, [optionId]: Math.min(parseInt(value) || 0, maxValue) }
    }));
  };

  const updateNewItemTier = (tier) => {
    setNewItem(prev => {
      const newOptions = {};
      Object.keys(prev.options).forEach(optionId => {
        const option = allOptionTypes.find(o => o.id === optionId);
        const maxValue = tierMaxValues[tier][option.group];
        newOptions[optionId] = useActualValues ? Math.min(prev.options[optionId], maxValue) : maxValue;
      });
      return { ...prev, tier, options: newOptions };
    });
  };

  const addItem = () => {
    if (Object.keys(newItem.options).length === 0) {
      alert('최소 1개의 옵션을 선택해주세요.');
      return;
    }
    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ tier: '태초', itemType: '무기', options: {} });
    resetResults();
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItem({ tier: item.tier, itemType: item.itemType, options: { ...item.options } });
  };

  const saveEditItem = () => {
    if (Object.keys(newItem.options).length === 0) {
      alert('최소 1개의 옵션을 선택해주세요.');
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === editingItemId ? { ...newItem, id: editingItemId } : item
    ));
    setEditingItemId(null);
    setNewItem({ tier: '태초', itemType: '무기', options: {} });
    resetResults();
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingUniqueId(null);
    setNewItem({ tier: '태초', itemType: '무기', options: {} });
    setNewUniqueItem({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    resetResults();
  };

  const clearAllItems = () => {
    if (window.confirm('모든 일반 장비를 삭제하시겠습니까?')) {
      setItems([]);
      resetResults();
    }
  };

  // 유니크 장비 CRUD
  const toggleNewUniqueOption = (optionId) => {
    setNewUniqueItem(prev => {
      const newOptions = { ...prev.options };
      if (newOptions[optionId] !== undefined) {
        delete newOptions[optionId];
      } else {
        const option = allOptionTypes.find(o => o.id === optionId);
        newOptions[optionId] = useActualValues ? 0 : tierMaxValues['유니크'][option.group];
      }
      return { ...prev, options: newOptions };
    });
  };

  const updateNewUniqueOptionValue = (optionId, value) => {
    const option = allOptionTypes.find(o => o.id === optionId);
    const maxValue = tierMaxValues['유니크'][option.group];
    setNewUniqueItem(prev => ({
      ...prev,
      options: { ...prev.options, [optionId]: Math.min(parseInt(value) || 0, maxValue) }
    }));
  };

  const updateNewUniqueItemType = (itemType) => {
    const availableUniques = uniqueItemDefs[itemType] || [];
    setNewUniqueItem(prev => ({
      ...prev,
      itemType,
      uniqueName: availableUniques[0]?.name || '',
      passiveValue: 0
    }));
  };

  const updateNewUniqueName = (uniqueName) => {
    setNewUniqueItem(prev => ({
      ...prev,
      uniqueName,
      passiveValue: 0
    }));
  };

  const addUniqueItem = () => {
    const def = uniqueDefMap[newUniqueItem.uniqueName];
    if (!def) {
      alert('유니크 장비를 선택해주세요.');
      return;
    }
    if (newUniqueItem.passiveValue < def.min || newUniqueItem.passiveValue > def.max) {
      alert(`고유옵션 수치는 ${def.min}~${def.max} 사이여야 합니다.`);
      return;
    }
    setUniqueEquipments(prev => [...prev, { 
      ...newUniqueItem, 
      id: Date.now(), 
      selected: false,
      tier: '유니크'
    }]);
    setNewUniqueItem({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
    resetResults();
  };

  const startEditUniqueItem = (item) => {
    setEditingUniqueId(item.id);
    setNewUniqueItem({
      itemType: item.itemType,
      uniqueName: item.uniqueName,
      passiveValue: item.passiveValue || 0,
      options: { ...item.options }
    });
  };

  const saveEditUniqueItem = () => {
    const def = uniqueDefMap[newUniqueItem.uniqueName];
    if (!def) {
      alert('유니크 장비를 선택해주세요.');
      return;
    }
    if (newUniqueItem.passiveValue < def.min || newUniqueItem.passiveValue > def.max) {
      alert(`고유옵션 수치는 ${def.min}~${def.max} 사이여야 합니다.`);
      return;
    }
    setUniqueEquipments(prev => prev.map(item => 
      item.id === editingUniqueId 
        ? { ...newUniqueItem, id: editingUniqueId, selected: item.selected, tier: '유니크' }
        : item
    ));
    setEditingUniqueId(null);
    setNewUniqueItem({ itemType: '갑옷', uniqueName: '서리갑', passiveValue: 0, options: {} });
    resetResults();
  };

  const removeUniqueItem = (id) => {
    setUniqueEquipments(prev => prev.filter(item => item.id !== id));
    resetResults();
  };

  const clearAllUniqueItems = () => {
    if (window.confirm('모든 유니크 장비를 삭제하시겠습니까?')) {
      setUniqueEquipments([]);
      resetResults();
    }
  };

  const toggleUniqueSelection = (id) => {
    setUniqueEquipments(prev => {
      const item = prev.find(u => u.id === id);
      if (!item) return prev;
      
      const currentSelected = prev.filter(u => u.selected);
      
      if (item.selected) {
        // 선택 해제
        return prev.map(u => u.id === id ? { ...u, selected: false } : u);
      } else {
        // 선택하려는 경우
        if (currentSelected.length >= 2) {
          alert('유니크 장비는 최대 2개까지 선택 가능합니다.');
          return prev;
        }
        // 같은 부위가 이미 선택되어 있는지 확인
        if (currentSelected.some(u => u.itemType === item.itemType)) {
          alert(`${item.itemType} 부위는 이미 선택되어 있습니다.`);
          return prev;
        }
        return prev.map(u => u.id === id ? { ...u, selected: true } : u);
      }
    });
    resetResults();
  };

  const updateTargetValue = (optionId, value) => {
    setTargetValues(prev => ({
      ...prev,
      [optionId]: Math.min(parseInt(value) || 0, 100)
    }));
    resetResults();
  };

  // 조합 점수 계산
  const calculateCombinationScore = useCallback((combination, raceId, withCritDmg, withTotalAtk) => {
    let raceTotal = 0, critDmgTotal = 0, totalAtkTotal = 0, comboBonus = 0;
    const baseTotals = {};
    baseOptionTypes.forEach(opt => { baseTotals[opt.id] = 0; });
    
    combination.forEach(item => {
      const race = item.options[raceId] || 0;
      const crit = item.options.critDmg || 0;
      const atk = item.options.totalAtk || 0;
      
      raceTotal += race;
      critDmgTotal += crit;
      totalAtkTotal += atk;
      
      baseOptionTypes.forEach(opt => {
        baseTotals[opt.id] += item.options[opt.id] || 0;
      });
      
      if (withCritDmg && withTotalAtk) {
        if (race > 0 && crit > 0 && atk > 0) comboBonus += 500;
        else if (race > 0 && crit > 0) comboBonus += 200;
        else if (race > 0 && atk > 0) comboBonus += 100;
      } else if (withCritDmg) {
        if (race > 0 && crit > 0) comboBonus += 300;
      } else if (withTotalAtk) {
        if (race > 0 && atk > 0) comboBonus += 200;
      }
    });
    
    // 목표 달성도 계산 (룬 포함)
    let totalShortage = 0;
    let totalExcess = 0;
    let targetsFullyMet = true;
    let targetsMet = 0;
    let totalTargets = 0;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        totalTargets++;
        const achieved = baseTotals[option.id];
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          const shortage = Math.max(0, diff - runeMax);
          totalShortage += shortage;
          if (shortage > 0) {
            targetsFullyMet = false;
          } else {
            targetsMet++;
          }
        } else {
          targetsMet++;
          if (diff < 0) {
            totalExcess += Math.abs(diff);
          }
        }
      }
    });
    
    // 점수 계산: 목표 달성이 최우선
    let score = 0;
    
    if (!targetsFullyMet) {
      // 목표 미달성: 
      // 1. 달성한 목표 개수에 따른 기본 점수
      // 2. 부족분에 따른 페널티
      // 3. 딜러 옵션은 아주 작은 비중
      score = targetsMet * 100000; // 달성한 목표 1개당 10만점
      score -= totalShortage * 5000; // 부족분 1당 -5000점
      score += raceTotal * 10;
      if (withCritDmg) score += critDmgTotal * 8;
      if (withTotalAtk) score += totalAtkTotal * 4;
    } else {
      // 모든 목표 달성: 
      // 1. 기본 달성 보너스 (매우 높음)
      // 2. 딜러 옵션 최대화
      // 3. 초과분 작은 페널티
      score = 10000000; // 1000만점 기본
      score += raceTotal * 120;
      if (withCritDmg) score += critDmgTotal * 100;
      if (withTotalAtk) score += totalAtkTotal * 50;
      score += comboBonus;
      score -= totalExcess * 3; // 초과분 페널티 약화
    }
    
    return { score, raceTotal, critDmgTotal, totalAtkTotal, targetsFullyMet, totalShortage, targetsMet, totalTargets };
  }, [targetValues]);

  // 필터링
  const getFilteredItemsByType = useCallback((raceId, withCritDmg, withTotalAtk) => {
    // 선택된 유니크 장비 부위 제외
    const excludedTypes = selectedUniqueTypes;
    const availableItems = items.filter(item => !excludedTypes.includes(item.itemType));
    
    const itemsByType = {};
    availableItems.forEach(item => {
      if (!itemsByType[item.itemType]) itemsByType[item.itemType] = [];
      itemsByType[item.itemType].push(item);
    });

    // 목표 수치가 설정된 옵션 목록
    const targetOptions = baseOptionTypes.filter(opt => targetValues[opt.id] > 0);
    
    // 각 타입별로 다양한 기준으로 아이템 선별
    const MAX_PER_TYPE = 20; // 더 많이 선별하여 다양한 조합 가능하게
    
    Object.keys(itemsByType).forEach(type => {
      const typeItems = itemsByType[type];
      
      // 각 아이템에 여러 점수 계산
      const scoredItems = typeItems.map(item => {
        // 1. 목표 옵션 기여도 (가장 중요)
        const targetScore = targetOptions.reduce((sum, opt) => {
          const val = item.options[opt.id] || 0;
          const target = targetValues[opt.id];
          // 목표 대비 기여 비율로 점수 계산
          return sum + (val / target) * 100;
        }, 0);
        
        // 2. 딜러 옵션 점수
        const raceVal = item.options[raceId] || 0;
        const critVal = item.options.critDmg || 0;
        const atkVal = item.options.totalAtk || 0;
        let dealerScore = raceVal * 120;
        if (withCritDmg) dealerScore += critVal * 100;
        if (withTotalAtk) dealerScore += atkVal * 50;
        
        // 3. 복합 점수 (목표 기여도 * 2 + 딜러 점수)
        // 목표 기여도에 더 높은 가중치
        const combinedScore = targetScore * 2 + dealerScore;
        
        return { item, targetScore, dealerScore, combinedScore };
      });
      
      // 복합 점수로 정렬
      scoredItems.sort((a, b) => b.combinedScore - a.combinedScore);
      
      // 상위 아이템 선택, 단 목표 기여도 높은 아이템도 포함 보장
      const selectedItems = new Set();
      
      // 먼저 복합 점수 상위 절반 선택
      const halfMax = Math.ceil(MAX_PER_TYPE / 2);
      scoredItems.slice(0, halfMax).forEach(s => selectedItems.add(s.item));
      
      // 그 다음 목표 기여도 상위 아이템 추가 (아직 선택 안된 것 중)
      scoredItems
        .sort((a, b) => b.targetScore - a.targetScore)
        .forEach(s => {
          if (selectedItems.size < MAX_PER_TYPE && !selectedItems.has(s.item)) {
            selectedItems.add(s.item);
          }
        });
      
      // 딜러 점수 상위 아이템도 추가 (아직 선택 안된 것 중)
      scoredItems
        .sort((a, b) => b.dealerScore - a.dealerScore)
        .forEach(s => {
          if (selectedItems.size < MAX_PER_TYPE && !selectedItems.has(s.item)) {
            selectedItems.add(s.item);
          }
        });
      
      itemsByType[type] = Array.from(selectedItems);
    });
    
    return itemsByType;
  }, [items, targetValues, selectedUniqueTypes]);

  // 최적 조합 찾기
  const findBestRaceCombination = useCallback((raceId, withCritDmg, withTotalAtk) => {
    const itemsByType = getFilteredItemsByType(raceId, withCritDmg, withTotalAtk);
    const typesList = Object.keys(itemsByType);
    
    // 선택된 유니크 장비를 기본 조합에 포함
    const baseItems = [...selectedUniqueItems];
    
    if (typesList.length === 0 && baseItems.length === 0) return null;

    let bestCombination = null;
    let bestScore = -Infinity;
    let bestResult = null;
    let combinationsChecked = 0;
    const MAX_COMBINATIONS = 200000; // 더 많은 조합 탐색

    if (typesList.length === 0) {
      // 유니크 장비만 있는 경우
      const result = calculateCombinationScore(baseItems, raceId, withCritDmg, withTotalAtk);
      bestCombination = baseItems;
      bestScore = result.score;
      bestResult = result;
    } else {
      const stack = [{ index: 0, current: [...baseItems] }];
      
      while (stack.length > 0 && combinationsChecked < MAX_COMBINATIONS) {
        const { index, current } = stack.pop();
        
        if (index === typesList.length) {
          combinationsChecked++;
          const result = calculateCombinationScore(current, raceId, withCritDmg, withTotalAtk);
          if (result.score > bestScore) {
            bestScore = result.score;
            bestCombination = [...current];
            bestResult = result;
          }
          continue;
        }
        
        const currentType = typesList[index];
        const itemsOfType = itemsByType[currentType];
        
        for (let i = itemsOfType.length - 1; i >= 0; i--) {
          stack.push({ index: index + 1, current: [...current, itemsOfType[i]] });
        }
      }
    }

    if (!bestCombination) return null;

    const totals = {};
    allOptionTypes.forEach(option => {
      totals[option.id] = bestCombination.reduce((sum, item) => sum + (item.options[option.id] || 0), 0);
    });

    const runeInfo = {};
    let totalShortage = 0;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        const achieved = totals[option.id];
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          runeInfo[option.id] = { needed: Math.min(diff, runeMax), shortage: Math.max(0, diff - runeMax) };
          totalShortage += Math.max(0, diff - runeMax);
        } else if (diff < 0) {
          runeInfo[option.id] = { needed: 0, shortage: 0, excess: Math.abs(diff) };
        } else {
          runeInfo[option.id] = { needed: 0, shortage: 0 };
        }
      }
    });

    return {
      items: bestCombination,
      totals, runeInfo,
      raceTotal: totals[raceId] || 0,
      critDmgTotal: totals.critDmg || 0,
      totalAtkTotal: totals.totalAtk || 0,
      totalShortage,
      allTargetsMet: totalShortage === 0,
      combinationsChecked,
      targetsMet: bestResult?.targetsMet || 0,
      totalTargets: bestResult?.totalTargets || 0
    };
  }, [getFilteredItemsByType, calculateCombinationScore, targetValues, selectedUniqueItems]);

  const handleRaceSelect = useCallback(async (raceId) => {
    if (items.length === 0 && selectedUniqueItems.length === 0) {
      alert('장비를 먼저 추가해주세요.');
      return;
    }

    setIsCalculating(true);
    setSelectedRace(raceId);
    setShowResults(false);
    setMCraftSimulation({});

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = findBestRaceCombination(raceId, includeCritDmg, includeTotalAtk);
    setRaceResults(result);
    setIsCalculating(false);
  }, [items, selectedUniqueItems, includeCritDmg, includeTotalAtk, findBestRaceCombination]);

  useEffect(() => {
    if (selectedRace && !isCalculating) {
      handleRaceSelect(selectedRace);
    }
  }, [includeCritDmg, includeTotalAtk]);

  // M작 시뮬레이션
  const toggleMCraftSimulation = (itemId) => {
    setMCraftSimulation(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleAllMCraft = (items, apply) => {
    const newSim = {};
    items.forEach(item => { newSim[item.id] = apply; });
    setMCraftSimulation(newSim);
  };

  const mCraftCount = Object.values(mCraftSimulation).filter(v => v).length;

  const getSimulatedTotals = useCallback((result) => {
    if (!result) return null;
    
    const hasMCraft = Object.values(mCraftSimulation).some(v => v);
    if (!hasMCraft) {
      return {
        totals: result.totals, runeInfo: result.runeInfo,
        totalShortage: result.totalShortage, allTargetsMet: result.allTargetsMet,
        raceTotal: result.raceTotal, critDmgTotal: result.critDmgTotal, totalAtkTotal: result.totalAtkTotal
      };
    }
    
    const simulatedTotals = {};
    allOptionTypes.forEach(option => {
      let total = 0;
      result.items.forEach(item => {
        const baseValue = item.options[option.id] || 0;
        if (baseValue > 0 && mCraftSimulation[item.id]) {
          const opt = allOptionTypes.find(o => o.id === option.id);
          total += tierMaxValues[item.tier][opt.group];
        } else {
          total += baseValue;
        }
      });
      simulatedTotals[option.id] = total;
    });
    
    const simulatedRuneInfo = {};
    let simulatedShortage = 0;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        const achieved = simulatedTotals[option.id];
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          simulatedRuneInfo[option.id] = { needed: Math.min(diff, runeMax), shortage: Math.max(0, diff - runeMax) };
          simulatedShortage += Math.max(0, diff - runeMax);
        } else if (diff < 0) {
          simulatedRuneInfo[option.id] = { needed: 0, shortage: 0, excess: Math.abs(diff) };
        } else {
          simulatedRuneInfo[option.id] = { needed: 0, shortage: 0 };
        }
      }
    });
    
    return {
      totals: simulatedTotals, runeInfo: simulatedRuneInfo,
      totalShortage: simulatedShortage, allTargetsMet: simulatedShortage === 0,
      raceTotal: simulatedTotals[selectedRace] || 0,
      critDmgTotal: simulatedTotals.critDmg || 0,
      totalAtkTotal: simulatedTotals.totalAtk || 0
    };
  }, [mCraftSimulation, targetValues, selectedRace]);

  const raceNames = { demon: '악마', boss: '보스', primate: '영장' };

  return (
    <div className="eq-calc-container">
      <style>{`
        .eq-calc-container {
          min-height: 100vh;
          background: #ffffff;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          box-sizing: border-box;
          color: #37352f;
        }
        .eq-calc-container * { box-sizing: border-box; }
        .wrapper { max-width: 960px; margin: 0 auto; }
        .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e9e9e7; }
        .title { font-size: 20px; font-weight: 600; color: #37352f; margin: 0 0 4px 0; }
        .subtitle { color: #9b9a97; font-size: 13px; margin: 0; }
        .section { background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; padding: 16px; margin-bottom: 12px; }
        .section-title { font-size: 14px; font-weight: 600; color: #37352f; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px; }
        .section-title .badge { font-size: 11px; background: #e9e9e7; padding: 2px 6px; border-radius: 3px; font-weight: 500; }
        .section-title .badge.selected { background: #37352f; color: #fff; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; }
        .input-box { background: #f7f6f3; border-radius: 3px; padding: 8px 10px; }
        .label { display: block; color: #9b9a97; font-size: 11px; margin-bottom: 4px; }
        .input { width: 100%; padding: 6px 8px; background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; color: #37352f; font-size: 13px; outline: none; }
        .input:focus { border-color: #37352f; }
        .select { padding: 6px 8px; background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; color: #37352f; font-size: 13px; outline: none; cursor: pointer; width: 100%; }
        .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn { flex: 1; min-width: 80px; padding: 8px 12px; border-radius: 3px; font-weight: 500; border: 1px solid #e9e9e7; cursor: pointer; transition: all 0.15s; font-size: 13px; background: #ffffff; color: #37352f; }
        .btn:hover { background: #f7f6f3; }
        .btn-active { background: #37352f; color: #ffffff; border-color: #37352f; }
        .btn-active:hover { background: #2f2d2a; }
        .btn-sm { min-width: 50px; padding: 4px 8px; font-size: 12px; flex: none; }
        .hint { color: #9b9a97; font-size: 12px; margin-top: 8px; }
        .form-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .form-row > * { flex: 1; min-width: 80px; }
        .option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px; margin-bottom: 12px; }
        .option-btn { padding: 8px; border-radius: 3px; text-align: left; cursor: pointer; transition: all 0.15s; border: 1px solid #e9e9e7; width: 100%; background: #ffffff; }
        .option-btn:hover { background: #f7f6f3; }
        .option-selected { background: #f7f6f3; border-color: #37352f; }
        .option-name { color: #37352f; font-size: 11px; font-weight: 500; }
        .option-input { width: 100%; padding: 4px 6px; background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; color: #37352f; font-size: 12px; outline: none; margin-top: 4px; }
        .option-max { color: #9b9a97; font-size: 10px; margin-top: 4px; }
        .option-section-title { font-size: 11px; color: #9b9a97; margin: 8px 0 6px 0; }
        
        /* 고유옵션 입력 */
        .passive-input-box { background: #f7f6f3; border-radius: 3px; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #e9e9e7; }
        .passive-text { color: #37352f; font-size: 11px; font-weight: 500; background: #e9e9e7; padding: 2px 6px; border-radius: 3px; }
        .unique-row.selected .passive-text { background: #555; color: #fff; }
        
        /* 리스트 스타일 */
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .list-header-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .list-header-right { display: flex; gap: 6px; flex-wrap: wrap; }
        .list-controls { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; }
        .search-input { padding: 6px 10px; border: 1px solid #e9e9e7; border-radius: 3px; font-size: 12px; width: 150px; }
        .filter-select { padding: 6px 8px; border: 1px solid #e9e9e7; border-radius: 3px; font-size: 12px; }
        
        .item-list-scroll { max-height: 280px; overflow-y: auto; border: 1px solid #e9e9e7; border-radius: 3px; }
        .item-list-scroll::-webkit-scrollbar { width: 6px; }
        .item-list-scroll::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 3px; }
        
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #e9e9e7; font-size: 12px; }
        .item-row:last-child { border-bottom: none; }
        .item-row:hover { background: #f7f6f3; }
        .item-row-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .item-row-right { display: flex; gap: 4px; flex-shrink: 0; }
        .tier-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 500; background: #e9e9e7; color: #37352f; flex-shrink: 0; }
        .item-type-name { font-weight: 500; flex-shrink: 0; }
        .item-options-text { color: #9b9a97; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .card-btn { padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; border: 1px solid #e9e9e7; background: #ffffff; color: #9b9a97; }
        .card-btn:hover { background: #f7f6f3; color: #37352f; }
        
        /* 유니크 장비 */
        .unique-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #e9e9e7; font-size: 12px; }
        .unique-row:last-child { border-bottom: none; }
        .unique-row:hover { background: #f7f6f3; }
        .unique-row.selected { background: #37352f; color: #fff; }
        .unique-row.selected .tier-badge { background: #555; color: #fff; }
        .unique-row.selected .item-options-text { color: #ccc; }
        .unique-row.selected .card-btn { background: #555; color: #fff; border-color: #555; }
        .unique-name { font-weight: 600; color: #37352f; }
        .unique-row.selected .unique-name { color: #fff; }
        .select-btn { padding: 2px 8px; border-radius: 3px; font-size: 10px; cursor: pointer; border: 1px solid #e9e9e7; background: #fff; }
        .select-btn.selected { background: #37352f; color: #fff; border-color: #37352f; }
        
        .toggle-btn { background: #ffffff; color: #37352f; padding: 4px 10px; border-radius: 3px; border: 1px solid #e9e9e7; cursor: pointer; font-size: 12px; }
        .toggle-btn:hover { background: #f7f6f3; }
        .clear-btn { background: #ffffff; color: #9b9a97; padding: 4px 10px; border-radius: 3px; border: 1px solid #e9e9e7; cursor: pointer; font-size: 12px; }
        .clear-btn:hover { background: #f7f6f3; color: #37352f; }
        .item-count { color: #9b9a97; font-size: 12px; }
        .empty-state { text-align: center; padding: 20px; color: #9b9a97; font-size: 13px; }
        
        /* 모드 컨트롤 */
        .test-mode-control, .excel-control { display: flex; gap: 8px; align-items: center; margin-top: 12px; padding: 10px 12px; background: #f7f6f3; border-radius: 3px; flex-wrap: wrap; }
        .test-mode-label, .excel-label { font-size: 12px; color: #9b9a97; }
        .excel-upload-btn { cursor: pointer; }
        .excel-hint { font-size: 11px; color: #9b9a97; }
        
        /* 추천 */
        .race-btn-group { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .race-btn { flex: 1; min-width: 70px; padding: 10px 16px; border-radius: 3px; font-weight: 500; border: 1px solid #e9e9e7; cursor: pointer; font-size: 13px; background: #ffffff; color: #37352f; }
        .race-btn:hover { background: #f7f6f3; }
        .race-btn.active { background: #37352f; color: #ffffff; border-color: #37352f; }
        .race-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .crit-toggle { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7f6f3; border-radius: 3px; margin-bottom: 12px; flex-wrap: wrap; }
        .crit-toggle-label { font-size: 13px; color: #37352f; }
        .crit-toggle-btn { padding: 4px 12px; border-radius: 3px; font-size: 12px; border: 1px solid #e9e9e7; cursor: pointer; background: #ffffff; color: #9b9a97; }
        .crit-toggle-btn.active { background: #37352f; color: #ffffff; border-color: #37352f; }
        
        /* M작 시뮬레이션 */
        .mcraft-control { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f7f6f3; border-radius: 3px; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
        .mcraft-control-label { font-size: 13px; font-weight: 500; color: #37352f; }
        .mcraft-control-btns { display: flex; gap: 6px; align-items: center; }
        .mcraft-count { font-size: 12px; color: #37352f; font-weight: 500; background: #e9e9e7; padding: 2px 8px; border-radius: 3px; }
        
        /* 결과 */
        .result-card { background: #f7f6f3; border-radius: 3px; padding: 14px; border: 1px solid #e9e9e7; margin-bottom: 12px; }
        .result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .result-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 500; background: #37352f; color: #ffffff; }
        .result-title { color: #37352f; font-weight: 600; font-size: 14px; }
        .result-meta { color: #9b9a97; font-size: 12px; }
        .result-highlight { background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; padding: 12px; margin-bottom: 12px; }
        .highlight-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .highlight-row:last-child { margin-bottom: 0; }
        .highlight-label { font-size: 13px; color: #9b9a97; }
        .highlight-value { font-size: 16px; font-weight: 600; color: #37352f; }
        .value-before { color: #9b9a97; text-decoration: line-through; font-size: 14px; }
        .value-arrow { color: #9b9a97; margin: 0 4px; }
        .value-after { color: #37352f; font-weight: 600; }
        
        .sub-title { color: #9b9a97; font-size: 12px; font-weight: 500; margin-bottom: 8px; }
        .sim-label { font-size: 10px; color: #37352f; background: #e9e9e7; padding: 1px 5px; border-radius: 3px; margin-left: 4px; }
        
        .selected-items { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .selected-item { background: #ffffff; padding: 6px 10px; border-radius: 3px; font-size: 12px; color: #37352f; border: 1px solid #e9e9e7; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; cursor: pointer; transition: all 0.15s; }
        .selected-item:hover { background: #f7f6f3; border-color: #37352f; }
        .selected-item.mcrafted { background: #37352f; border-color: #37352f; }
        .selected-item.mcrafted .selected-item-name { color: #ffffff; }
        .selected-item.mcrafted .selected-item-options { color: #d4d4d4; }
        .selected-item.maxed { opacity: 0.6; cursor: default; }
        .selected-item.unique { border-left: 3px solid #37352f; }
        .selected-item-left { display: flex; align-items: center; gap: 6px; }
        .selected-item-name { font-weight: 500; }
        .selected-item-options { font-size: 11px; color: #9b9a97; }
        .mcraft-badge-small { font-size: 10px; background: #ffffff; color: #37352f; padding: 1px 5px; border-radius: 3px; font-weight: 500; }
        .maxed-badge { font-size: 10px; background: #e9e9e7; color: #9b9a97; padding: 1px 5px; border-radius: 3px; }
        .unique-badge { font-size: 10px; background: #37352f; color: #fff; padding: 1px 5px; border-radius: 3px; }
        .passive-badge { font-size: 10px; background: #e9e9e7; color: #37352f; padding: 1px 5px; border-radius: 3px; }
        .selected-item.mcrafted .passive-badge { background: #555; color: #fff; }
        
        .strikethrough { text-decoration: line-through; color: #9b9a97; }
        .mcraft-value { font-weight: 600; color: #37352f; }
        
        .achievement-item { background: #ffffff; border-radius: 3px; padding: 10px; margin-bottom: 6px; border: 1px solid #e9e9e7; }
        .achievement-item.improved { border-color: #37352f; }
        .achievement-title { color: #37352f; font-weight: 500; font-size: 12px; margin-bottom: 4px; }
        .achievement-detail { color: #9b9a97; font-size: 11px; margin-bottom: 2px; }
        .text-success { color: #37352f; font-weight: 500; }
        .text-warning { color: #9b9a97; }
        .text-error { color: #37352f; text-decoration: underline; }
        .improve-diff { color: #37352f; font-weight: 500; }
        
        .summary-box { margin-top: 12px; padding: 10px; border-radius: 3px; background: #ffffff; border: 1px solid #e9e9e7; }
        .summary-box.success { border-color: #37352f; }
        .summary-title { font-size: 12px; font-weight: 500; color: #37352f; }
        .summary-detail { font-size: 11px; margin-top: 4px; color: #9b9a97; }
        .loading { text-align: center; padding: 20px; color: #9b9a97; }
        
                .name-card-box { display: grid; grid-template-columns: 1fr 1fr; column-gap: 6px; align-items: center; }
        .name-card-box > p { font-weight: 600; font-size: 16px; }
        .title-wrapper { display: flex; justify-content: space-between;}
        .helper { font-weight: 600 !important; font-size: 14px !important; }
        .author { font-weight: 500 !important; font-size: 11px !important; }
        .badges { display: flex; flex-wrap: wrap; gap: 6px; }
        .badge-outline {
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 60px;
            font-size: 11px;
            font-weight: 500;
            padding: 3px 8px;
            border-radius: 10px;
            border: 1px solid #30363d;
            color: #30363d;
            background: transparent;
            margin-top: 6px;
        }

        .badge-outline .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #3fb950;
            margin-right: 6px;
            align-self: center;
        }

        .badge-outline .dot.blue { background: #58a6ff; }
        .badge-outline .dot.purple { background: #a371f7; }
        .badge-outline .dot.orange { background: #d29922; }
        .badge-outline .dot.pink { background: #db61a2; }


        @media (max-width: 480px) {
          .eq-calc-container { padding: 12px; }
          .section { padding: 12px; }
          .form-row > * { min-width: 100%; }
          .btn-group { flex-direction: column; }
          .btn { min-width: 100%; }
          .search-input { width: 100%; }
          .list-header { flex-direction: column; align-items: flex-start; }
          .list-header-right { width: 100%; justify-content: space-between; }
          .race-btn-group { flex-direction: column; }
        }
      `}</style>
      
      <div className="wrapper">
        <div className="header">
            <div className="title-wrapper">
              <h1 className="title">장비 옵션 계산기</h1>
              <div className="name-card-box">
                <p className="helper">도움을 주신분</p>
                <p className="author">(Made by Blue)</p>
                {/* <div class="badges"> */}
                  <span class="badge-outline">만두🌸</span>
                  <span class="badge-outline">헬리🌸터</span>
                  {/* <span class="badge-outline"><span class="dot blue"></span></span>
                  <span class="badge-outline"><span class="dot purple"></span></span>
                  <span class="badge-outline"><span class="dot orange"></span></span>
                  <span class="badge-outline"><span class="dot pink"></span></span> */}
                {/* </div> */}
              </div>
            </div>
            <p className="subtitle">목표 수치를 달성하면서 종족 옵션을 최대화하는 조합을 찾습니다</p>
          </div>

        {/* 목표 수치 */}
        <div className="section">
          <h2 className="section-title">목표 수치</h2>
          <div className="grid-3">
            {baseOptionTypes.map(option => (
              <div key={option.id} className="input-box">
                <label className="label">{option.abbr}</label>
                <input
                  type="number" min="0" max="100"
                  value={targetValues[option.id] === 0 ? '' : targetValues[option.id]}
                  onChange={(e) => updateTargetValue(option.id, e.target.value)}
                  className="input" placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 계산 모드 */}
        <div className="section">
          <h2 className="section-title">계산 모드</h2>
          <div className="btn-group">
            {/* <button
              onClick={() => {
                setUseActualValues(false);
                setIsTestMode(false);
                setItems([]);
                setUniqueEquipments([]);
                cancelEdit();
                resetResults();
              }}
              className={`btn ${!useActualValues && !isTestMode ? 'btn-active' : ''}`}
            >
              최대값 기준
            </button> */}
            <button
              onClick={() => {
                setUseActualValues(true);
                setIsTestMode(false);
                setItems(loadFromStorage());
                setUniqueEquipments(loadUniqueFromStorage());
                cancelEdit();
                resetResults();
              }}
              className={`btn ${useActualValues && !isTestMode ? 'btn-active' : ''}`}
            >
              실제 수치 입력
            </button>
            <button
              onClick={() => {
                setUseActualValues(true);
                setIsTestMode(true);
                setItems(generateDummyData(250));
                setUniqueEquipments([]);
                cancelEdit();
                resetResults();
              }}
              className={`btn ${isTestMode ? 'btn-active' : ''}`}
            >
              테스트 모드
            </button>
          </div>
          
          {isTestMode && (
            <div className="test-mode-control">
              <span className="test-mode-label">더미 생성:</span>
              <button onClick={() => { setItems(generateDummyData(50)); resetResults(); }} className="btn btn-sm">50개</button>
              <button onClick={() => { setItems(generateDummyData(100)); resetResults(); }} className="btn btn-sm">100개</button>
              <button onClick={() => { setItems(generateDummyData(250)); resetResults(); }} className="btn btn-sm">250개</button>
            </div>
          )}
          
          {useActualValues && !isTestMode && (
            <div className="excel-control">
              <span className="excel-label">엑셀:</span>
              <label className="btn btn-sm excel-upload-btn">
                업로드
                <input type="file" accept=".csv,.txt" onChange={handleExcelUpload} style={{ display: 'none' }} />
              </label>
              <button onClick={downloadExcel} className="btn btn-sm">다운로드</button>
              <span className="excel-hint">CSV (UTF-8)</span>
            </div>
          )}
          
          <p className="hint">
            {isTestMode ? '테스트 모드: 더미 데이터로 테스트합니다.' : 
             useActualValues ? '실제 수치를 입력합니다. 자동 저장됩니다.' : '단계별 최대 수치로 계산합니다.'}
          </p>
        </div>

        {/* 일반 장비 입력 */}
        <div className="section">
          <h2 className="section-title">{editingItemId ? '일반 장비 수정' : '일반 장비 추가'}</h2>
          
          <div className="form-row">
            <div>
              <label className="label">종류</label>
              <select value={newItem.itemType} onChange={(e) => setNewItem(prev => ({ ...prev, itemType: e.target.value }))} className="select">
                {itemTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="label">단계</label>
              <select value={newItem.tier} onChange={(e) => updateNewItemTier(e.target.value)} className="select">
                <option value="태초">태초</option>
                <option value="혼돈">혼돈</option>
                <option value="심연">심연</option>
              </select>
            </div>
          </div>

          <div className="option-section-title">기본 옵션</div>
          <div className="option-grid">
            {baseOptionTypes.map(option => {
              const isSelected = newItem.options[option.id] !== undefined;
              const maxValue = tierMaxValues[newItem.tier][option.group];
              return (
                <button key={option.id} onClick={() => toggleNewItemOption(option.id)} className={`option-btn ${isSelected ? 'option-selected' : ''}`}>
                  <div className="option-name">{option.abbr}</div>
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {useActualValues ? (
                        <input type="number" min="0" max={maxValue} value={newItem.options[option.id] || ''} onChange={(e) => updateNewItemOptionValue(option.id, e.target.value)} className="option-input" placeholder="0" />
                      ) : (
                        <div className="option-max">최대: {maxValue}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="option-section-title">딜러 옵션</div>
          <div className="option-grid">
            {bonusOptionTypes.map(option => {
              const isSelected = newItem.options[option.id] !== undefined;
              const maxValue = tierMaxValues[newItem.tier][option.group];
              return (
                <button key={option.id} onClick={() => toggleNewItemOption(option.id)} className={`option-btn ${isSelected ? 'option-selected' : ''}`}>
                  <div className="option-name">{option.abbr}</div>
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {useActualValues ? (
                        <input type="number" min="0" max={maxValue} value={newItem.options[option.id] || ''} onChange={(e) => updateNewItemOptionValue(option.id, e.target.value)} className="option-input" placeholder="0" />
                      ) : (
                        <div className="option-max">최대: {maxValue}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="btn-group">
            {editingItemId ? (
              <>
                <button onClick={saveEditItem} className="btn btn-active">수정 완료</button>
                <button onClick={cancelEdit} className="btn">취소</button>
              </>
            ) : (
              <button onClick={addItem} className="btn btn-active">추가</button>
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
              <button onClick={() => setIsListExpanded(!isListExpanded)} className="toggle-btn">
                {isListExpanded ? '접기' : '펼치기'}
              </button>
              {items.length > 0 && <button onClick={clearAllItems} className="clear-btn">전체 삭제</button>}
            </div>
          </div>

          {isListExpanded && (
            <>
              <div className="list-controls">
                <input type="text" placeholder="종류, 단계, 옵션 검색" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="search-input" />
                <select value={filterItemType} onChange={(e) => setFilterItemType(e.target.value)} className="filter-select">
                  <option value="전체">전체 종류</option>
                  {itemTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="filter-select">
                  <option value="전체">전체 단계</option>
                  <option value="태초">태초</option>
                  <option value="혼돈">혼돈</option>
                  <option value="심연">심연</option>
                </select>
              </div>
              
              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  {items.length === 0 ? '추가된 장비가 없습니다' : '검색 결과가 없습니다'}
                </div>
              ) : (
                <div className="item-list-scroll">
                  {filteredItems.map(item => {
                    const optionsText = Object.entries(item.options)
                      .map(([optId, val]) => `${allOptionTypes.find(o => o.id === optId)?.abbr}:${val}`)
                      .join(' ');
                    return (
                      <div key={item.id} className="item-row">
                        <div className="item-row-left">
                          <span className="tier-badge">{item.tier}</span>
                          <span className="item-type-name">{item.itemType}</span>
                          <span className="item-options-text">{optionsText}</span>
                        </div>
                        <div className="item-row-right">
                          <button onClick={() => startEditItem(item)} className="card-btn">수정</button>
                          <button onClick={() => removeItem(item.id)} className="card-btn">삭제</button>
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
            {selectedUniqueItems.length > 0 && <span className="badge selected">{selectedUniqueItems.length}/2 선택</span>}
          </h2>
          
          <div className="form-row">
            <div>
              <label className="label">부위</label>
              <select value={newUniqueItem.itemType} onChange={(e) => updateNewUniqueItemType(e.target.value)} className="select">
                {Object.keys(uniqueItemDefs).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="label">장비명</label>
              <select value={newUniqueItem.uniqueName} onChange={(e) => updateNewUniqueName(e.target.value)} className="select">
                {(uniqueItemDefs[newUniqueItem.itemType] || []).map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* 고유옵션 입력 */}
          {(() => {
            const def = uniqueDefMap[newUniqueItem.uniqueName];
            if (!def) return null;
            return (
              <div className="passive-input-box">
                <label className="label">고유옵션: {def.passive} ({def.min}~{def.max}{def.unit})</label>
                <input
                  type="number"
                  min={def.min}
                  max={def.max}
                  value={newUniqueItem.passiveValue || ''}
                  onChange={(e) => setNewUniqueItem(prev => ({ ...prev, passiveValue: parseInt(e.target.value) || 0 }))}
                  className="input"
                  placeholder={`${def.min}~${def.max}`}
                />
              </div>
            );
          })()}

          <div className="option-section-title">기본 옵션 (4개)</div>
          <div className="option-grid">
            {baseOptionTypes.map(option => {
              const isSelected = newUniqueItem.options[option.id] !== undefined;
              const maxValue = tierMaxValues['유니크'][option.group];
              return (
                <button key={option.id} onClick={() => toggleNewUniqueOption(option.id)} className={`option-btn ${isSelected ? 'option-selected' : ''}`}>
                  <div className="option-name">{option.abbr}</div>
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {useActualValues ? (
                        <input type="number" min="0" max={maxValue} value={newUniqueItem.options[option.id] || ''} onChange={(e) => updateNewUniqueOptionValue(option.id, e.target.value)} className="option-input" placeholder="0" />
                      ) : (
                        <div className="option-max">최대: {maxValue}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="option-section-title">딜러 옵션</div>
          <div className="option-grid">
            {bonusOptionTypes.map(option => {
              const isSelected = newUniqueItem.options[option.id] !== undefined;
              const maxValue = tierMaxValues['유니크'][option.group];
              return (
                <button key={option.id} onClick={() => toggleNewUniqueOption(option.id)} className={`option-btn ${isSelected ? 'option-selected' : ''}`}>
                  <div className="option-name">{option.abbr}</div>
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {useActualValues ? (
                        <input type="number" min="0" max={maxValue} value={newUniqueItem.options[option.id] || ''} onChange={(e) => updateNewUniqueOptionValue(option.id, e.target.value)} className="option-input" placeholder="0" />
                      ) : (
                        <div className="option-max">최대: {maxValue}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="btn-group">
            {editingUniqueId ? (
              <>
                <button onClick={saveEditUniqueItem} className="btn btn-active">수정 완료</button>
                <button onClick={cancelEdit} className="btn">취소</button>
              </>
            ) : (
              <button onClick={addUniqueItem} className="btn btn-active">추가</button>
            )}
          </div>
        </div>

        {/* 유니크 장비 목록 */}
        <div className="section">
          <div className="list-header">
            <div className="list-header-left">
              <h2 className="section-title" style={{ margin: 0 }}>유니크 장비</h2>
              <span className="item-count">({uniqueEquipments.length})</span>
              {selectedUniqueItems.length > 0 && <span className="badge selected">{selectedUniqueItems.length}개 선택됨</span>}
            </div>
            <div className="list-header-right">
              <button onClick={() => setIsUniqueListExpanded(!isUniqueListExpanded)} className="toggle-btn">
                {isUniqueListExpanded ? '접기' : '펼치기'}
              </button>
              {uniqueEquipments.length > 0 && <button onClick={clearAllUniqueItems} className="clear-btn">전체 삭제</button>}
            </div>
          </div>

          {isUniqueListExpanded && (
            <>
              {uniqueEquipments.length > 3 && (
                <div className="list-controls">
                  <input type="text" placeholder="검색..." value={uniqueSearchText} onChange={(e) => setUniqueSearchText(e.target.value)} className="search-input" />
                </div>
              )}
              
              {filteredUniqueItems.length === 0 ? (
                <div className="empty-state">
                  {uniqueEquipments.length === 0 ? '추가된 유니크 장비가 없습니다' : '검색 결과가 없습니다'}
                </div>
              ) : (
                <div className="item-list-scroll">
                  {filteredUniqueItems.map(item => {
                    const def = uniqueDefMap[item.uniqueName];
                    const passiveText = def ? `${def.passive} ${item.passiveValue}${def.unit}` : '';
                    const optionsText = Object.entries(item.options)
                      .map(([optId, val]) => `${allOptionTypes.find(o => o.id === optId)?.abbr}:${val}`)
                      .join(' ');
                    return (
                      <div key={item.id} className={`unique-row ${item.selected ? 'selected' : ''}`}>
                        <div className="item-row-left">
                          <button onClick={() => toggleUniqueSelection(item.id)} className={`select-btn ${item.selected ? 'selected' : ''}`}>
                            {item.selected ? '✓' : '○'}
                          </button>
                          <span className="unique-name">{item.uniqueName}</span>
                          <span className="item-type-name">({item.itemType})</span>
                          <span className="passive-text">{passiveText}</span>
                          <span className="item-options-text">{optionsText}</span>
                        </div>
                        <div className="item-row-right">
                          <button onClick={() => startEditUniqueItem(item)} className="card-btn">수정</button>
                          <button onClick={() => removeUniqueItem(item.id)} className="card-btn">삭제</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          
          <p className="hint">유니크 장비를 선택하면 해당 부위를 제외하고 나머지 장비에서 조합을 찾습니다. (최대 2개)</p>
        </div>

        {/* 장비 추천 */}
        <div className="section">
          <h2 className="section-title">장비 추천</h2>
          
          <div className="crit-toggle">
            <span className="crit-toggle-label">치피:</span>
            <button onClick={() => setIncludeCritDmg(!includeCritDmg)} className={`crit-toggle-btn ${includeCritDmg ? 'active' : ''}`}>
              {includeCritDmg ? 'ON' : 'OFF'}
            </button>
            <span className="crit-toggle-label" style={{ marginLeft: '12px' }}>전공:</span>
            <button onClick={() => setIncludeTotalAtk(!includeTotalAtk)} className={`crit-toggle-btn ${includeTotalAtk ? 'active' : ''}`}>
              {includeTotalAtk ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="race-btn-group">
            {['demon', 'boss', 'primate'].map(race => (
              <button key={race} onClick={() => handleRaceSelect(race)} className={`race-btn ${selectedRace === race ? 'active' : ''}`} disabled={isCalculating || (items.length === 0 && selectedUniqueItems.length === 0)}>
                {raceNames[race]}
              </button>
            ))}
          </div>

          {isCalculating && <div className="loading">계산 중...</div>}

          {raceResults && !isCalculating && (
            <div className="result-card">
              <div className="result-header">
                <span className="result-badge">{raceNames[selectedRace]} 최적 조합</span>
                {includeCritDmg && <span className="result-meta">+ 치피</span>}
                {includeTotalAtk && <span className="result-meta">+ 전공</span>}
              </div>

              <div className="mcraft-control">
                <span className="mcraft-control-label">M작 시뮬레이션</span>
                <div className="mcraft-control-btns">
                  <button onClick={() => toggleAllMCraft(raceResults.items, true)} className="btn btn-sm">전체 적용</button>
                  <button onClick={() => toggleAllMCraft(raceResults.items, false)} className="btn btn-sm">전체 해제</button>
                  {mCraftCount > 0 && <span className="mcraft-count">{mCraftCount}개</span>}
                </div>
              </div>

              {(() => {
                const sim = getSimulatedTotals(raceResults);
                const hasSim = mCraftCount > 0;
                return (
                  <>
                    <div className="result-highlight">
                      <div className="highlight-row">
                        <span className="highlight-label">{raceNames[selectedRace]}</span>
                        <span className="highlight-value">
                          {hasSim ? (<><span className="value-before">{raceResults.raceTotal}</span><span className="value-arrow">→</span><span className="value-after">{sim.raceTotal}</span></>) : raceResults.raceTotal}
                        </span>
                      </div>
                      {includeCritDmg && (
                        <div className="highlight-row">
                          <span className="highlight-label">치피</span>
                          <span className="highlight-value">
                            {hasSim ? (<><span className="value-before">{raceResults.critDmgTotal}</span><span className="value-arrow">→</span><span className="value-after">{sim.critDmgTotal}</span></>) : raceResults.critDmgTotal}
                          </span>
                        </div>
                      )}
                      {includeTotalAtk && (
                        <div className="highlight-row">
                          <span className="highlight-label">전공</span>
                          <span className="highlight-value">
                            {hasSim ? (<><span className="value-before">{raceResults.totalAtkTotal}</span><span className="value-arrow">→</span><span className="value-after">{sim.totalAtkTotal}</span></>) : raceResults.totalAtkTotal}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="sub-title">선택된 장비 (클릭: M작 시뮬)</div>
                    <div className="selected-items">
                      {raceResults.items.map((item, idx) => {
                        const isMCrafted = mCraftSimulation[item.id];
                        const isUnique = !!item.uniqueName;
                        const canMCraft = Object.entries(item.options).some(([optId, val]) => {
                          const opt = allOptionTypes.find(o => o.id === optId);
                          return val < tierMaxValues[item.tier][opt.group];
                        });
                        
                        const optionsDisplay = Object.entries(item.options).map(([optId, val]) => {
                          const opt = allOptionTypes.find(o => o.id === optId);
                          const maxVal = tierMaxValues[item.tier][opt.group];
                          if (isMCrafted && val < maxVal) {
                            return <span key={optId}>{opt.abbr}:<span className="strikethrough">{val}</span>→<span className="mcraft-value">{maxVal}</span></span>;
                          }
                          return <span key={optId}>{opt.abbr}:{val}</span>;
                        });
                        
                        return (
                          <div key={idx} className={`selected-item ${isMCrafted ? 'mcrafted' : ''} ${!canMCraft ? 'maxed' : ''} ${isUnique ? 'unique' : ''}`}
                               onClick={() => canMCraft && toggleMCraftSimulation(item.id)}>
                            <div className="selected-item-left">
                              <span className="selected-item-name">
                                {isUnique ? item.uniqueName : item.itemType} 
                                {!isUnique && `(${item.tier})`}
                              </span>
                              {isUnique && <span className="unique-badge">유니크</span>}
                              {isUnique && item.passiveValue && (() => {
                                const def = uniqueDefMap[item.uniqueName];
                                return def ? <span className="passive-badge">{item.passiveValue}{def.unit}</span> : null;
                              })()}
                              {isMCrafted && <span className="mcraft-badge-small">M작</span>}
                              {!canMCraft && <span className="maxed-badge">MAX</span>}
                            </div>
                            <span className="selected-item-options">
                              {optionsDisplay.map((el, i) => <span key={i}>{i > 0 && ' / '}{el}</span>)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="sub-title">목표 달성률 {hasSim && <span className="sim-label">M작 적용</span>}</div>
                    {baseOptionTypes.map(option => {
                      const target = targetValues[option.id];
                      if (target === 0) return null;
                      
                      const totals = hasSim ? sim.totals : raceResults.totals;
                      const runeInfo = hasSim ? sim.runeInfo : raceResults.runeInfo;
                      const achieved = totals[option.id];
                      const rune = runeInfo[option.id];
                      const withRune = achieved + (rune?.needed || 0);
                      const improved = hasSim && achieved > raceResults.totals[option.id];
                      
                      return (
                        <div key={option.id} className={`achievement-item ${improved ? 'improved' : ''}`}>
                          <div className="achievement-title">{option.name}</div>
                          <div className="achievement-detail">
                            목표: {target} / 장비: {achieved}
                            {improved && <span className="improve-diff"> (+{achieved - raceResults.totals[option.id]})</span>}
                          </div>
                          {rune?.needed > 0 && <div className="achievement-detail">룬: {rune.needed}</div>}
                          {rune?.excess > 0 && <div className="achievement-detail text-warning">초과: +{rune.excess}</div>}
                          {rune?.shortage > 0 ? (
                            <div className="achievement-detail text-error">부족: {rune.shortage}</div>
                          ) : withRune >= target && (
                            <div className="achievement-detail text-success">달성 ({withRune})</div>
                          )}
                        </div>
                      );
                    })}

                    {(hasSim ? sim.totalShortage : raceResults.totalShortage) > 0 ? (
                      <div className="summary-box">
                        <div className="summary-title">일부 목표 미달성</div>
                        <div className="summary-detail">
                          {raceResults.targetsMet}/{raceResults.totalTargets} 목표 달성 / M작으로 보완 가능
                        </div>
                      </div>
                    ) : (
                      <div className="summary-box success">
                        <div className="summary-title">모든 목표 달성 가능</div>
                        <div className="summary-detail">
                          {raceNames[selectedRace]}: {hasSim ? sim.raceTotal : raceResults.raceTotal}
                          {includeCritDmg && ` / 치피: ${hasSim ? sim.critDmgTotal : raceResults.critDmgTotal}`}
                          {includeTotalAtk && ` / 전공: ${hasSim ? sim.totalAtkTotal : raceResults.totalAtkTotal}`}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
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