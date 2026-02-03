import React, { useState, useEffect } from 'react';

const EquipmentCalculator = () => {
  // 옵션 종류 정의
  const optionTypes = [
    { id: 'critRate', name: '치명타확률', group: 'A' },
    { id: 'atkSpeed', name: '공격속도', group: 'A' },
    { id: 'evasion', name: '회피율', group: 'A' },
    { id: 'dmgReduce', name: '받는 데미지 감소', group: 'B' },
    { id: 'lifesteal', name: '흡혈', group: 'B' },
    { id: 'moveSpeed', name: '이동속도', group: 'B' }
  ];

  // 단계별 최대 수치
  const tierMaxValues = {
    '태초': { A: 12, B: 17 },
    '혼돈': { A: 14, B: 19 },
    '심연': { A: 16, B: 21 }
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
  const STORAGE_KEY = 'equipment_calculator_items';

  // 로컬스토리지에서 데이터 로드
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return [];
  };

  // 로컬스토리지에 데이터 저장
  const saveToStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
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
  const [showResults, setShowResults] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(true);
  
  // 새 장비 입력 폼 상태
  const [newItem, setNewItem] = useState({
    tier: '태초',
    itemType: '무기',
    options: {}
  });
  
  // 편집 모드 상태
  const [editingItemId, setEditingItemId] = useState(null);

  // items 변경시 로컬스토리지 저장 (실제 수치 입력 모드일 때만)
  useEffect(() => {
    if (useActualValues) {
      saveToStorage(items);
    }
  }, [items, useActualValues]);

  // 새 장비 옵션 토글
  const toggleNewItemOption = (optionId) => {
    setNewItem(prev => {
      const newOptions = { ...prev.options };
      if (newOptions[optionId] !== undefined) {
        delete newOptions[optionId];
      } else {
        const option = optionTypes.find(o => o.id === optionId);
        const maxValue = tierMaxValues[prev.tier][option.group];
        newOptions[optionId] = useActualValues ? 0 : maxValue;
      }
      return { ...prev, options: newOptions };
    });
  };

  // 새 장비 옵션 수치 변경
  const updateNewItemOptionValue = (optionId, value) => {
    const option = optionTypes.find(o => o.id === optionId);
    const maxValue = tierMaxValues[newItem.tier][option.group];
    const numValue = parseInt(value) || 0;
    setNewItem(prev => ({
      ...prev,
      options: { ...prev.options, [optionId]: Math.min(numValue, maxValue) }
    }));
  };

  // 새 장비 단계 변경
  const updateNewItemTier = (tier) => {
    setNewItem(prev => {
      if (!useActualValues) {
        const newOptions = {};
        Object.keys(prev.options).forEach(optionId => {
          const option = optionTypes.find(o => o.id === optionId);
          newOptions[optionId] = tierMaxValues[tier][option.group];
        });
        return { ...prev, tier, options: newOptions };
      } else {
        const newOptions = {};
        Object.keys(prev.options).forEach(optionId => {
          const option = optionTypes.find(o => o.id === optionId);
          const maxValue = tierMaxValues[tier][option.group];
          newOptions[optionId] = Math.min(prev.options[optionId], maxValue);
        });
        return { ...prev, tier, options: newOptions };
      }
    });
  };

  // 장비 추가
  const addItem = () => {
    if (Object.keys(newItem.options).length === 0) {
      alert('최소 1개의 옵션을 선택해주세요.');
      return;
    }
    
    const itemToAdd = {
      ...newItem,
      id: Date.now()
    };
    
    setItems(prev => [...prev, itemToAdd]);
    setNewItem({
      tier: '태초',
      itemType: '무기',
      options: {}
    });
    setShowResults(false);
  };

  // 장비 수정 시작
  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItem({
      tier: item.tier,
      itemType: item.itemType,
      options: { ...item.options }
    });
  };

  // 장비 수정 완료
  const saveEditItem = () => {
    if (Object.keys(newItem.options).length === 0) {
      alert('최소 1개의 옵션을 선택해주세요.');
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.id === editingItemId 
        ? { ...newItem, id: editingItemId }
        : item
    ));
    setEditingItemId(null);
    setNewItem({
      tier: '태초',
      itemType: '무기',
      options: {}
    });
    setShowResults(false);
  };

  // 장비 수정 취소
  const cancelEditItem = () => {
    setEditingItemId(null);
    setNewItem({
      tier: '태초',
      itemType: '무기',
      options: {}
    });
  };

  // 아이템 삭제
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setShowResults(false);
  };

  // 전체 삭제
  const clearAllItems = () => {
    if (window.confirm('모든 장비를 삭제하시겠습니까?')) {
      setItems([]);
      setShowResults(false);
    }
  };

  // 목표 수치 변경
  const updateTargetValue = (optionId, value) => {
    const numValue = parseInt(value) || 0;
    setTargetValues(prev => ({
      ...prev,
      [optionId]: Math.min(numValue, 100)
    }));
    setShowResults(false);
  };

  // 계산하기 핸들러
  const handleCalculate = () => {
    if (items.length === 0) {
      alert('장비를 먼저 추가해주세요.');
      return;
    }
    
    const hasTarget = optionTypes.some(option => targetValues[option.id] > 0);
    if (!hasTarget) {
      alert('목표 수치를 설정해주세요.');
      return;
    }
    
    setShowResults(true);
  };

  // 최적 조합 찾기
  const findBestCombinations = () => {
    if (items.length === 0) return [];

    const itemsByType = {};
    items.forEach(item => {
      if (!itemsByType[item.itemType]) {
        itemsByType[item.itemType] = [];
      }
      itemsByType[item.itemType].push(item);
    });

    const MAX_ITEMS_PER_TYPE = 5;
    Object.keys(itemsByType).forEach(type => {
      itemsByType[type].sort((a, b) => {
        const aCount = Object.keys(a.options).length;
        const bCount = Object.keys(b.options).length;
        if (bCount !== aCount) return bCount - aCount;
        
        const aSum = Object.values(a.options).reduce((sum, val) => sum + val, 0);
        const bSum = Object.values(b.options).reduce((sum, val) => sum + val, 0);
        return bSum - aSum;
      });
      
      itemsByType[type] = itemsByType[type].slice(0, MAX_ITEMS_PER_TYPE);
    });

    const itemTypesList = Object.keys(itemsByType);
    
    const shortages = [];
    optionTypes.forEach(option => {
      const target = targetValues[option.id];
      if (target > 0) {
        shortages.push({
          optionId: option.id,
          optionName: option.name,
          target: target
        });
      }
    });

    if (shortages.length === 0) return [];

    const generateCombinations = (types, index = 0, current = []) => {
      if (index === types.length) {
        return [current];
      }

      const results = [];
      const currentType = types[index];
      const itemsOfType = itemsByType[currentType];

      for (const item of itemsOfType) {
        results.push(...generateCombinations(types, index + 1, [...current, item]));
      }

      return results;
    };

    const allCombinations = generateCombinations(itemTypesList);

    const scoredCombinations = allCombinations.map(combination => {
      const totals = {};
      let totalUsedOptions = 0;
      
      optionTypes.forEach(option => {
        totals[option.id] = combination.reduce((sum, item) => {
          return sum + (item.options[option.id] || 0);
        }, 0);
      });

      combination.forEach(item => {
        totalUsedOptions += Object.keys(item.options).length;
      });

      let runeInfo = {};
      let totalAccuracyScore = 0;
      let totalShortage = 0;
      let allTargetsMet = true;
      let usedRuneSlots = new Set();

      shortages.forEach(shortage => {
        const achieved = totals[shortage.optionId];
        const diff = shortage.target - achieved;
        const runeMax = runeMaxValues[shortage.optionId];
        
        if (diff > 0) {
          const runeNeeded = Math.min(diff, runeMax);
          const finalShortage = diff - runeNeeded;
          
          if (runeNeeded > 0) {
            usedRuneSlots.add(shortage.optionId);
          }
          
          runeInfo[shortage.optionId] = {
            needed: runeNeeded,
            shortage: finalShortage
          };
          
          totalShortage += finalShortage;
          
          if (finalShortage > 0) {
            allTargetsMet = false;
            totalAccuracyScore -= finalShortage * 2;
          } else {
            totalAccuracyScore += 100;
          }
        } else if (diff === 0) {
          totalAccuracyScore += 100;
          runeInfo[shortage.optionId] = { needed: 0, shortage: 0 };
        } else {
          const excess = Math.abs(diff);
          totalAccuracyScore += (80 - excess);
          runeInfo[shortage.optionId] = { needed: 0, shortage: 0, excess };
        }
      });

      const avgAccuracyScore = shortages.length > 0 ? totalAccuracyScore / shortages.length : 0;
      const maxPossibleOptions = combination.length * 4;
      const optionEfficiency = maxPossibleOptions > 0 
        ? (1 - (totalUsedOptions / maxPossibleOptions)) * 30
        : 0;
      const runeEfficiency = (optionTypes.length - usedRuneSlots.size) * 5;
      const finalScore = avgAccuracyScore + optionEfficiency + runeEfficiency;

      return {
        combination,
        totals,
        score: finalScore,
        avgAccuracyScore,
        optionEfficiency,
        runeEfficiency,
        totalShortage,
        runeInfo,
        itemCount: combination.length,
        usedOptionsCount: totalUsedOptions,
        usedRuneCount: usedRuneSlots.size,
        allTargetsMet
      };
    });

    scoredCombinations.sort((a, b) => {
      if (a.allTargetsMet !== b.allTargetsMet) {
        return b.allTargetsMet - a.allTargetsMet;
      }
      if (a.totalShortage !== b.totalShortage) {
        return a.totalShortage - b.totalShortage;
      }
      if (Math.abs(b.score - a.score) > 0.01) {
        return b.score - a.score;
      }
      if (a.usedRuneCount !== b.usedRuneCount) {
        return a.usedRuneCount - b.usedRuneCount;
      }
      if (a.usedOptionsCount !== b.usedOptionsCount) {
        return a.usedOptionsCount - b.usedOptionsCount;
      }
      return a.itemCount - b.itemCount;
    });

    const best3 = scoredCombinations.slice(0, 3);

    return best3.map((combo, index) => ({
      rank: index + 1,
      items: combo.combination,
      totals: combo.totals,
      runeInfo: combo.runeInfo,
      score: combo.score,
      avgAccuracyScore: combo.avgAccuracyScore,
      optionEfficiency: combo.optionEfficiency,
      runeEfficiency: combo.runeEfficiency,
      totalShortage: combo.totalShortage,
      usedOptionsCount: combo.usedOptionsCount,
      usedRuneCount: combo.usedRuneCount,
      allTargetsMet: combo.allTargetsMet
    }));
  };

  // M작 추천
  const getMCraftSuggestions = (combo) => {
    if (!useActualValues || combo.allTargetsMet) return null;
    
    const mCraftableItems = [];
    
    combo.items.forEach(item => {
      const itemOptions = Object.keys(item.options);
      if (itemOptions.length === 0) return;
      
      const increases = {};
      let hasIncrease = false;
      
      itemOptions.forEach(optionId => {
        const currentValue = item.options[optionId];
        const option = optionTypes.find(o => o.id === optionId);
        const tierMax = tierMaxValues[item.tier][option.group];
        const increase = tierMax - currentValue;
        
        if (increase > 0) {
          increases[optionId] = increase;
          hasIncrease = true;
        }
      });
      
      if (hasIncrease) {
        mCraftableItems.push({
          item,
          increases
        });
      }
    });
    
    if (mCraftableItems.length === 0) return null;
    
    const generateMCraftCombos = (items) => {
      const combos = [];
      
      for (let size = 1; size <= Math.min(3, items.length); size++) {
        const generate = (start, current) => {
          if (current.length === size) {
            combos.push([...current]);
            return;
          }
          
          for (let i = start; i < items.length; i++) {
            current.push(items[i]);
            generate(i + 1, current);
            current.pop();
          }
        };
        
        generate(0, []);
      }
      
      return combos;
    };
    
    const allMCraftCombos = generateMCraftCombos(mCraftableItems);
    
    const comboResults = allMCraftCombos.map(mCraftCombo => {
      const totalIncreases = {};
      
      mCraftCombo.forEach(mc => {
        Object.entries(mc.increases).forEach(([optionId, increase]) => {
          totalIncreases[optionId] = (totalIncreases[optionId] || 0) + increase;
        });
      });
      
      let resolvedCount = 0;
      const optionResults = [];
      
      optionTypes.forEach(option => {
        const target = targetValues[option.id];
        if (target === 0) return;
        
        const currentTotal = combo.totals[option.id];
        const runeInfo = combo.runeInfo[option.id];
        const beforeShortage = runeInfo?.shortage || 0;
        
        if (beforeShortage === 0) return;
        
        const increase = totalIncreases[option.id] || 0;
        const afterTotal = currentTotal + increase;
        const runeMax = runeMaxValues[option.id];
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
        
        if (beforeShortage > 0 && afterShortage === 0) {
          resolvedCount++;
        }
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
      if (a.mCraftCount !== b.mCraftCount) {
        return a.mCraftCount - b.mCraftCount;
      }
      if (a.allResolved !== b.allResolved) {
        return b.allResolved - a.allResolved;
      }
      if (b.resolvedCount !== a.resolvedCount) {
        return b.resolvedCount - a.resolvedCount;
      }
      return a.totalShortage - b.totalShortage;
    });
    
    return comboResults.slice(0, 5);
  };

  const bestCombinations = findBestCombinations();

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
        
        .eq-calc-container * {
          box-sizing: border-box;
        }
        
        .wrapper {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e9e9e7;
        }
        
        .title {
          font-size: 20px;
          font-weight: 600;
          color: #37352f;
          margin: 0 0 4px 0;
        }
        
        .subtitle {
          color: #9b9a97;
          font-size: 13px;
          margin: 0;
        }
        
        .section {
          background: #ffffff;
          border: 1px solid #e9e9e7;
          border-radius: 3px;
          padding: 16px;
          margin-bottom: 12px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #37352f;
          margin: 0 0 12px 0;
        }
        
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }
        
        .input-box {
          background: #f7f6f3;
          border-radius: 3px;
          padding: 8px 10px;
        }
        
        .label {
          display: block;
          color: #9b9a97;
          font-size: 11px;
          margin-bottom: 4px;
        }
        
        .input {
          width: 100%;
          padding: 6px 8px;
          background: #ffffff;
          border: 1px solid #e9e9e7;
          border-radius: 3px;
          color: #37352f;
          font-size: 13px;
          outline: none;
        }
        
        .input:focus {
          border-color: #37352f;
        }
        
        .select {
          padding: 6px 8px;
          background: #ffffff;
          border: 1px solid #e9e9e7;
          border-radius: 3px;
          color: #37352f;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          width: 100%;
        }
        
        .btn-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .btn {
          flex: 1;
          min-width: 100px;
          padding: 8px 12px;
          border-radius: 3px;
          font-weight: 500;
          border: 1px solid #e9e9e7;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 13px;
          background: #ffffff;
          color: #37352f;
        }
        
        .btn:hover {
          background: #f7f6f3;
        }
        
        .btn-active {
          background: #37352f;
          color: #ffffff;
          border-color: #37352f;
        }
        
        .btn-active:hover {
          background: #2f2d2a;
        }
        
        .btn-primary {
          background: #37352f;
          color: #ffffff;
          border-color: #37352f;
        }
        
        .btn-primary:hover {
          background: #2f2d2a;
        }
        
        .hint {
          color: #9b9a97;
          font-size: 12px;
          margin-top: 8px;
        }
        
        .form-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .form-row > * {
          flex: 1;
          min-width: 100px;
        }
        
        .option-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 6px;
          margin-bottom: 12px;
        }
        
        .option-btn {
          padding: 8px 10px;
          border-radius: 3px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid #e9e9e7;
          width: 100%;
          background: #ffffff;
        }
        
        .option-btn:hover {
          background: #f7f6f3;
        }
        
        .option-selected {
          background: #f7f6f3;
          border-color: #37352f;
        }
        
        .option-name {
          color: #37352f;
          font-size: 12px;
          font-weight: 500;
        }
        
        .option-input {
          width: 100%;
          padding: 4px 6px;
          background: #ffffff;
          border: 1px solid #e9e9e7;
          border-radius: 3px;
          color: #37352f;
          font-size: 12px;
          outline: none;
          margin-top: 4px;
        }
        
        .option-max {
          color: #9b9a97;
          font-size: 11px;
          margin-top: 4px;
        }
        
        .action-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .action-row .btn {
          flex: 1;
          min-width: 80px;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .list-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .list-header-right {
          display: flex;
          gap: 6px;
        }
        
        .toggle-btn {
          background: #ffffff;
          color: #37352f;
          padding: 4px 10px;
          border-radius: 3px;
          border: 1px solid #e9e9e7;
          cursor: pointer;
          font-size: 12px;
        }
        
        .toggle-btn:hover {
          background: #f7f6f3;
        }
        
        .clear-btn {
          background: #ffffff;
          color: #9b9a97;
          padding: 4px 10px;
          border-radius: 3px;
          border: 1px solid #e9e9e7;
          cursor: pointer;
          font-size: 12px;
        }
        
        .clear-btn:hover {
          background: #f7f6f3;
          color: #37352f;
        }
        
        .item-count {
          color: #9b9a97;
          font-size: 13px;
        }
        
        .card-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 8px;
        }
        
        .item-card {
          background: #f7f6f3;
          border-radius: 3px;
          padding: 10px 12px;
          border: 1px solid #e9e9e7;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .tier-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          background: #e9e9e7;
          color: #37352f;
        }
        
        .item-type {
          color: #37352f;
          font-weight: 500;
          font-size: 13px;
        }
        
        .card-actions {
          display: flex;
          gap: 4px;
        }
        
        .card-btn {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          border: 1px solid #e9e9e7;
          background: #ffffff;
          color: #9b9a97;
        }
        
        .card-btn:hover {
          background: #f7f6f3;
          color: #37352f;
        }
        
        .card-options {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .option-tag {
          background: #ffffff;
          color: #37352f;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          border: 1px solid #e9e9e7;
        }
        
        .empty-state {
          text-align: center;
          padding: 24px 16px;
          color: #9b9a97;
        }
        
        .calculate-btn {
          width: 100%;
          padding: 12px;
          background: #37352f;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          margin-top: 8px;
        }
        
        .calculate-btn:hover {
          background: #2f2d2a;
        }
        
        .result-card {
          background: #f7f6f3;
          border-radius: 3px;
          padding: 14px;
          border: 1px solid #e9e9e7;
          margin-bottom: 12px;
        }
        
        .result-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .rank-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
          background: #e9e9e7;
          color: #37352f;
        }
        
        .result-title {
          color: #37352f;
          font-weight: 600;
          font-size: 14px;
        }
        
        .result-meta {
          color: #9b9a97;
          font-size: 12px;
        }
        
        .sub-title {
          color: #9b9a97;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .selected-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 14px;
        }
        
        .selected-item {
          background: #ffffff;
          padding: 6px 10px;
          border-radius: 3px;
          font-size: 12px;
          color: #37352f;
          border: 1px solid #e9e9e7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .selected-item-name {
          font-weight: 500;
        }
        
        .selected-item-options {
          font-size: 11px;
          color: #9b9a97;
        }
        
        .achievement-item {
          background: #ffffff;
          border-radius: 3px;
          padding: 10px;
          margin-bottom: 6px;
          border: 1px solid #e9e9e7;
        }
        
        .achievement-title {
          color: #37352f;
          font-weight: 500;
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .achievement-detail {
          color: #9b9a97;
          font-size: 11px;
          margin-bottom: 2px;
        }
        
        .text-success { color: #37352f; font-weight: 500; }
        .text-warning { color: #9b9a97; }
        .text-error { color: #37352f; text-decoration: underline; }
        
        .mcraft-section {
          margin-top: 14px;
          padding: 12px;
          background: #ffffff;
          border-radius: 3px;
          border: 1px solid #e9e9e7;
        }
        
        .mcraft-title {
          color: #37352f;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 10px;
        }
        
        .mcraft-item {
          background: #f7f6f3;
          padding: 10px;
          border-radius: 3px;
          margin-bottom: 8px;
          border: 1px solid #e9e9e7;
        }
        
        .mcraft-item.resolved {
          border-color: #37352f;
        }
        
        .mcraft-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .mcraft-badge {
          color: #37352f;
          font-size: 12px;
          font-weight: 500;
        }
        
        .mcraft-status {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 500;
          background: #e9e9e7;
          color: #37352f;
        }
        
        .mcraft-target {
          background: #ffffff;
          padding: 6px 8px;
          border-radius: 3px;
          margin-bottom: 4px;
          border: 1px solid #e9e9e7;
        }
        
        .mcraft-target-name {
          color: #37352f;
          font-size: 11px;
          font-weight: 500;
        }
        
        .mcraft-target-current {
          color: #9b9a97;
          font-size: 10px;
          margin-top: 2px;
        }
        
        .mcraft-effect {
          color: #9b9a97;
          font-size: 11px;
          padding-left: 8px;
          margin-bottom: 2px;
        }
        
        .mcraft-effect.resolved {
          color: #37352f;
          font-weight: 500;
        }
        
        .mcraft-tip {
          margin-top: 8px;
          padding: 6px 8px;
          background: #f7f6f3;
          border-radius: 3px;
        }
        
        .mcraft-tip-text {
          color: #9b9a97;
          font-size: 11px;
        }
        
        .summary-box {
          margin-top: 12px;
          padding: 10px;
          border-radius: 3px;
          background: #ffffff;
          border: 1px solid #e9e9e7;
        }
        
        .summary-box.success {
          border-color: #37352f;
        }
        
        .summary-title {
          font-size: 12px;
          font-weight: 500;
          color: #37352f;
        }
        
        .summary-detail {
          font-size: 11px;
          margin-top: 4px;
          color: #9b9a97;
        }
        
        @media (max-width: 480px) {
          .eq-calc-container {
            padding: 12px;
          }
          
          .section {
            padding: 12px;
          }
          
          .form-row > * {
            min-width: 100%;
          }
          
          .btn-group {
            flex-direction: column;
          }
          
          .btn {
            min-width: 100%;
          }
          
          .card-list {
            grid-template-columns: 1fr;
          }
          
          .list-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .list-header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
      
      <div className="wrapper">
        <div className="header">
          <h1 className="title">장비 옵션 계산기</h1>
          <p className="subtitle">목표 수치를 달성하기 위한 장비 조합을 계산합니다</p>
        </div>

        {/* 목표 수치 설정 */}
        <div className="section">
          <h2 className="section-title">목표 수치</h2>
          <div className="grid-3">
            {optionTypes.map(option => (
              <div key={option.id} className="input-box">
                <label className="label">{option.name}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
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
                setItems([]);
                setEditingItemId(null);
                setNewItem({ tier: '태초', itemType: '무기', options: {} });
              }}
              className={`btn ${!useActualValues ? 'btn-active' : ''}`}
            >
              최대값 기준
            </button>
            <button
              onClick={() => {
                setUseActualValues(true);
                setItems(loadFromStorage());
                setEditingItemId(null);
                setNewItem({ tier: '태초', itemType: '무기', options: {} });
              }}
              className={`btn ${useActualValues ? 'btn-active' : ''}`}
            >
              실제 수치 입력
            </button>
          </div>
          <p className="hint">
            {useActualValues 
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

          <label className="label">옵션 선택</label>
          <div className="option-grid">
            {optionTypes.map(option => {
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
                <button onClick={saveEditItem} className="btn btn-primary">
                  수정 완료
                </button>
                <button onClick={cancelEditItem} className="btn">
                  취소
                </button>
              </>
            ) : (
              <button onClick={addItem} className="btn btn-primary">
                추가
              </button>
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
              <button 
                onClick={() => setIsListExpanded(!isListExpanded)}
                className="toggle-btn"
              >
                {isListExpanded ? '접기' : '펼치기'}
              </button>
              {items.length > 0 && (
                <button onClick={clearAllItems} className="clear-btn">
                  전체 삭제
                </button>
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
                  const optionEntries = Object.entries(item.options);
                  
                  return (
                    <div key={item.id} className="item-card">
                      <div className="card-header">
                        <div className="card-title">
                          <span className="tier-badge">{item.tier}</span>
                          <span className="item-type">{item.itemType}</span>
                        </div>
                        <div className="card-actions">
                          <button 
                            onClick={() => startEditItem(item)}
                            className="card-btn"
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="card-btn"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="card-options">
                        {optionEntries.length > 0 ? (
                          optionEntries.map(([optionId, value]) => {
                            const option = optionTypes.find(o => o.id === optionId);
                            return (
                              <span key={optionId} className="option-tag">
                                {option?.name}: {value}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: '#9b9a97', fontSize: '11px' }}>
                            옵션 없음
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* 계산 버튼 */}
        {items.length > 0 && (
          <button onClick={handleCalculate} className="calculate-btn">
            최적 조합 계산
          </button>
        )}

        {/* 결과 */}
        {showResults && bestCombinations.length > 0 && (
          <div className="section" style={{ marginTop: '12px' }}>
            <h2 className="section-title">Best 3 조합</h2>
            <p className="hint" style={{ marginTop: 0, marginBottom: '12px' }}>
              입력된 장비들 중에서 각 종류별로 1개씩 선택한 최적의 조합입니다.
            </p>
            
            {bestCombinations.map((combo, index) => {
              const rankLabels = ['1st', '2nd', '3rd'];
              const mCraftSuggestions = getMCraftSuggestions(combo);
              
              return (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <span className="rank-badge">{rankLabels[index]}</span>
                    <span className="result-title">조합 {combo.rank}</span>
                    <span className="result-meta">
                      (옵션 {combo.usedOptionsCount}개 / 룬 {combo.usedRuneCount}개)
                    </span>
                  </div>
                  
                  {/* 선택된 장비 */}
                  <div className="sub-title">선택된 장비</div>
                  <div className="selected-items">
                    {combo.items.map((item, idx) => {
                      const optionEntries = Object.entries(item.options);
                      const optionsText = optionEntries.length > 0 
                        ? optionEntries.map(([optionId, value]) => {
                            const option = optionTypes.find(o => o.id === optionId);
                            return `${option?.name}:${value}`;
                          }).join(' / ')
                        : '-';
                      
                      return (
                        <div key={idx} className="selected-item">
                          <span className="selected-item-name">
                            {item.itemType} ({item.tier})
                          </span>
                          <span className="selected-item-options">{optionsText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 옵션별 달성률 */}
                  <div className="sub-title">옵션별 달성률</div>
                  {optionTypes.map(option => {
                    const target = targetValues[option.id];
                    if (target === 0) return null;
                    
                    const achieved = combo.totals[option.id];
                    const rune = combo.runeInfo[option.id];
                    const withRune = achieved + (rune?.needed || 0);
                    const finalShortage = rune?.shortage || 0;
                    const excess = rune?.excess || 0;
                    
                    return (
                      <div key={option.id} className="achievement-item">
                        <div className="achievement-title">{option.name}</div>
                        <div className="achievement-detail">
                          목표: {target} / 장비 합계: {achieved}
                        </div>
                        {rune && rune.needed > 0 && (
                          <div className="achievement-detail">
                            룬 보완: {rune.needed}
                          </div>
                        )}
                        {excess > 0 && (
                          <div className="achievement-detail text-warning">
                            목표 초과: +{excess}
                          </div>
                        )}
                        {finalShortage > 0 ? (
                          <div className="achievement-detail text-error">
                            부족: {finalShortage}
                          </div>
                        ) : excess === 0 && withRune >= target ? (
                          <div className="achievement-detail text-success">
                            달성 (합계: {withRune})
                          </div>
                        ) : null}
                      </div>
                    );
                  })}

                  {/* M작 추천 */}
                  {mCraftSuggestions && mCraftSuggestions.length > 0 && (
                    <div className="mcraft-section">
                      <div className="mcraft-title">M작 추천</div>
                      
                      {mCraftSuggestions.map((suggestion, sugIdx) => (
                        <div 
                          key={sugIdx} 
                          className={`mcraft-item ${suggestion.allResolved ? 'resolved' : ''}`}
                        >
                          <div className="mcraft-header">
                            <span className="mcraft-badge">
                              방법 {sugIdx + 1}: {suggestion.mCraftCount}개 M작
                            </span>
                            {suggestion.allResolved && (
                              <span className="mcraft-status">모두 달성</span>
                            )}
                            {!suggestion.allResolved && suggestion.resolvedCount > 0 && (
                              <span className="mcraft-status">
                                {suggestion.resolvedCount}개 해결
                              </span>
                            )}
                          </div>
                          
                          <div style={{ marginBottom: '8px' }}>
                            {suggestion.mCraftItems.map((item, itemIdx) => {
                              const itemOptions = Object.entries(item.options)
                                .map(([optId, val]) => {
                                  const opt = optionTypes.find(o => o.id === optId);
                                  return `${opt?.name}:${val}`;
                                })
                                .join(', ');
                              
                              return (
                                <div key={itemIdx} className="mcraft-target">
                                  <div className="mcraft-target-name">
                                    {item.itemType} ({item.tier})
                                  </div>
                                  <div className="mcraft-target-current">
                                    {itemOptions}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div>
                            {suggestion.optionResults.map((result, resIdx) => (
                              <div 
                                key={resIdx} 
                                className={`mcraft-effect ${result.resolved ? 'resolved' : ''}`}
                              >
                                {result.optionName}: {result.beforeTotal} → {result.afterTotal}
                                {result.increase > 0 && ` (+${result.increase})`}
                                {result.afterShortage > 0 
                                  ? ` → 부족 ${result.afterShortage}`
                                  : ' → 달성'
                                }
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div className="mcraft-tip">
                        <div className="mcraft-tip-text">
                          M작 개수가 적을수록 비용이 절약됩니다.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 전체 요약 */}
                  {combo.totalShortage > 0 ? (
                    <div className="summary-box">
                      <div className="summary-title">
                        이 조합으로는 모든 목표를 달성할 수 없습니다
                      </div>
                    </div>
                  ) : (
                    <div className="summary-box success">
                      <div className="summary-title">
                        모든 목표 달성 가능
                      </div>
                      <div className="summary-detail">
                        남은 {combo.items.length * 4 - combo.usedOptionsCount}개 옵션 슬롯 사용 가능
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showResults && bestCombinations.length === 0 && (
          <div className="section" style={{ marginTop: '12px' }}>
            <h2 className="section-title">조합 추천</h2>
            <div className="empty-state">
              <p style={{ fontSize: '13px', margin: 0 }}>조합을 찾을 수 없습니다</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentCalculator;