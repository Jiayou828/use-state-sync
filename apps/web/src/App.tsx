import { useState } from 'react'
import useStateSync from 'use-state-sync'
import './App.css'

function App() {
  // useStateSync 基本示例
  const [state, setState] = useStateSync(0)

  const handleClick = () => {
    // use-state-sync可以允许在任何位置获取到最新（通过setState函数更新后）的state
    // 因此在这里将会打印count+1后的值
    setState(state.value + 1, () => {
      console.log('useStateSync - count after update in callback:', state.value)
    })
    console.log('useStateSync - count after update in handleClick:', state.value)
  }

  // useState 对比示例
  const [countState, setCountState] = useState<number>(0)

  const handleStateClick = () => {
    // 使用 useState 时，在 setState 后立即访问 countState 仍然是旧值（闭包问题）
    setCountState(countState + 1)
    // 注意：这里的 countState 仍然是旧值，无法获取更新后的值
    console.log('useState - count after update in handleStateClick:', countState)
  }

  // 函数式更新示例
  const [funcState, setFuncState] = useStateSync(5)
  const handleFuncUpdate = () => {
    setFuncState((prev: { value: number }) => prev.value + 10)
  }

  // 深层嵌套对象示例
  const [deepState, setDeepState] = useStateSync({
    level1: {
      level2: {
        level3: {
          level4: {
            value: 'deep-value'
          }
        }
      }
    }
  })
  const handleDeepUpdate = () => {
    setDeepState((prev: { value: typeof deepState.value }) => ({
      ...prev.value,
      level1: {
        ...prev.value.level1,
        level2: {
          ...prev.value.level1.level2,
          level3: {
            ...prev.value.level1.level2.level3,
            level4: {
              ...prev.value.level1.level2.level3.level4,
              value: prev.value.level1.level2.level3.level4.value === 'deep-value' 
                ? 'new-deep-value' 
                : 'deep-value'
            }
          }
        }
      }
    }))
  }

  // 复杂对象结构示例
  const [complexState, setComplexState] = useStateSync({
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
  })
  const handleComplexUpdate = () => {
    setComplexState((prev: { value: typeof complexState.value }) => ({
      ...prev.value,
      user: {
        ...prev.value.user,
        profile: {
          ...prev.value.user.profile,
          name: prev.value.user.profile.name === 'John' ? 'Jane' : 'John'
        }
      }
    }))
  }
  const handleArrayItemUpdate = () => {
    setComplexState((prev: { value: typeof complexState.value }) => ({
      ...prev.value,
      items: prev.value.items.map(item =>
        item.id === 1
          ? { ...item, name: item.name === 'item1' ? 'updated item1' : 'item1' }
          : item
      )
    }))
  }

  // 回调函数示例
  const [callbackState, setCallbackState] = useStateSync(0)
  const [callbackResult, setCallbackResult] = useState<string>('')
  const handleCallback = () => {
    setCallbackState(callbackState.value + 10, () => {
      const result = `回调执行时状态值为: ${callbackState.value}`
      setCallbackResult(result)
      console.log(result)
    })
  }

  // 数组类型示例
  const [arrayState, setArrayState] = useStateSync([1, 2, 3])
  const handleArrayUpdate = () => {
    setArrayState((prev: { value: number[] }) => [...prev.value, prev.value.length + 1])
  }
  const handleArrayReset = () => {
    setArrayState([1, 2, 3])
  }

  // null/undefined 处理示例
  const [nullState, setNullState] = useStateSync<number | null>(null)
  const handleNullToggle = () => {
    setNullState(nullState.value === null ? 10 : null)
  }

  // 多次连续更新示例
  const [multiState, setMultiState] = useStateSync(0)
  const handleMultiUpdate = () => {
    setMultiState(1)
    setMultiState(2)
    setMultiState(3)
  }
  const handleMultiFuncUpdate = () => {
    setMultiState((prev: { value: number }) => prev.value + 1)
    setMultiState((prev: { value: number }) => prev.value + 1)
  }

  // valueOf 访问方式示例
  const [valueOfState, setValueOfState] = useStateSync(42)
  const handleValueOfUpdate = () => {
    setValueOfState(Number(valueOfState) + 1)
  }

  return (
    <div className="app">
      <h1>useStateSync 可视化测试</h1>
      
      <section className="comparison-section">
        <h2>1. 基本类型更新</h2>
        <div className="card">
          <button onClick={handleClick}>
            count is {state.value}
          </button>
        </div>
        <p className="note">
          点击按钮后，控制台会打印更新后的值（通过回调获取）
        </p>
      </section>

      <section className="comparison-section">
        <h2>2. useState 对比示例</h2>
        <div className="card">
          <button onClick={handleStateClick}>
            count is {countState}
          </button>
        </div>
        <p className="note">
          点击按钮后，控制台会显示闭包问题和函数式更新的差异
        </p>
      </section>

      <section className="comparison-section">
        <h2>3. 函数式更新</h2>
        <div className="card">
          <div>当前值: {funcState.value}</div>
          <button onClick={handleFuncUpdate}>
            函数式更新 (+10)
          </button>
        </div>
        <p className="note">
          使用函数式更新，每次点击增加 10
        </p>
      </section>

      <section className="comparison-section">
        <h2>4. 深层嵌套对象</h2>
        <div className="card">
          <div>
            深层值: {deepState.value.level1.level2.level3.level4.value}
          </div>
          <button onClick={handleDeepUpdate}>
            切换深层值
          </button>
        </div>
        <p className="note">
          测试深层嵌套对象的同步更新
        </p>
      </section>

      <section className="comparison-section">
        <h2>5. 复杂对象结构</h2>
        <div className="card">
          <div>
            <div>用户名: {complexState.value.user.profile.name}</div>
            <div>年龄: {complexState.value.user.profile.age}</div>
            <div>城市: {complexState.value.user.profile.address.city}</div>
            <div>主题: {complexState.value.user.settings.theme}</div>
            <div>项目数: {complexState.value.items.length}</div>
            <div style={{ marginTop: '10px' }}>
              <div>项目列表:</div>
              {complexState.value.items.map(item => (
                <div key={item.id} style={{ marginLeft: '20px' }}>
                  ID: {item.id}, 名称: {item.name}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleComplexUpdate}>
            切换用户名
          </button>
          <button onClick={handleArrayItemUpdate}>
            更新数组第一项
          </button>
        </div>
        <p className="note">
          测试复杂对象结构的部分更新，包括数组项的更新
        </p>
      </section>

      <section className="comparison-section">
        <h2>6. 回调函数</h2>
        <div className="card">
          <div>当前值: {callbackState.value}</div>
          <div style={{ minHeight: '20px', margin: '10px 0' }}>
            {callbackResult && <div style={{ color: 'green' }}>{callbackResult}</div>}
          </div>
          <button onClick={handleCallback}>
            更新并执行回调 (+10)
          </button>
        </div>
        <p className="note">
          回调函数在状态更新后执行，可以同步访问最新状态
        </p>
      </section>

      <section className="comparison-section">
        <h2>7. 数组类型</h2>
        <div className="card">
          <div>数组: [{arrayState.value.join(', ')}]</div>
          <div>长度: {arrayState.value.length}</div>
          <div>
            <button onClick={handleArrayUpdate}>添加元素</button>
            <button onClick={handleArrayReset} style={{ marginLeft: '10px' }}>重置</button>
          </div>
        </div>
        <p className="note">
          测试数组的初始化和函数式更新
        </p>
      </section>

      <section className="comparison-section">
        <h2>8. null/undefined 处理</h2>
        <div className="card">
          <div>当前值: {nullState.value === null ? 'null' : nullState.value}</div>
          <button onClick={handleNullToggle}>
            切换 null/数值
          </button>
        </div>
        <p className="note">
          测试 null 和 undefined 值的正确处理
        </p>
      </section>

      <section className="comparison-section">
        <h2>9. 多次连续更新</h2>
        <div className="card">
          <div>当前值: {multiState.value}</div>
          <div>
            <button onClick={handleMultiUpdate}>连续设置为 1,2,3</button>
            <button onClick={handleMultiFuncUpdate} style={{ marginLeft: '10px' }}>
              函数式连续 +1, +1
            </button>
          </div>
        </div>
        <p className="note">
          测试多次连续更新时状态的一致性
        </p>
      </section>

      <section className="comparison-section">
        <h2>10. valueOf 访问方式</h2>
        <div className="card">
          <div>通过 valueOf 访问: {Number(valueOfState)}</div>
          <div>通过 .value 访问: {valueOfState.value}</div>
          <button onClick={handleValueOfUpdate}>
            更新 (+1)
          </button>
        </div>
        <p className="note">
          测试 getState 的 valueOf 方式调用
        </p>
      </section>
    </div>
  )
}

export default App

