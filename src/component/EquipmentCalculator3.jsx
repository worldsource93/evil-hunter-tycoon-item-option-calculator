import React, { useState, useEffect, useCallback } from 'react';

const EquipmentCalculator = () => {
  // 기본 옵션 (목표 수치용)
  const baseOptionTypes = [
    { id: 'critRate', name: '치명타확률', group: 'A', max: 50 },
    { id: 'atkSpeed', name: '공격속도', group: 'A', max: 60 },
    { id: 'evasion', name: '회피율', group: 'A', max: 40 },
    { id: 'dmgReduce', name: '받는 데미지 감소', group: 'B', max: 100 },
    { id: 'lifesteal', name: '흡혈', group: 'B', max: 100 },
    { id: 'moveSpeed', name: '이동속도', group: 'B', max: 100 }
  ];

  // 추가 옵션 (종족/치피/전공)
  const bonusOptionTypes = [
    { id: 'demon', name: '악마', group: 'C' },
    { id: 'boss', name: '보스', group: 'C' },
    { id: 'primate', name: '영장', group: 'C' },
    { id: 'critDmg', name: '치명타피해량', group: 'C' },
    { id: 'totalAtk', name: '전체공격력', group: 'D' }
  ];

  // 전체 옵션
  const allOptionTypes = [...baseOptionTypes, ...bonusOptionTypes];

  // 단계별 최대 수치
  const tierMaxValues = {
    '태초': { A: 12, B: 17, C: 35, D: 23 },
    '혼돈': { A: 14, B: 19, C: 40, D: 26 },
    '심연': { A: 16, B: 21, C: 45, D: 29 }
  };

  // 아이템 종류 정의
  const itemTypes = ['무기', '목걸이', '반지', '벨트', '투구', '갑옷', '장갑', '신발'];

  // 룬 최대값 정의
  const runeMaxValues = {
    critRate: 6,
    atkSpeed: 6,
    evasion: 6,
    dmgReduce: 12,
    lifesteal: 12,
    moveSpeed: 12
  };

  // 로컬스토리지 키
  const STORAGE_KEY = 'equipment_calculator_items_v2';

  // 더미 데이터 생성 (250개)
  const generateDummyData = (count = 250) => {
    const dummyItems = [];
    const tiers = ['태초', '혼돈', '심연'];
    const allOptions = [...baseOptionTypes, ...bonusOptionTypes];
    
    for (let i = 0; i < count; i++) {
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const itemType = itemTypes[i % itemTypes.length];
      
      // 1~4개 랜덤 옵션
      const numOptions = Math.floor(Math.random() * 4) + 1;
      
      // 딜러 아이템 비율 높이기 (70% 확률로 종족/치피/전공 중 하나 이상 포함)
      const options = {};
      const usedOptions = new Set();
      
      // 70% 확률로 딜러 옵션 먼저 추가
      if (Math.random() < 0.7) {
        const dealerOptions = ['demon', 'boss', 'primate', 'critDmg', 'totalAtk'];
        // 종족 하나 선택
        const raceOptions = ['demon', 'boss', 'primate'];
        const selectedRace = raceOptions[Math.floor(Math.random() * raceOptions.length)];
        
        // 종족 추가
        const raceOpt = allOptions.find(o => o.id === selectedRace);
        const raceMax = tierMaxValues[tier][raceOpt.group];
        options[selectedRace] = Math.floor(raceMax * (0.6 + Math.random() * 0.4));
        usedOptions.add(selectedRace);
        
        // 50% 확률로 치피 추가
        if (numOptions >= 2 && Math.random() < 0.5) {
          const critOpt = allOptions.find(o => o.id === 'critDmg');
          const critMax = tierMaxValues[tier][critOpt.group];
          options['critDmg'] = Math.floor(critMax * (0.6 + Math.random() * 0.4));
          usedOptions.add('critDmg');
        }
        
        // 40% 확률로 전공 추가
        if (numOptions >= 3 && Math.random() < 0.4) {
          const atkOpt = allOptions.find(o => o.id === 'totalAtk');
          const atkMax = tierMaxValues[tier][atkOpt.group];
          options['totalAtk'] = Math.floor(atkMax * (0.6 + Math.random() * 0.4));
          usedOptions.add('totalAtk');
        }
      }
      
      // 나머지 옵션 채우기
      const remainingOptions = allOptions.filter(o => !usedOptions.has(o.id));
      const shuffled = remainingOptions.sort(() => Math.random() - 0.5);
      
      let currentCount = Object.keys(options).length;
      for (const option of shuffled) {
        if (currentCount >= numOptions) break;
        const maxValue = tierMaxValues[tier][option.group];
        options[option.id] = Math.floor(maxValue * (0.6 + Math.random() * 0.4));
        currentCount++;
      }
      
      dummyItems.push({
        id: Date.now() + i,
        tier,
        itemType,
        options
      });
    }
    
    return dummyItems;
  };

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load:', e);
    }
    return [];
  };

  const saveToStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  // 엑셀 헤더 매핑
  const excelHeaders = ['장비종류', '단계', '치확', '공속', '회피', '받뎀감', '흡혈', '이속', '악마', '보스', '영장', '치피', '전공'];
  const headerToOptionId = {
    '치확': 'critRate',
    '공속': 'atkSpeed',
    '회피': 'evasion',
    '받뎀감': 'dmgReduce',
    '흡혈': 'lifesteal',
    '이속': 'moveSpeed',
    '악마': 'demon',
    '보스': 'boss',
    '영장': 'primate',
    '치피': 'critDmg',
    '전공': 'totalAtk'
  };
  const optionIdToHeader = Object.fromEntries(
    Object.entries(headerToOptionId).map(([k, v]) => [v, k])
  );

  // 엑셀 다운로드
  const downloadExcel = () => {
    if (items.length === 0) {
      alert('다운로드할 장비가 없습니다.');
      return;
    }

    // CSV 생성
    const rows = [excelHeaders.join(',')];
    
    items.forEach(item => {
      const row = [
        item.itemType,
        item.tier,
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

    const csvContent = '\uFEFF' + rows.join('\n'); // BOM for Korean
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

        // 헤더 파싱
        const headers = lines[0].split(',').map(h => h.trim());
        
        // 헤더 검증
        const itemTypeIdx = headers.indexOf('장비종류');
        const tierIdx = headers.indexOf('단계');
        
        if (itemTypeIdx === -1 || tierIdx === -1) {
          alert('헤더에 "장비종류"와 "단계" 열이 필요합니다.');
          return;
        }

        const newItems = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 2) continue;
          
          const itemType = values[itemTypeIdx];
          const tier = values[tierIdx];
          
          // 유효성 검사
          if (!itemTypes.includes(itemType)) continue;
          if (!['태초', '혼돈', '심연'].includes(tier)) continue;
          
          const options = {};
          
          headers.forEach((header, idx) => {
            if (header === '장비종류' || header === '단계') return;
            
            const optionId = headerToOptionId[header];
            if (!optionId) return;
            
            const value = parseInt(values[idx]);
            if (value && value > 0) {
              options[optionId] = value;
            }
          });
          
          if (Object.keys(options).length > 0) {
            newItems.push({
              id: Date.now() + i,
              tier,
              itemType,
              options
            });
          }
        }

        if (newItems.length === 0) {
          alert('유효한 장비 데이터가 없습니다.');
          return;
        }

        // 기존 데이터에 추가
        setItems(prev => [...prev, ...newItems]);
        setIsTestMode(false);
        setUseActualValues(true);
        alert(`${newItems.length}개의 장비가 추가되었습니다.`);
        
      } catch (error) {
        console.error('Excel parse error:', error);
        alert('파일 파싱 중 오류가 발생했습니다.');
      }
    };
    
    reader.readAsText(file, 'UTF-8');
    e.target.value = ''; // 같은 파일 다시 선택 가능하도록
  };

  // 상태 관리
  const [targetValues, setTargetValues] = useState({
    critRate: 50,
    atkSpeed: 40,
    evasion: 40,
    dmgReduce: 0,
    lifesteal: 40,
    moveSpeed: 0
  });

  const [items, setItems] = useState(() => loadFromStorage());
  const [useActualValues, setUseActualValues] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false); // 테스트 모드 (로컬스토리지 저장 안함)
  const [showResults, setShowResults] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(true);
  
  const [newItem, setNewItem] = useState({
    tier: '태초',
    itemType: '무기',
    options: {}
  });
  
  const [editingItemId, setEditingItemId] = useState(null);
  
  // 추천 모드 상태
  const [selectedRace, setSelectedRace] = useState(null); // 'demon', 'boss', 'primate'
  const [includeCritDmg, setIncludeCritDmg] = useState(false);
  const [includeTotalAtk, setIncludeTotalAtk] = useState(false);
  const [raceResults, setRaceResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // M작 시뮬레이션 상태
  const [mCraftSimulation, setMCraftSimulation] = useState({}); // { itemId: true/false }

  useEffect(() => {
    if (useActualValues && !isTestMode) {
      saveToStorage(items);
    }
  }, [items, useActualValues, isTestMode]);

  // 새 장비 옵션 토글
  const toggleNewItemOption = (optionId) => {
    setNewItem(prev => {
      const newOptions = { ...prev.options };
      if (newOptions[optionId] !== undefined) {
        delete newOptions[optionId];
      } else {
        const option = allOptionTypes.find(o => o.id === optionId);
        const maxValue = tierMaxValues[prev.tier][option.group];
        newOptions[optionId] = useActualValues ? 0 : maxValue;
      }
      return { ...prev, options: newOptions };
    });
  };

  const updateNewItemOptionValue = (optionId, value) => {
    const option = allOptionTypes.find(o => o.id === optionId);
    const maxValue = tierMaxValues[newItem.tier][option.group];
    const numValue = parseInt(value) || 0;
    setNewItem(prev => ({
      ...prev,
      options: { ...prev.options, [optionId]: Math.min(numValue, maxValue) }
    }));
  };

  const updateNewItemTier = (tier) => {
    setNewItem(prev => {
      const newOptions = {};
      Object.keys(prev.options).forEach(optionId => {
        const option = allOptionTypes.find(o => o.id === optionId);
        const maxValue = tierMaxValues[tier][option.group];
        if (!useActualValues) {
          newOptions[optionId] = maxValue;
        } else {
          newOptions[optionId] = Math.min(prev.options[optionId], maxValue);
        }
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
    setShowResults(false);
    setRaceResults(null);
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItem({
      tier: item.tier,
      itemType: item.itemType,
      options: { ...item.options }
    });
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
    setShowResults(false);
    setRaceResults(null);
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setNewItem({ tier: '태초', itemType: '무기', options: {} });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setShowResults(false);
    setRaceResults(null);
  };

  const clearAllItems = () => {
    if (window.confirm('모든 장비를 삭제하시겠습니까?')) {
      setItems([]);
      setShowResults(false);
      setRaceResults(null);
    }
  };

  const updateTargetValue = (optionId, value) => {
    const numValue = parseInt(value) || 0;
    setTargetValues(prev => ({
      ...prev,
      [optionId]: Math.min(numValue, 100)
    }));
    setShowResults(false);
    setRaceResults(null);
  };

  // 목표 달성 가능 여부 체크 (룬 포함)
  const checkTargetAchievable = useCallback((combination) => {
    let totalShortage = 0;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        const achieved = combination.reduce((sum, item) => 
          sum + (item.options[option.id] || 0), 0);
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          totalShortage += Math.max(0, diff - runeMax);
        }
      }
    });
    
    return totalShortage === 0;
  }, [targetValues]);

  // 조합 점수 계산 (목표 달성 최우선 > 종족 > 치피 > 전공)
  const calculateCombinationScore = useCallback((combination, raceId, withCritDmg, withTotalAtk) => {
    let raceTotal = 0;
    let critDmgTotal = 0;
    let totalAtkTotal = 0;
    let comboBonus = 0;
    
    // 기본 옵션 합계 계산
    const baseTotals = {};
    baseOptionTypes.forEach(opt => {
      baseTotals[opt.id] = 0;
    });
    
    combination.forEach(item => {
      const race = item.options[raceId] || 0;
      const crit = item.options.critDmg || 0;
      const atk = item.options.totalAtk || 0;
      
      raceTotal += race;
      critDmgTotal += crit;
      totalAtkTotal += atk;
      
      // 기본 옵션 합계
      baseOptionTypes.forEach(opt => {
        baseTotals[opt.id] += item.options[opt.id] || 0;
      });
      
      // 복합 옵션 보너스 (같은 아이템에 딜러옵션이 여러 개 붙어있으면 가산점)
      if (withCritDmg && withTotalAtk) {
        if (race > 0 && crit > 0 && atk > 0) {
          comboBonus += 500;
        } else if (race > 0 && crit > 0) {
          comboBonus += 200;
        } else if (race > 0 && atk > 0) {
          comboBonus += 100;
        }
      } else if (withCritDmg) {
        if (race > 0 && crit > 0) {
          comboBonus += 300;
        }
      } else if (withTotalAtk) {
        if (race > 0 && atk > 0) {
          comboBonus += 200;
        }
      }
    });
    
    // 목표 달성도 계산 (룬 포함)
    let totalShortage = 0;
    let totalExcess = 0;
    let targetsFullyMet = true;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        const achieved = baseTotals[option.id];
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          const shortage = Math.max(0, diff - runeMax);
          totalShortage += shortage;
          if (shortage > 0) {
            targetsFullyMet = false;
          }
        } else if (diff < 0) {
          // 초과분 (낭비)
          totalExcess += Math.abs(diff);
        }
      }
    });
    
    // 점수 계산: 목표 달성 최우선
    // 1. 목표 미달성 시 큰 페널티 (부족분 * -10000)
    // 2. 목표 달성 시 딜러 옵션 점수
    // 3. 초과분은 작은 페널티 (낭비 최소화)
    
    let score = 0;
    
    if (!targetsFullyMet) {
      // 목표 미달성: 부족분에 따른 페널티 + 딜러옵션 일부 반영
      score = -totalShortage * 10000;
      score += raceTotal * 12;
      if (withCritDmg) score += critDmgTotal * 10;
      if (withTotalAtk) score += totalAtkTotal * 5;
    } else {
      // 목표 달성: 딜러 옵션 최대화
      score = 1000000; // 기본 달성 보너스
      score += raceTotal * 120;
      if (withCritDmg) score += critDmgTotal * 100;
      if (withTotalAtk) score += totalAtkTotal * 50;
      score += comboBonus;
      // 초과분 페널티 (낭비 최소화, 작은 가중치)
      score -= totalExcess * 5;
    }
    
    return { score, raceTotal, critDmgTotal, totalAtkTotal, targetsFullyMet, totalShortage };
  }, [targetValues]);

  // 아이템 사전 필터링 및 정렬 (최적화 핵심)
  const getFilteredItemsByType = useCallback((raceId, withCritDmg, withTotalAtk) => {
    const itemsByType = {};
    
    items.forEach(item => {
      if (!itemsByType[item.itemType]) {
        itemsByType[item.itemType] = [];
      }
      itemsByType[item.itemType].push(item);
    });

    // 각 타입별로 상위 아이템만 선택 (최적화)
    const MAX_PER_TYPE = 15;
    
    // 목표 수치가 설정된 옵션 목록
    const targetOptions = baseOptionTypes.filter(opt => targetValues[opt.id] > 0);
    
    Object.keys(itemsByType).forEach(type => {
      // 복합 점수 기반 정렬
      itemsByType[type].sort((a, b) => {
        const aRace = a.options[raceId] || 0;
        const bRace = b.options[raceId] || 0;
        const aCrit = a.options.critDmg || 0;
        const bCrit = b.options.critDmg || 0;
        const aAtk = a.options.totalAtk || 0;
        const bAtk = b.options.totalAtk || 0;
        
        // 목표 옵션 기여도 계산
        const aTargetContrib = targetOptions.reduce((sum, opt) => 
          sum + (a.options[opt.id] || 0), 0);
        const bTargetContrib = targetOptions.reduce((sum, opt) => 
          sum + (b.options[opt.id] || 0), 0);
        
        // 딜러 옵션 조합 등급 (높을수록 좋음)
        const getComboTier = (race, crit, atk) => {
          if (withCritDmg && withTotalAtk) {
            if (race > 0 && crit > 0 && atk > 0) return 5;
            if (race > 0 && crit > 0) return 4;
            if (race > 0 && atk > 0) return 3;
            if (crit > 0 && atk > 0) return 2;
            if (race > 0 || crit > 0 || atk > 0) return 1;
          } else if (withCritDmg) {
            if (race > 0 && crit > 0) return 5;
            if (race > 0) return 3;
            if (crit > 0) return 2;
          } else if (withTotalAtk) {
            if (race > 0 && atk > 0) return 5;
            if (race > 0) return 3;
            if (atk > 0) return 2;
          } else {
            if (race > 0) return 5;
          }
          return 0;
        };
        
        const aTier = getComboTier(aRace, aCrit, aAtk);
        const bTier = getComboTier(bRace, bCrit, bAtk);
        
        // 복합 점수: 딜러옵션 + 목표기여도
        let aScore = aRace * 120 + aTargetContrib * 50;
        let bScore = bRace * 120 + bTargetContrib * 50;
        
        if (withCritDmg) {
          aScore += aCrit * 100;
          bScore += bCrit * 100;
        }
        
        if (withTotalAtk) {
          aScore += aAtk * 50;
          bScore += bAtk * 50;
        }
        
        // 1순위: 복합 점수 (딜러 + 목표기여)
        if (bScore !== aScore) return bScore - aScore;
        
        // 2순위: 딜러 옵션 조합 등급
        if (bTier !== aTier) return bTier - aTier;
        
        // 3순위: 목표 옵션 기여도
        return bTargetContrib - aTargetContrib;
      });
      
      itemsByType[type] = itemsByType[type].slice(0, MAX_PER_TYPE);
    });
    
    return itemsByType;
  }, [items, targetValues]);

  // 종족별 최적 조합 찾기 (최적화된 버전)
  const findBestRaceCombination = useCallback((raceId, withCritDmg, withTotalAtk) => {
    if (items.length === 0) return null;
    
    const itemsByType = getFilteredItemsByType(raceId, withCritDmg, withTotalAtk);
    const typesList = Object.keys(itemsByType);
    
    if (typesList.length === 0) return null;

    let bestCombination = null;
    let bestScore = -Infinity;
    let bestRaceTotal = 0;
    let bestCritDmgTotal = 0;
    let bestTotalAtkTotal = 0;
    let combinationsChecked = 0;
    const MAX_COMBINATIONS = 150000;

    // 반복적 조합 생성 (스택 기반)
    const stack = [{ index: 0, current: [] }];
    
    while (stack.length > 0 && combinationsChecked < MAX_COMBINATIONS) {
      const { index, current } = stack.pop();
      
      if (index === typesList.length) {
        combinationsChecked++;
        const result = calculateCombinationScore(current, raceId, withCritDmg, withTotalAtk);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestCombination = [...current];
          bestRaceTotal = result.raceTotal;
          bestCritDmgTotal = result.critDmgTotal;
          bestTotalAtkTotal = result.totalAtkTotal;
        }
        continue;
      }
      
      const currentType = typesList[index];
      const itemsOfType = itemsByType[currentType];
      
      for (let i = itemsOfType.length - 1; i >= 0; i--) {
        stack.push({
          index: index + 1,
          current: [...current, itemsOfType[i]]
        });
      }
    }

    if (!bestCombination) return null;

    // 결과 계산
    const totals = {};
    allOptionTypes.forEach(option => {
      totals[option.id] = bestCombination.reduce((sum, item) => 
        sum + (item.options[option.id] || 0), 0);
    });

    // 룬 정보 계산
    const runeInfo = {};
    let totalShortage = 0;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        const achieved = totals[option.id];
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          const runeNeeded = Math.min(diff, runeMax);
          const shortage = Math.max(0, diff - runeMax);
          runeInfo[option.id] = { needed: runeNeeded, shortage };
          totalShortage += shortage;
        } else if (diff < 0) {
          runeInfo[option.id] = { needed: 0, shortage: 0, excess: Math.abs(diff) };
        } else {
          runeInfo[option.id] = { needed: 0, shortage: 0 };
        }
      }
    });

    return {
      items: bestCombination,
      totals,
      runeInfo,
      raceTotal: totals[raceId] || 0,
      critDmgTotal: totals.critDmg || 0,
      totalAtkTotal: totals.totalAtk || 0,
      totalShortage,
      allTargetsMet: totalShortage === 0,
      combinationsChecked
    };
  }, [items, getFilteredItemsByType, calculateCombinationScore, targetValues]);

  // 종족 버튼 클릭 핸들러
  const handleRaceSelect = useCallback(async (raceId) => {
    if (items.length === 0) {
      alert('장비를 먼저 추가해주세요.');
      return;
    }

    setIsCalculating(true);
    setSelectedRace(raceId);
    setShowResults(false);
    setMCraftSimulation({}); // M작 시뮬레이션 초기화

    // UI 업데이트를 위한 짧은 딜레이
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = findBestRaceCombination(raceId, includeCritDmg, includeTotalAtk);
    setRaceResults(result);
    setIsCalculating(false);
  }, [items, includeCritDmg, includeTotalAtk, findBestRaceCombination]);

  // 옵션 토글 시 재계산
  useEffect(() => {
    if (selectedRace && !isCalculating) {
      handleRaceSelect(selectedRace);
    }
  }, [includeCritDmg, includeTotalAtk]);

  // M작 추천
  const getMCraftSuggestions = useCallback((result) => {
    if (!useActualValues || result.allTargetsMet) return null;
    
    const mCraftableItems = [];
    
    result.items.forEach(item => {
      const itemOptions = Object.keys(item.options);
      if (itemOptions.length === 0) return;
      
      const increases = {};
      let hasIncrease = false;
      
      itemOptions.forEach(optionId => {
        const option = allOptionTypes.find(o => o.id === optionId);
        if (!option) return;
        const tierMax = tierMaxValues[item.tier][option.group];
        const increase = tierMax - item.options[optionId];
        if (increase > 0) {
          increases[optionId] = increase;
          hasIncrease = true;
        }
      });
      
      if (hasIncrease) {
        mCraftableItems.push({ item, increases });
      }
    });
    
    if (mCraftableItems.length === 0) return null;
    
    // 조합 생성 (최대 3개)
    const combos = [];
    for (let size = 1; size <= Math.min(3, mCraftableItems.length); size++) {
      const generate = (start, current) => {
        if (current.length === size) {
          combos.push([...current]);
          return;
        }
        for (let i = start; i < mCraftableItems.length; i++) {
          current.push(mCraftableItems[i]);
          generate(i + 1, current);
          current.pop();
        }
      };
      generate(0, []);
    }
    
    const comboResults = combos.map(mCraftCombo => {
      const totalIncreases = {};
      mCraftCombo.forEach(mc => {
        Object.entries(mc.increases).forEach(([optionId, increase]) => {
          totalIncreases[optionId] = (totalIncreases[optionId] || 0) + increase;
        });
      });
      
      let resolvedCount = 0;
      const optionResults = [];
      
      baseOptionTypes.forEach(option => {
        const target = targetValues[option.id];
        if (target === 0) return;
        
        const currentTotal = result.totals[option.id];
        const runeInfo = result.runeInfo[option.id];
        const beforeShortage = runeInfo?.shortage || 0;
        
        if (beforeShortage === 0) return;
        
        const increase = totalIncreases[option.id] || 0;
        const afterTotal = currentTotal + increase;
        const runeMax = runeMaxValues[option.id] || 0;
        const withRune = afterTotal + runeMax;
        const afterShortage = Math.max(0, target - withRune);
        
        optionResults.push({
          optionId: option.id,
          optionName: option.name,
          beforeTotal: currentTotal,
          afterTotal,
          increase,
          beforeShortage,
          afterShortage,
          resolved: beforeShortage > 0 && afterShortage === 0
        });
        
        if (beforeShortage > 0 && afterShortage === 0) resolvedCount++;
      });
      
      const totalShortage = optionResults.reduce((sum, r) => sum + r.afterShortage, 0);
      
      return {
        mCraftItems: mCraftCombo.map(mc => mc.item),
        mCraftCount: mCraftCombo.length,
        resolvedCount,
        totalShortage,
        optionResults: optionResults.filter(r => r.beforeShortage > 0),
        allResolved: totalShortage === 0 && optionResults.some(r => r.beforeShortage > 0)
      };
    });
    
    comboResults.sort((a, b) => {
      if (a.mCraftCount !== b.mCraftCount) return a.mCraftCount - b.mCraftCount;
      if (a.allResolved !== b.allResolved) return b.allResolved - a.allResolved;
      if (b.resolvedCount !== a.resolvedCount) return b.resolvedCount - a.resolvedCount;
      return a.totalShortage - b.totalShortage;
    });
    
    return comboResults.slice(0, 5);
  }, [useActualValues, targetValues]);

  const raceNames = { demon: '악마', boss: '보스', primate: '영장' };

  // M작 시뮬레이션 토글
  const toggleMCraftSimulation = (itemId) => {
    setMCraftSimulation(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 전체 M작 적용/해제
  const toggleAllMCraft = (items, apply) => {
    const newSimulation = {};
    items.forEach(item => {
      newSimulation[item.id] = apply;
    });
    setMCraftSimulation(newSimulation);
  };

  // M작 적용된 수치 계산
  const getSimulatedTotals = useCallback((result) => {
    if (!result) return null;
    
    const hasMCraft = Object.values(mCraftSimulation).some(v => v);
    
    // M작 시뮬레이션이 없으면 원본 결과 반환
    if (!hasMCraft) {
      return {
        totals: result.totals,
        runeInfo: result.runeInfo,
        totalShortage: result.totalShortage,
        allTargetsMet: result.allTargetsMet,
        raceTotal: result.raceTotal,
        critDmgTotal: result.critDmgTotal,
        totalAtkTotal: result.totalAtkTotal
      };
    }
    
    const simulatedTotals = {};
    
    allOptionTypes.forEach(option => {
      let total = 0;
      result.items.forEach(item => {
        const baseValue = item.options[option.id] || 0;
        if (baseValue > 0 && mCraftSimulation[item.id]) {
          // M작 적용: 해당 단계의 최대값으로
          const opt = allOptionTypes.find(o => o.id === option.id);
          const maxValue = tierMaxValues[item.tier][opt.group];
          total += maxValue;
        } else {
          total += baseValue;
        }
      });
      simulatedTotals[option.id] = total;
    });
    
    // 룬 정보 재계산
    const simulatedRuneInfo = {};
    let simulatedShortage = 0;
    
    baseOptionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        const achieved = simulatedTotals[option.id];
        const diff = target - achieved;
        if (diff > 0) {
          const runeMax = runeMaxValues[option.id] || 0;
          const runeNeeded = Math.min(diff, runeMax);
          const shortage = Math.max(0, diff - runeMax);
          simulatedRuneInfo[option.id] = { needed: runeNeeded, shortage };
          simulatedShortage += shortage;
        } else if (diff < 0) {
          simulatedRuneInfo[option.id] = { needed: 0, shortage: 0, excess: Math.abs(diff) };
        } else {
          simulatedRuneInfo[option.id] = { needed: 0, shortage: 0 };
        }
      }
    });
    
    return {
      totals: simulatedTotals,
      runeInfo: simulatedRuneInfo,
      totalShortage: simulatedShortage,
      allTargetsMet: simulatedShortage === 0,
      raceTotal: simulatedTotals[selectedRace] || 0,
      critDmgTotal: simulatedTotals.critDmg || 0,
      totalAtkTotal: simulatedTotals.totalAtk || 0
    };
  }, [mCraftSimulation, targetValues, selectedRace]);

  // M작 적용 개수
  const mCraftCount = Object.values(mCraftSimulation).filter(v => v).length;

  return (
    <div className="eq-calc-container">
      <style>{`
        @import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css);
        * { font-family: 'Spoqa Han Sans Neo', 'sans-serif'; }

        .eq-calc-container {
          min-height: 100vh;
          background: #ffffff;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          box-sizing: border-box;
          color: #37352f;
        }
        .eq-calc-container * { box-sizing: border-box; }
        .wrapper { max-width: 900px; margin: 0 auto; }
        .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e9e9e7; }
        .title { font-size: 20px; font-weight: 600; color: #37352f; margin: 0 0 4px 0; }
        .subtitle { color: #9b9a97; font-size: 13px; margin: 0; }
        .section { background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; padding: 16px; margin-bottom: 12px; }
        .section-title { font-size: 14px; font-weight: 600; color: #37352f; margin: 0 0 12px 0; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
        .input-box { background: #f7f6f3; border-radius: 3px; padding: 8px 10px; }
        .label { display: block; color: #9b9a97; font-size: 11px; margin-bottom: 4px; }
        .input { width: 100%; padding: 6px 8px; background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; color: #37352f; font-size: 13px; outline: none; }
        .input:focus { border-color: #37352f; }
        .select { padding: 6px 8px; background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; color: #37352f; font-size: 13px; outline: none; cursor: pointer; width: 100%; }
        .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn { flex: 1; min-width: 100px; padding: 8px 12px; border-radius: 3px; font-weight: 500; border: 1px solid #e9e9e7; cursor: pointer; transition: all 0.15s; font-size: 13px; background: #ffffff; color: #37352f; }
        .btn:hover { background: #f7f6f3; }
        .btn-active { background: #37352f; color: #ffffff; border-color: #37352f; }
        .btn-active:hover { background: #2f2d2a; }
        .btn-primary { background: #37352f; color: #ffffff; border-color: #37352f; }
        .btn-primary:hover { background: #2f2d2a; }
        .btn-sm { min-width: 60px; padding: 6px 10px; font-size: 12px; }
        .hint { color: #9b9a97; font-size: 12px; margin-top: 8px; }
        .form-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .form-row > * { flex: 1; min-width: 100px; }
        .option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px; margin-bottom: 12px; }
        .option-btn { padding: 8px 10px; border-radius: 3px; text-align: left; cursor: pointer; transition: all 0.15s; border: 1px solid #e9e9e7; width: 100%; background: #ffffff; }
        .option-btn:hover { background: #f7f6f3; }
        .option-selected { background: #f7f6f3; border-color: #37352f; }
        .option-name { color: #37352f; font-size: 12px; font-weight: 500; }
        .option-input { width: 100%; padding: 4px 6px; background: #ffffff; border: 1px solid #e9e9e7; border-radius: 3px; color: #37352f; font-size: 12px; outline: none; margin-top: 4px; }
        .option-max { color: #9b9a97; font-size: 11px; margin-top: 4px; }
        .action-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .action-row .btn { flex: 1; min-width: 80px; }
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .list-header-left { display: flex; align-items: center; gap: 8px; }
        .list-header-right { display: flex; gap: 6px; }
        .toggle-btn { background: #ffffff; color: #37352f; padding: 4px 10px; border-radius: 3px; border: 1px solid #e9e9e7; cursor: pointer; font-size: 12px; }
        .toggle-btn:hover { background: #f7f6f3; }
        .clear-btn { background: #ffffff; color: #9b9a97; padding: 4px 10px; border-radius: 3px; border: 1px solid #e9e9e7; cursor: pointer; font-size: 12px; }
        .clear-btn:hover { background: #f7f6f3; color: #37352f; }
        .item-count { color: #9b9a97; font-size: 13px; }
        .card-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
        .item-card { background: #f7f6f3; border-radius: 3px; padding: 10px 12px; border: 1px solid #e9e9e7; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .card-title { display: flex; align-items: center; gap: 6px; }
        .tier-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 500; background: #e9e9e7; color: #37352f; }
        .item-type { color: #37352f; font-weight: 500; font-size: 13px; }
        .card-actions { display: flex; gap: 4px; }
        .card-btn { padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; border: 1px solid #e9e9e7; background: #ffffff; color: #9b9a97; }
        .card-btn:hover { background: #f7f6f3; color: #37352f; }
        .card-options { display: flex; flex-wrap: wrap; gap: 4px; }
        .option-tag { background: #ffffff; color: #37352f; padding: 2px 6px; border-radius: 3px; font-size: 11px; border: 1px solid #e9e9e7; }
        .option-tag.bonus { background: #37352f; color: #ffffff; }
        .empty-state { text-align: center; padding: 24px 16px; color: #9b9a97; }
        .race-btn-group { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .race-btn { flex: 1; min-width: 80px; padding: 10px 16px; border-radius: 3px; font-weight: 500; border: 1px solid #e9e9e7; cursor: pointer; font-size: 13px; background: #ffffff; color: #37352f; transition: all 0.15s; }
        .race-btn:hover { background: #f7f6f3; }
        .race-btn.active { background: #37352f; color: #ffffff; border-color: #37352f; }
        .race-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .crit-toggle { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7f6f3; border-radius: 3px; margin-bottom: 12px; }
        .crit-toggle-label { font-size: 13px; color: #37352f; }
        .crit-toggle-btn { padding: 4px 12px; border-radius: 3px; font-size: 12px; border: 1px solid #e9e9e7; cursor: pointer; background: #ffffff; color: #9b9a97; }
        .crit-toggle-btn.active { background: #37352f; color: #ffffff; border-color: #37352f; }
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
        .sub-title { color: #9b9a97; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .selected-items { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .selected-item { background: #ffffff; padding: 6px 10px; border-radius: 3px; font-size: 12px; color: #37352f; border: 1px solid #e9e9e7; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
        .selected-item-name { font-weight: 500; }
        .selected-item-options { font-size: 11px; color: #9b9a97; }
        .achievement-item { background: #ffffff; border-radius: 3px; padding: 10px; margin-bottom: 6px; border: 1px solid #e9e9e7; }
        .achievement-title { color: #37352f; font-weight: 500; font-size: 12px; margin-bottom: 4px; }
        .achievement-detail { color: #9b9a97; font-size: 11px; margin-bottom: 2px; }
        .text-success { color: #37352f; font-weight: 500; }
        .text-warning { color: #9b9a97; }
        .text-error { color: #37352f; text-decoration: underline; }
        .mcraft-section { margin-top: 14px; padding: 12px; background: #ffffff; border-radius: 3px; border: 1px solid #e9e9e7; }
        .mcraft-title { color: #37352f; font-size: 12px; font-weight: 500; margin-bottom: 10px; }
        .mcraft-item { background: #f7f6f3; padding: 10px; border-radius: 3px; margin-bottom: 8px; border: 1px solid #e9e9e7; }
        .mcraft-item.resolved { border-color: #37352f; }
        .mcraft-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
        .mcraft-badge { color: #37352f; font-size: 12px; font-weight: 500; }
        .mcraft-status { font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 500; background: #e9e9e7; color: #37352f; }
        .mcraft-target { background: #ffffff; padding: 6px 8px; border-radius: 3px; margin-bottom: 4px; border: 1px solid #e9e9e7; }
        .mcraft-target-name { color: #37352f; font-size: 11px; font-weight: 500; }
        .mcraft-target-current { color: #9b9a97; font-size: 10px; margin-top: 2px; }
        .mcraft-effect { color: #9b9a97; font-size: 11px; padding-left: 8px; margin-bottom: 2px; }
        .mcraft-effect.resolved { color: #37352f; font-weight: 500; }
        .mcraft-tip { margin-top: 8px; padding: 6px 8px; background: #f7f6f3; border-radius: 3px; }
        .mcraft-tip-text { color: #9b9a97; font-size: 11px; }
        .summary-box { margin-top: 12px; padding: 10px; border-radius: 3px; background: #ffffff; border: 1px solid #e9e9e7; }
        .summary-box.success { border-color: #37352f; }
        .summary-title { font-size: 12px; font-weight: 500; color: #37352f; }
        .summary-detail { font-size: 11px; margin-top: 4px; color: #9b9a97; }
        .loading { text-align: center; padding: 20px; color: #9b9a97; }
        .option-section-title { font-size: 11px; color: #9b9a97; margin: 12px 0 8px 0; padding-top: 8px; border-top: 1px solid #e9e9e7; }
        
        /* 테스트 모드 컨트롤 */
        .test-mode-control { display: flex; gap: 8px; align-items: center; margin-top: 12px; padding: 10px 12px; background: #f7f6f3; border-radius: 3px; flex-wrap: wrap; }
        .test-mode-label { font-size: 12px; color: #9b9a97; }
        
        /* 엑셀 컨트롤 */
        .excel-control { display: flex; gap: 8px; align-items: center; margin-top: 12px; padding: 10px 12px; background: #f7f6f3; border-radius: 3px; flex-wrap: wrap; }
        .excel-label { font-size: 12px; color: #9b9a97; }
        .excel-upload-btn { cursor: pointer; text-align: center; }
        .excel-hint { font-size: 11px; color: #9b9a97; margin-left: 8px; }
        
        /* M작 시뮬레이션 스타일 */
        .mcraft-control { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f7f6f3; border-radius: 3px; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
        .mcraft-control-label { font-size: 13px; font-weight: 500; color: #37352f; }
        .mcraft-control-btns { display: flex; gap: 6px; align-items: center; }
        .mcraft-count { font-size: 12px; color: #37352f; font-weight: 500; background: #e9e9e7; padding: 2px 8px; border-radius: 3px; }
        
        .selected-item.clickable { cursor: pointer; transition: all 0.15s; }
        .selected-item.clickable:hover { background: #f7f6f3; border-color: #37352f; }
        .selected-item.mcrafted { background: #37352f; border-color: #37352f; }
        .selected-item.mcrafted .selected-item-name { color: #ffffff; }
        .selected-item.mcrafted .selected-item-options { color: #d4d4d4; }
        .selected-item.maxed { opacity: 0.6; cursor: default; }
        .selected-item-left { display: flex; align-items: center; gap: 6px; }
        .mcraft-badge-small { font-size: 10px; background: #ffffff; color: #37352f; padding: 1px 5px; border-radius: 3px; font-weight: 500; }
        .maxed-badge { font-size: 10px; background: #e9e9e7; color: #9b9a97; padding: 1px 5px; border-radius: 3px; font-weight: 500; }
        
        .value-before { color: #9b9a97; text-decoration: line-through; font-size: 14px; }
        .value-arrow { color: #9b9a97; margin: 0 4px; }
        .value-after { color: #37352f; font-weight: 600; }
        
        .strikethrough { text-decoration: line-through; color: #9b9a97; }
        .mcraft-value { font-weight: 600; color: #fff; }
        .option-with-mcraft { white-space: nowrap; }
        
        .sim-label { font-size: 10px; color: #37352f; background: #e9e9e7; padding: 1px 5px; border-radius: 3px; margin-left: 4px; }
        .achievement-item.improved { background: #f7f6f3; border-color: #37352f; }
        .improve-diff { color: #37352f; font-weight: 500; }
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
          .card-list { grid-template-columns: 1fr; }
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

        {/* 목표 수치 설정 */}
        <div className="section">
          <h2 className="section-title">목표 수치</h2>
          <div className="grid-3">
            {baseOptionTypes.map(option => (
              <div key={option.id} className="input-box">
                <label className="label">{option.name}</label>
                <input
                  type="number"
                  min="0"
                  max={option.max}
                  value={targetValues[option.id] === 0 ? '' : targetValues[option.id]}
                  onChange={(e) => updateTargetValue(option.id, e.target.value)}
                  className="input"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 계산 모드 */}
        <div className="section">
          <h2 className="section-title">계산 모드</h2>
          <div className="btn-group">
            <button
              onClick={() => {
                setUseActualValues(false);
                setIsTestMode(false);
                setItems([]);
                setEditingItemId(null);
                setNewItem({ tier: '태초', itemType: '무기', options: {} });
                setRaceResults(null);
              }}
              className={`btn ${!useActualValues && !isTestMode ? 'btn-active' : ''}`}
            >
              최대값 기준
            </button>
            <button
              onClick={() => {
                setUseActualValues(true);
                setIsTestMode(false);
                setItems(loadFromStorage());
                setEditingItemId(null);
                setNewItem({ tier: '태초', itemType: '무기', options: {} });
                setRaceResults(null);
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
                setEditingItemId(null);
                setNewItem({ tier: '태초', itemType: '무기', options: {} });
                setRaceResults(null);
                setShowResults(false);
              }}
              className={`btn ${isTestMode ? 'btn-active' : ''}`}
            >
              테스트 모드
            </button>
          </div>
          
          {/* 테스트 모드 컨트롤 */}
          {isTestMode && (
            <div className="test-mode-control">
              <span className="test-mode-label">더미 데이터 생성:</span>
              <button onClick={() => setItems(generateDummyData(50))} className="btn btn-sm">50개</button>
              <button onClick={() => setItems(generateDummyData(100))} className="btn btn-sm">100개</button>
              <button onClick={() => setItems(generateDummyData(250))} className="btn btn-sm">250개</button>
            </div>
          )}
          
          {/* 엑셀 입출력 - 실제 수치 입력 모드에서만 */}
          {useActualValues && !isTestMode && (
            <div className="excel-control">
              <span className="excel-label">엑셀 입출력:</span>
              <label className="btn btn-sm excel-upload-btn">
                업로드
                <input 
                  type="file" 
                  accept=".csv,.txt"
                  onChange={handleExcelUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button onClick={downloadExcel} className="btn btn-sm">다운로드</button>
              <span className="excel-hint">CSV 형식 (UTF-8)</span>
            </div>
          )}
          
          <p className="hint">
            {isTestMode 
              ? '테스트 모드: 더미 데이터로 테스트합니다.'
              : useActualValues 
                ? '실제 장비 옵션 수치를 입력합니다. 데이터가 자동 저장됩니다.' 
                : '각 단계별 최대 수치를 기준으로 계산합니다.'}
          </p>
        </div>

        {/* 장비 입력 폼 */}
        <div className="section">
          <h2 className="section-title">
            {editingItemId ? '장비 수정' : '장비 추가'}
          </h2>
          
          <div className="form-row">
            <div>
              <label className="label">장비 종류</label>
              <select
                value={newItem.itemType}
                onChange={(e) => setNewItem(prev => ({ ...prev, itemType: e.target.value }))}
                className="select"
              >
                {itemTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">단계</label>
              <select
                value={newItem.tier}
                onChange={(e) => updateNewItemTier(e.target.value)}
                className="select"
              >
                <option value="태초">태초</option>
                <option value="혼돈">혼돈</option>
                <option value="심연">심연</option>
              </select>
            </div>
          </div>

          <label className="label">기본 옵션</label>
          <div className="option-grid">
            {baseOptionTypes.map(option => {
              const isSelected = newItem.options[option.id] !== undefined;
              const maxValue = tierMaxValues[newItem.tier][option.group];
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleNewItemOption(option.id)}
                  className={`option-btn ${isSelected ? 'option-selected' : ''}`}
                >
                  <div className="option-name">{option.name}</div>
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {useActualValues ? (
                        <input
                          type="number"
                          min="0"
                          max={maxValue}
                          value={newItem.options[option.id] === 0 ? '' : newItem.options[option.id]}
                          onChange={(e) => updateNewItemOptionValue(option.id, e.target.value)}
                          className="option-input"
                          placeholder="0"
                        />
                      ) : (
                        <div className="option-max">최대: {maxValue}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="option-section-title">추가 옵션 (종족/치피)</div>
          <div className="option-grid">
            {bonusOptionTypes.map(option => {
              const isSelected = newItem.options[option.id] !== undefined;
              const maxValue = tierMaxValues[newItem.tier][option.group];
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleNewItemOption(option.id)}
                  className={`option-btn ${isSelected ? 'option-selected' : ''}`}
                >
                  <div className="option-name">{option.name}</div>
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {useActualValues ? (
                        <input
                          type="number"
                          min="0"
                          max={maxValue}
                          value={newItem.options[option.id] === 0 ? '' : newItem.options[option.id]}
                          onChange={(e) => updateNewItemOptionValue(option.id, e.target.value)}
                          className="option-input"
                          placeholder="0"
                        />
                      ) : (
                        <div className="option-max">최대: {maxValue}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="action-row">
            {editingItemId ? (
              <>
                <button onClick={saveEditItem} className="btn btn-primary">수정 완료</button>
                <button onClick={cancelEditItem} className="btn">취소</button>
              </>
            ) : (
              <button onClick={addItem} className="btn btn-primary">추가</button>
            )}
          </div>
        </div>

        {/* 보유 장비 목록 */}
        <div className="section">
          <div className="list-header">
            <div className="list-header-left">
              <h2 className="section-title" style={{ margin: 0 }}>보유 장비</h2>
              <span className="item-count">({items.length})</span>
            </div>
            <div className="list-header-right">
              <button onClick={() => setIsListExpanded(!isListExpanded)} className="toggle-btn">
                {isListExpanded ? '접기' : '펼치기'}
              </button>
              {items.length > 0 && (
                <button onClick={clearAllItems} className="clear-btn">전체 삭제</button>
              )}
            </div>
          </div>

          {isListExpanded && (
            items.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '13px', margin: 0 }}>추가된 장비가 없습니다</p>
              </div>
            ) : (
              <div className="card-list">
                {items.map((item) => {
                  const baseOptions = Object.entries(item.options).filter(([id]) => 
                    baseOptionTypes.some(o => o.id === id));
                  const bonusOptions = Object.entries(item.options).filter(([id]) => 
                    bonusOptionTypes.some(o => o.id === id));
                  
                  return (
                    <div key={item.id} className="item-card">
                      <div className="card-header">
                        <div className="card-title">
                          <span className="tier-badge">{item.tier}</span>
                          <span className="item-type">{item.itemType}</span>
                        </div>
                        <div className="card-actions">
                          <button onClick={() => startEditItem(item)} className="card-btn">수정</button>
                          <button onClick={() => removeItem(item.id)} className="card-btn">삭제</button>
                        </div>
                      </div>
                      <div className="card-options">
                        {baseOptions.map(([optionId, value]) => {
                          const option = allOptionTypes.find(o => o.id === optionId);
                          return (
                            <span key={optionId} className="option-tag">
                              {option?.name}: {value}
                            </span>
                          );
                        })}
                        {bonusOptions.map(([optionId, value]) => {
                          const option = allOptionTypes.find(o => o.id === optionId);
                          return (
                            <span key={optionId} className="option-tag bonus">
                              {option?.name}: {value}
                            </span>
                          );
                        })}
                        {baseOptions.length === 0 && bonusOptions.length === 0 && (
                          <span style={{ color: '#9b9a97', fontSize: '11px' }}>옵션 없음</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* 장비 추천 */}
        <div className="section">
          <h2 className="section-title">장비 추천</h2>
          <p className="hint" style={{ marginTop: 0, marginBottom: '12px' }}>
            목표 수치를 달성하면서 선택한 종족 옵션이 최대가 되는 조합을 찾습니다.
          </p>
          
          <div className="crit-toggle">
            <span className="crit-toggle-label">치명타피해량:</span>
            <button 
              onClick={() => setIncludeCritDmg(!includeCritDmg)}
              className={`crit-toggle-btn ${includeCritDmg ? 'active' : ''}`}
            >
              {includeCritDmg ? 'ON' : 'OFF'}
            </button>
            <span className="crit-toggle-label" style={{ marginLeft: '12px' }}>전체공격력:</span>
            <button 
              onClick={() => setIncludeTotalAtk(!includeTotalAtk)}
              className={`crit-toggle-btn ${includeTotalAtk ? 'active' : ''}`}
            >
              {includeTotalAtk ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="race-btn-group">
            <button 
              onClick={() => handleRaceSelect('demon')}
              className={`race-btn ${selectedRace === 'demon' ? 'active' : ''}`}
              disabled={isCalculating || items.length === 0}
            >
              악마
            </button>
            <button 
              onClick={() => handleRaceSelect('boss')}
              className={`race-btn ${selectedRace === 'boss' ? 'active' : ''}`}
              disabled={isCalculating || items.length === 0}
            >
              보스
            </button>
            <button 
              onClick={() => handleRaceSelect('primate')}
              className={`race-btn ${selectedRace === 'primate' ? 'active' : ''}`}
              disabled={isCalculating || items.length === 0}
            >
              영장
            </button>
          </div>

          {isCalculating && (
            <div className="loading">계산 중...</div>
          )}

          {raceResults && !isCalculating && (
            <div className="result-card">
              <div className="result-header">
                <span className="result-badge">{raceNames[selectedRace]} 최적 조합</span>
                {includeCritDmg && <span className="result-meta">+ 치피</span>}
                {includeTotalAtk && <span className="result-meta">+ 전공</span>}
              </div>

              {/* M작 시뮬레이션 컨트롤 */}
              <div className="mcraft-control">
                <span className="mcraft-control-label">M작 시뮬레이션</span>
                <div className="mcraft-control-btns">
                  <button 
                    onClick={() => toggleAllMCraft(raceResults.items, true)}
                    className="btn btn-sm"
                  >
                    전체 적용
                  </button>
                  <button 
                    onClick={() => toggleAllMCraft(raceResults.items, false)}
                    className="btn btn-sm"
                  >
                    전체 해제
                  </button>
                  {mCraftCount > 0 && (
                    <span className="mcraft-count">{mCraftCount}개 적용중</span>
                  )}
                </div>
              </div>

              {/* 시뮬레이션 결과 요약 */}
              {(() => {
                const simulated = getSimulatedTotals(raceResults);
                const hasSimulation = mCraftCount > 0;
                
                return (
                  <div className="result-highlight">
                    <div className="highlight-row">
                      <span className="highlight-label">{raceNames[selectedRace]} 합계</span>
                      <span className="highlight-value">
                        {hasSimulation ? (
                          <>
                            <span className="value-before">{raceResults.raceTotal}</span>
                            <span className="value-arrow">→</span>
                            <span className="value-after">{simulated.raceTotal}</span>
                          </>
                        ) : (
                          raceResults.raceTotal
                        )}
                      </span>
                    </div>
                    {includeCritDmg && (
                      <div className="highlight-row">
                        <span className="highlight-label">치명타피해량 합계</span>
                        <span className="highlight-value">
                          {hasSimulation ? (
                            <>
                              <span className="value-before">{raceResults.critDmgTotal}</span>
                              <span className="value-arrow">→</span>
                              <span className="value-after">{simulated.critDmgTotal}</span>
                            </>
                          ) : (
                            raceResults.critDmgTotal
                          )}
                        </span>
                      </div>
                    )}
                    {includeTotalAtk && (
                      <div className="highlight-row">
                        <span className="highlight-label">전체공격력 합계</span>
                        <span className="highlight-value">
                          {hasSimulation ? (
                            <>
                              <span className="value-before">{raceResults.totalAtkTotal}</span>
                              <span className="value-arrow">→</span>
                              <span className="value-after">{simulated.totalAtkTotal}</span>
                            </>
                          ) : (
                            raceResults.totalAtkTotal
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="sub-title">선택된 장비 (클릭하여 M작 시뮬레이션)</div>
              <div className="selected-items">
                {raceResults.items.map((item, idx) => {
                  const isMCrafted = mCraftSimulation[item.id];
                  const optionEntries = Object.entries(item.options);
                  
                  // 현재 수치와 M작 후 수치 계산
                  const optionsDisplay = optionEntries.map(([optionId, value]) => {
                    const option = allOptionTypes.find(o => o.id === optionId);
                    const maxValue = tierMaxValues[item.tier][option.group];
                    const canImprove = value < maxValue;
                    
                    if (isMCrafted && canImprove) {
                      return (
                        <span key={optionId} className="option-with-mcraft">
                          {option?.name}: <span className="strikethrough">{value}</span> → <span className="mcraft-value">{maxValue}</span>
                        </span>
                      );
                    }
                    return `${option?.name}:${value}`;
                  });
                  
                  // M작으로 개선 가능한지 확인
                  const canMCraft = optionEntries.some(([optionId, value]) => {
                    const option = allOptionTypes.find(o => o.id === optionId);
                    const maxValue = tierMaxValues[item.tier][option.group];
                    return value < maxValue;
                  });
                  
                  return (
                    <div 
                      key={idx} 
                      className={`selected-item clickable ${isMCrafted ? 'mcrafted' : ''} ${!canMCraft ? 'maxed' : ''}`}
                      onClick={() => canMCraft && toggleMCraftSimulation(item.id)}
                    >
                      <div className="selected-item-left">
                        <span className="selected-item-name">
                          {item.itemType} ({item.tier})
                        </span>
                        {isMCrafted && <span className="mcraft-badge-small">M작</span>}
                        {!canMCraft && <span className="maxed-badge">MAX</span>}
                      </div>
                      <span className="selected-item-options">
                        {optionsDisplay.map((opt, i) => (
                          <span key={i}>
                            {i > 0 && ' / '}
                            {typeof opt === 'string' ? opt : opt}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 목표 달성률 - 시뮬레이션 반영 */}
              {(() => {
                const simulated = getSimulatedTotals(raceResults);
                const hasSimulation = mCraftCount > 0;
                const displayTotals = hasSimulation ? simulated.totals : raceResults.totals;
                const displayRuneInfo = hasSimulation ? simulated.runeInfo : raceResults.runeInfo;
                
                return (
                  <>
                    <div className="sub-title">
                      목표 달성률 {hasSimulation && <span className="sim-label">(M작 시뮬레이션 적용)</span>}
                    </div>
                    {baseOptionTypes.map(option => {
                      const target = targetValues[option.id];
                      if (target === 0) return null;
                      
                      const achieved = displayTotals[option.id];
                      const rune = displayRuneInfo[option.id];
                      const withRune = achieved + (rune?.needed || 0);
                      const finalShortage = rune?.shortage || 0;
                      const excess = rune?.excess || 0;
                      
                      // 시뮬레이션 전후 비교
                      const originalAchieved = raceResults.totals[option.id];
                      const improved = hasSimulation && achieved > originalAchieved;
                      
                      return (
                        <div key={option.id} className={`achievement-item ${improved ? 'improved' : ''}`}>
                          <div className="achievement-title">{option.name}</div>
                          <div className="achievement-detail">
                            목표: {target} / 장비 합계: {achieved}
                            {improved && <span className="improve-diff"> (+{achieved - originalAchieved})</span>}
                          </div>
                          {rune && rune.needed > 0 && (
                            <div className="achievement-detail">룬 보완: {rune.needed}</div>
                          )}
                          {excess > 0 && (
                            <div className="achievement-detail text-warning">목표 초과: +{excess}</div>
                          )}
                          {finalShortage > 0 ? (
                            <div className="achievement-detail text-error">부족: {finalShortage}</div>
                          ) : excess === 0 && withRune >= target ? (
                            <div className="achievement-detail text-success">달성 (합계: {withRune})</div>
                          ) : null}
                        </div>
                      );
                    })}
                    
                    {/* 최종 요약 */}
                    {(hasSimulation ? simulated.totalShortage : raceResults.totalShortage) > 0 ? (
                      <div className="summary-box">
                        <div className="summary-title">일부 목표를 달성할 수 없습니다</div>
                        <div className="summary-detail">M작을 통해 부족분을 보완할 수 있습니다.</div>
                      </div>
                    ) : (
                      <div className="summary-box success">
                        <div className="summary-title">모든 목표 달성 가능</div>
                        <div className="summary-detail">
                          {raceNames[selectedRace]}: {hasSimulation ? simulated.raceTotal : raceResults.raceTotal}
                          {includeCritDmg && ` / 치피: ${hasSimulation ? simulated.critDmgTotal : raceResults.critDmgTotal}`}
                          {includeTotalAtk && ` / 전공: ${hasSimulation ? simulated.totalAtkTotal : raceResults.totalAtkTotal}`}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {!raceResults && !isCalculating && items.length > 0 && (
            <div className="empty-state">
              <p style={{ fontSize: '13px', margin: 0 }}>위 버튼을 클릭하여 종족별 최적 조합을 확인하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCalculator;