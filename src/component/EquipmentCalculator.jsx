import React, { useState } from 'react';

const EquipmentCalculator = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      paddingTop: '24px'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#d8b4fe',
      fontSize: '16px'
    },
    section: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px'
    },
    inputBox: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    label: {
      display: 'block',
      color: '#e9d5ff',
      fontSize: '14px',
      marginBottom: '8px',
      fontWeight: '600'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px'
    },
    button: {
      flex: 1,
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '16px'
    },
    buttonActive: {
      background: '#9333ea',
      color: 'white',
      boxShadow: '0 10px 30px rgba(147, 51, 234, 0.5)'
    },
    buttonInactive: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    hint: {
      color: '#d8b4fe',
      fontSize: '14px',
      marginTop: '12px'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    addButton: {
      background: '#9333ea',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 0',
      color: 'rgba(255, 255, 255, 0.4)'
    },
    itemCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '16px'
    },
    itemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    itemTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    itemNumber: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    select: {
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer'
    },
    deleteButton: {
      color: '#f87171',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'color 0.3s'
    },
    optionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px'
    },
    optionButton: {
      padding: '12px',
      borderRadius: '8px',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: 'none',
      width: '100%'
    },
    optionSelected: {
      background: 'rgba(147, 51, 234, 0.5)',
      border: '2px solid #a78bfa'
    },
    optionUnselected: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    optionName: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    optionInput: {
      width: '100%',
      padding: '6px 8px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      marginTop: '8px',
      boxSizing: 'border-box'
    },
    optionMax: {
      color: '#e9d5ff',
      fontSize: '12px',
      marginTop: '8px'
    },
    recommendCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '12px'
    },
    recommendTitle: {
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
      marginBottom: '8px'
    },
    suggestionItem: {
      background: 'rgba(147, 51, 234, 0.2)',
      borderRadius: '6px',
      padding: '10px',
      marginBottom: '8px',
      border: '1px solid rgba(147, 51, 234, 0.3)'
    },
    suggestionTier: {
      color: '#a78bfa',
      fontWeight: '600',
      fontSize: '14px',
      marginBottom: '4px'
    },
    suggestionDetail: {
      color: '#e9d5ff',
      fontSize: '13px'
    },
    runeTitle: {
      color: '#a78bfa',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '12px'
    },
    rankBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '600',
      marginRight: '8px'
    },
    rank1: {
      background: '#fbbf24',
      color: '#78350f'
    },
    rank2: {
      background: '#c0c0c0',
      color: '#374151'
    },
    rank3: {
      background: '#cd7f32',
      color: '#1f2937'
    },
    calculateButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 10px 30px rgba(147, 51, 234, 0.5)',
      marginTop: '12px'
    }
  };

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
  const itemTypes = [
    '무기',
    '목걸이',
    '반지',
    '벨트',
    '투구',
    '갑옷',
    '장갑',
    '신발'
  ];

  // 룬 최대값 정의
  const runeMaxValues = {
    critRate: 6,
    atkSpeed: 6,
    evasion: 6,
    dmgReduce: 12,
    lifesteal: 12,
    moveSpeed: 12
  };

  // 상태 관리
  const [targetValues, setTargetValues] = useState({
    critRate: 100,
    atkSpeed: 50,
    evasion: 40,
    dmgReduce: 0,
    lifesteal: 50,
    moveSpeed: 0
  });

  // 목업 데이터 생성 함수 (주석 처리 - 테스트용)
  const generateMockData = () => {
    const mockItems = [];
    const tiers = ['태초', '혼돈', '심연'];
    const targetOptions = ['critRate', 'atkSpeed', 'evasion', 'lifesteal'];
    
    // 무기 제외한 장비 종류
    const mockItemTypes = itemTypes.filter(type => type !== '무기');
    
    // 70개의 샘플 장비 생성
    for (let i = 0; i < 70; i++) {
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const itemType = mockItemTypes[i % mockItemTypes.length];
      const numOptions = Math.floor(Math.random() * 3) + 1; // 1~3개 옵션
      
      const options = {};
      const shuffledOptions = [...targetOptions].sort(() => Math.random() - 0.5);
      
      for (let j = 0; j < numOptions; j++) {
        const optionId = shuffledOptions[j];
        const option = optionTypes.find(o => o.id === optionId);
        const maxValue = tierMaxValues[tier][option.group];
        // 최대값의 70~100% 사이 랜덤 값
        const value = Math.floor(maxValue * (0.7 + Math.random() * 0.3));
        options[optionId] = value;
      }
      
      mockItems.push({
        id: Date.now() + i,
        tier,
        itemType,
        options
      });
    }
    
    return mockItems;
  };

  // 기본 장비 8개 세팅 (종류별 1개씩)
  const [items, setItems] = useState(() => {
    return itemTypes.map((type, index) => ({
      id: Date.now() + index,
      tier: '태초',
      itemType: type,
      options: {}
    }));
  });
  
  // const [items, setItems] = useState(generateMockData());
  
  const [useActualValues, setUseActualValues] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // 아이템 추가
  const addItemWithTier = (tier) => {
    setItems(prevItems => [...prevItems, {
      id: Date.now(),
      tier: tier,
      itemType: '무기',
      options: {}
    }]);
    setShowResults(false);
  };

  // 아이템 삭제
  const removeItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    setShowResults(false);
  };

  // 아이템 단계 변경
  const updateItemTier = (id, tier) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        if (!useActualValues) {
          const newOptions = {};
          Object.keys(item.options).forEach(optionId => {
            const option = optionTypes.find(o => o.id === optionId);
            newOptions[optionId] = tierMaxValues[tier][option.group];
          });
          return { ...item, tier, options: newOptions };
        } else {
          const newOptions = {};
          Object.keys(item.options).forEach(optionId => {
            const option = optionTypes.find(o => o.id === optionId);
            const maxValue = tierMaxValues[tier][option.group];
            newOptions[optionId] = Math.min(item.options[optionId], maxValue);
          });
          return { ...item, tier, options: newOptions };
        }
      }
      return item;
    }));
    setShowResults(false);
  };

  // 일괄 단계 변경
  const bulkChangeTier = (tier) => {
    setItems(prevItems => prevItems.map((item) => {
      if (!useActualValues) {
        const newOptions = {};
        Object.keys(item.options).forEach(optionId => {
          const option = optionTypes.find(o => o.id === optionId);
          newOptions[optionId] = tierMaxValues[tier][option.group];
        });
        return { ...item, tier, options: newOptions };
      } else {
        const newOptions = {};
        Object.keys(item.options).forEach(optionId => {
          const option = optionTypes.find(o => o.id === optionId);
          const maxValue = tierMaxValues[tier][option.group];
          newOptions[optionId] = Math.min(item.options[optionId], maxValue);
        });
        return { ...item, tier, options: newOptions };
      }
    }));
    setShowResults(false);
  };

  // 아이템 종류 변경
  const updateItemType = (id, itemType) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, itemType } : item
    ));
    setShowResults(false);
  };

  // 아이템 옵션 토글
  const toggleItemOption = (itemId, optionId) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const newOptions = { ...item.options };
        if (newOptions[optionId] !== undefined) {
          delete newOptions[optionId];
        } else {
          const option = optionTypes.find(o => o.id === optionId);
          const maxValue = tierMaxValues[item.tier][option.group];
          newOptions[optionId] = useActualValues ? 0 : maxValue;
        }
        return { ...item, options: newOptions };
      }
      return item;
    }));
    setShowResults(false);
  };

  // 아이템 옵션 수치 변경
  const updateItemOptionValue = (itemId, optionId, value) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const option = optionTypes.find(o => o.id === optionId);
        const maxValue = tierMaxValues[item.tier][option.group];
        const numValue = parseInt(value) || 0;
        return {
          ...item,
          options: { ...item.options, [optionId]: Math.min(numValue, maxValue) }
        };
      }
      return item;
    }));
    setShowResults(false);
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

    // ⚡ 최적화: 각 종류별로 상위 5개만 선택
    const MAX_ITEMS_PER_TYPE = 5;
    Object.keys(itemsByType).forEach(type => {
      itemsByType[type].sort((a, b) => {
        // 옵션 개수로 1차 정렬
        const aCount = Object.keys(a.options).length;
        const bCount = Object.keys(b.options).length;
        if (bCount !== aCount) return bCount - aCount;
        
        // 옵션 합계로 2차 정렬
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
      const maxPossibleOptions = combination.length * 4; // 장비당 최대 4개
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

  // M작 추천 (조합 시뮬레이션)
  const getMCraftSuggestions = (combo) => {
    if (!useActualValues || combo.allTargetsMet) return null;
    
    // M작 가능한 장비들과 그 효과
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
    
    // 모든 M작 조합 생성 (1개, 2개, 3개...)
    const generateMCraftCombos = (items) => {
      const combos = [];
      
      // 1개부터 최대 3개까지
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
    
    // 각 조합별 효과 계산
    const comboResults = allMCraftCombos.map(mCraftCombo => {
      // M작 후 각 옵션 증가량 합계
      const totalIncreases = {};
      
      mCraftCombo.forEach(mc => {
        Object.entries(mc.increases).forEach(([optionId, increase]) => {
          totalIncreases[optionId] = (totalIncreases[optionId] || 0) + increase;
        });
      });
      
      // 각 옵션별 달성 상태
      let resolvedCount = 0;
      const optionResults = [];
      
      optionTypes.forEach(option => {
        const target = targetValues[option.id];
        if (target === 0) return;
        
        const currentTotal = combo.totals[option.id];
        const runeInfo = combo.runeInfo[option.id];
        const beforeShortage = runeInfo?.shortage || 0;
        
        if (beforeShortage === 0) return; // 이미 달성
        
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
    
    // 정렬: M작 개수 적은 순 → 모두 해결 → 해결 개수 → 부족분 적은 순
    comboResults.sort((a, b) => {
      // 1순위: M작 개수 적은 순 (비용 최소화)
      if (a.mCraftCount !== b.mCraftCount) {
        return a.mCraftCount - b.mCraftCount;
      }
      // 2순위: 모두 해결
      if (a.allResolved !== b.allResolved) {
        return b.allResolved - a.allResolved;
      }
      // 3순위: 해결 개수
      if (b.resolvedCount !== a.resolvedCount) {
        return b.resolvedCount - a.resolvedCount;
      }
      // 4순위: 부족분 적은 순
      return a.totalShortage - b.totalShortage;
    });
    
    return comboResults.slice(0, 5); // Top 5로 확대
  };

  const bestCombinations = findBestCombinations();

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚔️ 장비 옵션 계산기</h1>
          <p style={styles.subtitle}>목표 수치를 달성하기 위한 장비 조합을 계산해보세요</p>
        </div>

        {/* 목표 수치 설정 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            🎯 목표 수치 설정
          </h2>
          <div style={styles.grid}>
            {optionTypes.map(option => (
              <div key={option.id} style={styles.inputBox}>
                <label style={styles.label}>
                  {option.name}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetValues[option.id]}
                  onChange={(e) => updateTargetValue(option.id, e.target.value)}
                  style={styles.input}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 입력 모드 선택 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            ⚙️ 계산 모드
          </h2>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => {
                setUseActualValues(false);
                setItems(prevItems => prevItems.map(item => {
                  const newOptions = {};
                  Object.keys(item.options).forEach(optionId => {
                    const option = optionTypes.find(o => o.id === optionId);
                    newOptions[optionId] = tierMaxValues[item.tier][option.group];
                  });
                  return { ...item, options: newOptions };
                }));
              }}
              style={{
                ...styles.button,
                ...(useActualValues ? styles.buttonInactive : styles.buttonActive)
              }}
            >
              최대값 기준 계산
            </button>
            <button
              onClick={() => {
                setUseActualValues(true);
                setItems(prevItems => prevItems.map(item => {
                  const newOptions = {};
                  Object.keys(item.options).forEach(optionId => {
                    newOptions[optionId] = 0;
                  });
                  return { ...item, options: newOptions };
                }));
              }}
              style={{
                ...styles.button,
                ...(useActualValues ? styles.buttonActive : styles.buttonInactive)
              }}
            >
              실제 수치 입력
            </button>
          </div>
          <p style={styles.hint}>
            {useActualValues 
              ? '💡 혼돈 장비의 계승 옵션까지 고려한 실제 수치를 입력하세요' 
              : '💡 각 단계별 최대 수치를 기준으로 계산합니다'}
          </p>
        </div>

        {/* 보유 장비 */}
        <div style={styles.section}>
          <div style={styles.headerRow}>
            <h2 style={styles.sectionTitle}>
              🎒 보유 장비
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => addItemWithTier('태초')}
                style={{...styles.addButton, background: '#3b82f6'}}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
              >
                + 태초 장비
              </button>
              <button
                onClick={() => addItemWithTier('혼돈')}
                style={{...styles.addButton, background: '#8b5cf6'}}
                onMouseOver={(e) => e.target.style.background = '#7c3aed'}
                onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
              >
                + 혼돈 장비
              </button>
              <button
                onClick={() => addItemWithTier('심연')}
                style={{...styles.addButton, background: '#ec4899'}}
                onMouseOver={(e) => e.target.style.background = '#db2777'}
                onMouseOut={(e) => e.target.style.background = '#ec4899'}
              >
                + 심연 장비
              </button>
            </div>
          </div>

          {/* 일괄 변경 */}
          {items.length >= 1 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <p style={{ color: '#93c5fd', fontSize: '14px', margin: 0 }}>
                💡 모든 장비의 단계를 일괄 변경:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => bulkChangeTier('태초')}
                  style={{
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2563eb'}
                  onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                  태초
                </button>
                <button
                  onClick={() => bulkChangeTier('혼돈')}
                  style={{
                    padding: '8px 16px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#7c3aed'}
                  onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
                >
                  혼돈
                </button>
                <button
                  onClick={() => bulkChangeTier('심연')}
                  style={{
                    padding: '8px 16px',
                    background: '#ec4899',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#db2777'}
                  onMouseOut={(e) => e.target.style.background = '#ec4899'}
                >
                  심연
                </button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '18px' }}>아직 추가된 장비가 없습니다</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>장비 추가 버튼을 눌러 시작하세요</p>
            </div>
          ) : (
            <div>
              {items.map((item, index) => (
                <div key={item.id} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <div style={styles.itemTitle}>
                      <span style={styles.itemNumber}>장비 #{index + 1}</span>
                      <select
                        value={item.itemType}
                        onChange={(e) => updateItemType(item.id, e.target.value)}
                        style={styles.select}
                      >
                        {itemTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <select
                        value={item.tier}
                        onChange={(e) => updateItemTier(item.id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="태초">태초</option>
                        <option value="혼돈">혼돈</option>
                        <option value="심연">심연</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={styles.deleteButton}
                      onMouseOver={(e) => e.target.style.color = '#ef4444'}
                      onMouseOut={(e) => e.target.style.color = '#f87171'}
                    >
                      ✕ 삭제
                    </button>
                  </div>

                  <div style={styles.optionGrid}>
                    {optionTypes.map(option => {
                      const isSelected = item.options[option.id] !== undefined;
                      const maxValue = tierMaxValues[item.tier][option.group];
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleItemOption(item.id, option.id)}
                          style={{
                            ...styles.optionButton,
                            ...(isSelected ? styles.optionSelected : styles.optionUnselected)
                          }}
                        >
                          <div style={styles.optionName}>
                            {option.name}
                          </div>
                          {isSelected && (
                            <div onClick={(e) => e.stopPropagation()}>
                              {useActualValues ? (
                                <input
                                  type="number"
                                  min="0"
                                  max={maxValue}
                                  value={item.options[option.id]}
                                  onChange={(e) => updateItemOptionValue(item.id, option.id, e.target.value)}
                                  style={styles.optionInput}
                                  placeholder="수치 입력"
                                />
                              ) : (
                                <div style={styles.optionMax}>
                                  최대: {maxValue}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 계산 버튼 */}
        {items.length > 0 && (
          <button
            onClick={handleCalculate}
            style={styles.calculateButton}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 40px rgba(147, 51, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(147, 51, 234, 0.5)';
            }}
          >
            🔍 최적 조합 계산하기
          </button>
        )}

        {/* 최적 조합 추천 */}
        {showResults && bestCombinations.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              💡 입력된 장비 중 Best 3 조합
            </h2>
            <p style={styles.hint}>
              입력된 장비들 중에서 각 종류별로 1개씩 선택한 최적의 조합입니다. 적은 옵션으로 목표를 달성할수록 다른 옵션(치명타 피해, 공격력 등)을 선택할 여지가 생깁니다.
            </p>
            
            {bestCombinations.map((combo, index) => {
              const rankStyles = [styles.rank1, styles.rank2, styles.rank3];
              const rankLabels = ['🥇 Best', '🥈 2nd', '🥉 3rd'];
              const mCraftSuggestions = getMCraftSuggestions(combo);
              
              return (
                <div key={index} style={styles.recommendCard}>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ ...styles.rankBadge, ...rankStyles[index] }}>
                      {rankLabels[index]}
                    </span>
                    <span style={styles.recommendTitle}>
                      조합 {combo.rank}
                    </span>
                    <span style={{ color: '#a78bfa', fontSize: '13px', marginLeft: '12px' }}>
                      (옵션: {combo.usedOptionsCount}개 | 룬: {combo.usedRuneCount}개 | 점수: {combo.score.toFixed(1)})
                    </span>
                  </div>
                  
                  {/* 선택된 장비 */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={styles.runeTitle}>📦 선택된 장비</div>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {combo.items.map((item, idx) => {
                        const optionEntries = Object.entries(item.options);
                        const optionsText = optionEntries.length > 0 
                          ? optionEntries.map(([optionId, value]) => {
                              const option = optionTypes.find(o => o.id === optionId);
                              return `${option?.name}:${value}`;
                            }).join(' | ')
                          : '옵션 없음';
                        
                        return (
                          <div key={idx} style={{
                            background: 'rgba(147, 51, 234, 0.2)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#e9d5ff',
                            border: '1px solid rgba(147, 51, 234, 0.4)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>
                              {item.itemType} ({item.tier})
                            </span>
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#c4b5fd',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {optionsText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 옵션별 달성률 */}
                  <div>
                    <div style={styles.runeTitle}>📊 옵션별 달성률</div>
                    {optionTypes.map(option => {
                      const target = targetValues[option.id];
                      if (target === 0) return null;
                      
                      const achieved = combo.totals[option.id];
                      const rune = combo.runeInfo[option.id];
                      const withRune = achieved + (rune?.needed || 0);
                      const finalShortage = rune?.shortage || 0;
                      const excess = rune?.excess || 0;
                      
                      return (
                        <div key={option.id} style={styles.suggestionItem}>
                          <div style={styles.suggestionTier}>
                            {option.name}
                          </div>
                          <div style={styles.suggestionDetail}>
                            • 목표: {target} | 장비 합계: {achieved}
                          </div>
                          {rune && rune.needed > 0 && (
                            <div style={{ ...styles.suggestionDetail, color: '#a78bfa' }}>
                              • 룬으로 보완: {rune.needed} ({((rune.needed / target) * 100).toFixed(1)}%)
                            </div>
                          )}
                          {excess > 0 && (
                            <div style={{ ...styles.suggestionDetail, color: '#fbbf24' }}>
                              ⚠️ 목표 초과: +{excess}
                            </div>
                          )}
                          {finalShortage > 0 ? (
                            <div style={{ ...styles.suggestionDetail, color: '#f87171' }}>
                              ⚠️ 최종 부족: {finalShortage}
                            </div>
                          ) : excess === 0 && withRune >= target ? (
                            <div style={{ ...styles.suggestionDetail, color: '#22c55e' }}>
                              ✓ {withRune === target ? '딱 맞음!' : '달성 가능'} (합계: {withRune})
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* M작 추천 (조합) */}
                  {mCraftSuggestions && mCraftSuggestions.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(236, 72, 153, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(236, 72, 153, 0.3)'
                    }}>
                      <div style={{ color: '#f9a8d4', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                        🔨 M작 추천 (비용 절약 우선)
                      </div>
                      
                      {mCraftSuggestions.map((suggestion, sugIdx) => (
                        <div key={sugIdx} style={{
                          background: 'rgba(236, 72, 153, 0.15)',
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '10px',
                          border: suggestion.allResolved 
                            ? '2px solid #22c55e' 
                            : '1px solid rgba(236, 72, 153, 0.3)'
                        }}>
                          {/* 헤더 */}
                          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ 
                                color: '#f9a8d4', 
                                fontSize: '14px', 
                                fontWeight: '700',
                                background: 'rgba(236, 72, 153, 0.3)',
                                padding: '4px 10px',
                                borderRadius: '6px'
                              }}>
                                방법 {sugIdx + 1}: {suggestion.mCraftCount}개 M작
                              </span>
                            </div>
                            <div>
                              {suggestion.allResolved && (
                                <span style={{
                                  background: '#22c55e',
                                  color: 'white',
                                  fontSize: '11px',
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontWeight: '600'
                                }}>
                                  ✓ 모든 목표 달성
                                </span>
                              )}
                              {!suggestion.allResolved && suggestion.resolvedCount > 0 && (
                                <span style={{
                                  background: '#fbbf24',
                                  color: '#78350f',
                                  fontSize: '11px',
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontWeight: '600'
                                }}>
                                  {suggestion.resolvedCount}개 옵션 해결
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* M작 대상 장비들 (옵션 포함) */}
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ color: '#f9a8d4', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                              📌 M작할 장비:
                            </div>
                            {suggestion.mCraftItems.map((item, itemIdx) => {
                              const itemOptions = Object.entries(item.options)
                                .map(([optId, val]) => {
                                  const opt = optionTypes.find(o => o.id === optId);
                                  return `${opt?.name}:${val}`;
                                })
                                .join(', ');
                              
                              return (
                                <div key={itemIdx} style={{
                                  background: 'rgba(236, 72, 153, 0.25)',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  marginBottom: '4px'
                                }}>
                                  <div style={{ color: '#fce7f3', fontSize: '12px', fontWeight: '600' }}>
                                    {item.itemType} ({item.tier})
                                  </div>
                                  <div style={{ color: '#fbcfe8', fontSize: '11px', marginTop: '2px' }}>
                                    현재: {itemOptions}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* 옵션별 변화 */}
                          <div style={{ 
                            paddingTop: '8px',
                            borderTop: '1px solid rgba(236, 72, 153, 0.2)'
                          }}>
                            <div style={{ color: '#f9a8d4', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                              📊 M작 효과:
                            </div>
                            {suggestion.optionResults.map((result, resIdx) => (
                              <div key={resIdx} style={{
                                color: result.resolved ? '#86efac' : '#fbcfe8',
                                fontSize: '12px',
                                marginBottom: '4px',
                                paddingLeft: '8px'
                              }}>
                                {result.resolved ? '✓' : '•'} {result.optionName}: {result.beforeTotal} → {result.afterTotal}
                                {result.increase > 0 && (
                                  <span style={{ color: '#a78bfa', fontWeight: '600' }}> (+{result.increase})</span>
                                )}
                                {result.afterShortage > 0 ? (
                                  <span style={{ color: '#fca5a5' }}> → 부족 {result.afterShortage}</span>
                                ) : (
                                  <span style={{ color: '#86efac', fontWeight: '600' }}> → 달성!</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        <div style={{ color: '#93c5fd', fontSize: '11px' }}>
                          💡 M작 개수가 적을수록 비용이 절약됩니다. 위에서부터 가장 효율적인 방법입니다.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 전체 요약 */}
                  {combo.totalShortage > 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: 'rgba(248, 113, 113, 0.2)',
                      borderRadius: '8px',
                      border: '1px solid rgba(248, 113, 113, 0.3)'
                    }}>
                      <div style={{ color: '#f87171', fontSize: '14px', fontWeight: '600' }}>
                        ⚠️ 이 조합으로는 모든 목표를 달성할 수 없습니다
                      </div>
                    </div>
                  )}
                  {combo.totalShortage === 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      borderRadius: '8px',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>
                        ✓ 이 조합으로 모든 목표를 달성할 수 있습니다!
                      </div>
                      <div style={{ color: '#86efac', fontSize: '12px', marginTop: '4px' }}>
                        남은 {combo.items.length * 4 - combo.usedOptionsCount}개 옵션 슬롯에 치명타 피해, 공격력 등을 선택할 수 있습니다.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showResults && bestCombinations.length === 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              💡 조합 추천
            </h2>
            <div style={styles.emptyState}>
              <p style={{ fontSize: '16px' }}>조합을 찾을 수 없습니다.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>목표 수치와 장비 옵션을 확인해주세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentCalculator;