import { renderHook, act } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import useStateSync from 'use-state-sync';

describe('useStateSync - 基本类型', () => {
  test('初始值应该正确', () => {
    const { result } = renderHook(() => useStateSync(10));
    expect(result.current[0].value).toBe(10);
  });

  test('可以更新简单值', () => {
    const { result } = renderHook(() => useStateSync(0));
    
    act(() => {
      result.current[1](100);
    });
    
    expect(result.current[0].value).toBe(100);
  });

  test('函数式更新应该工作', () => {
    const { result } = renderHook(() => useStateSync(5));
    
    act(() => {
      result.current[1]((prev: { value: number }) => prev.value + 10);
    });
    
    expect(result.current[0].value).toBe(15);
  });
});

describe('useStateSync - 深层对象结构', () => {
  test('深层嵌套对象应该正确同步', () => {
    const deepObject = {
      level1: {
        level2: {
          level3: {
            level4: {
              value: 'deep-value'
            }
          }
        }
      }
    };

    const { result } = renderHook(() => useStateSync(deepObject));
    
    // 读取深层值
    expect(result.current[0].value.level1.level2.level3.level4.value).toBe('deep-value');
    
    // 更新深层值
    act(() => {
      result.current[1]((prev: { value: typeof deepObject }) => ({
        ...prev.value,
        level1: {
          ...prev.value.level1,
          level2: {
            ...prev.value.level1.level2,
            level3: {
              ...prev.value.level1.level2.level3,
              level4: {
                ...prev.value.level1.level2.level3.level4,
                value: 'new-deep-value'
              }
            }
          }
        }
      }));
    });
    
    expect(result.current[0].value.level1.level2.level3.level4.value).toBe('new-deep-value');
  });

  test('复杂对象结构应该保持引用同步', () => {
    const complexObj = {
      user: {
        profile: {
          name: 'John',
          age: 30,
          address: {
            city: 'Beijing',
            street: 'Main St'
          }
        },
        settings: {
          theme: 'dark',
          language: 'zh'
        }
      },
      items: [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' }
      ]
    };

    const { result } = renderHook(() => useStateSync(complexObj));
    
    act(() => {
      result.current[1]((prev: { value: typeof complexObj }) => ({
        ...prev.value,
        user: {
          ...prev.value.user,
          profile: {
            ...prev.value.user.profile,
            name: 'Jane'
          }
        }
      }));
    });
    
    expect(result.current[0].value.user.profile.name).toBe('Jane');
    expect(result.current[0].value.user.profile.age).toBe(30); // 其他属性保持不变
  });
});

describe('useStateSync - 回调函数', () => {
  test('回调函数应该在状态更新后执行', () => {
    const { result } = renderHook(() => useStateSync(0));
    let callbackExecuted = false;
    
    act(() => {
      result.current[1](10, () => {
        callbackExecuted = true;
      });
    });
    
    expect(callbackExecuted).toBe(true);
    expect(result.current[0].value).toBe(10);
  });

  test('回调中可以同步访问最新状态', () => {
    const { result } = renderHook(() => useStateSync(0));
    let capturedValue = 0;
    
    act(() => {
      result.current[1](20, () => {
        capturedValue = result.current[0].value;
      });
    });
    
    expect(capturedValue).toBe(20);
  });
});

describe('useStateSync - 数组类型', () => {
  test('数组初始化和更新应该正确', () => {
    const { result } = renderHook(() => useStateSync([1, 2, 3]));
    
    expect(result.current[0].value).toEqual([1, 2, 3]);
    
    act(() => {
      result.current[1]([4, 5, 6]);
    });
    
    expect(result.current[0].value).toEqual([4, 5, 6]);
  });

  test('数组函数式更新应该正确', () => {
    const { result } = renderHook(() => useStateSync([1, 2, 3]));
    
    act(() => {
      result.current[1]((prev: { value: number[] }) => [...prev.value, 4, 5]);
    });
    
    expect(result.current[0].value).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('useStateSync - 边界情况', () => {
  test('函数式初始值应该正确初始化', () => {
    const { result } = renderHook(() => useStateSync(() => ({ count: 10 })));
    
    expect(result.current[0].value).toEqual({ count: 10 });
  });

  test('null 和 undefined 值应该正确处理', () => {
    const { result: resultNull } = renderHook(() => useStateSync<number | null>(null));
    expect(resultNull.current[0].value).toBe(null);
    
    act(() => {
      resultNull.current[1](10);
    });
    expect(resultNull.current[0].value).toBe(10);
    
    act(() => {
      resultNull.current[1](null);
    });
    expect(resultNull.current[0].value).toBe(null);
  });

  test('多次连续更新应该保持状态一致性', () => {
    const { result } = renderHook(() => useStateSync(0));
    
    act(() => {
      result.current[1](1);
      result.current[1](2);
      result.current[1](3);
    });
    
    expect(result.current[0].value).toBe(3);
    
    act(() => {
      result.current[1]((prev: { value: number }) => prev.value + 1);
      result.current[1]((prev: { value: number }) => prev.value + 1);
    });
    
    expect(result.current[0].value).toBe(5);
  });
});

describe('useStateSync - getState 访问方式', () => {
  test('getState 应该支持 valueOf 方式调用', () => {
    const { result } = renderHook(() => useStateSync(42));
    
    // 通过 valueOf 访问
    const value = Number(result.current[0]);
    expect(value).toBe(42);
    
    act(() => {
      result.current[1](100);
    });
    
    const newValue = Number(result.current[0]);
    expect(newValue).toBe(100);
  });
});

