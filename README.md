# useStateSync

一个解决 React `useState` 闭包问题的状态管理 Hook，让你在任何位置都能访问到最新的状态值。

## ✨ 特性

- 🔄 **同步状态访问** - 通过 Proxy 实现，在 `setState` 后立即可以访问最新状态值
- 🎯 **回调支持** - 支持状态更新后的回调函数，回调中可以访问最新状态
- 📦 **类型安全** - 完整的 TypeScript 类型定义
- 🔧 **函数式更新** - 支持函数式更新，类似原生 `useState`
- 🎨 **复杂对象支持** - 完美支持深层嵌套对象和数组
- ⚡️ **零依赖** - 只依赖 React，无其他外部依赖
- 🚀 **轻量级** - 代码简洁，性能优异

## 📦 安装

```bash
npm install use-state-sync
# 或
pnpm add use-state-sync
# 或
yarn add use-state-sync
```

## 🚀 快速开始

### 基本用法

```tsx
import useStateSync from 'use-state-sync'

function App() {
  const [state, setState] = useStateSync(0)

  const handleClick = () => {
    setState(state.value + 1, () => {
      // 回调中可以访问到最新的状态值
      console.log('最新值:', state.value) // 输出: 最新值: 1
    })
    // 即使在 setState 后立即访问，也能获取到最新值
    console.log('更新后的值:', state.value) // 输出: 更新后的值: 1
  }

  return (
    <div>
      <p>当前值: {state.value}</p>
      <button onClick={handleClick}>增加</button>
    </div>
  )
}
```

### 与 useState 的对比

```tsx
import { useState } from 'react'
import useStateSync from 'use-state-sync'

function Comparison() {
  // ❌ useState 的问题：闭包导致无法立即访问最新值
  const [count, setCount] = useState(0)
  const handleStateClick = () => {
    setCount(count + 1)
    console.log(count) // 仍然是旧值 0，不是 1
  }

  // ✅ useStateSync：可以立即访问最新值
  const [state, setState] = useStateSync(0)
  const handleSyncClick = () => {
    setState(state.value + 1)
    console.log(state.value) // 已经是新值 1
  }

  return (
    <div>
      <button onClick={handleStateClick}>useState: {count}</button>
      <button onClick={handleSyncClick}>useStateSync: {state.value}</button>
    </div>
  )
}
```

## 📚 API 文档

### useStateSync(initialState)

返回一个包含状态对象和更新函数的元组。

#### 参数

- `initialState: T | (() => T)` - 初始状态值，可以是值或返回值的函数

#### 返回值

返回 `[state, setStateEffect]` 元组：

- `state: StateObject<T>` - 状态对象，通过 `state.value` 访问状态值
- `setStateEffect: SetStateEffect<T>` - 状态更新函数

#### setStateEffect(newState, callback?)

更新状态的函数。

**参数：**
- `newState: T | StateUpdater<T>` - 新状态值或更新函数
- `callback?: () => void` - 可选的回调函数，在状态更新后执行

**示例：**

```tsx
// 直接设置新值
setState(10)

// 函数式更新
setState((prev) => prev.value + 1)

// 带回调
setState(10, () => {
  console.log('状态已更新:', state.value)
})

// 函数式更新 + 回调
setState((prev) => prev.value + 1, () => {
  console.log('新值:', state.value)
})
```

## 💡 使用示例

### 1. 基本类型

```tsx
const [count, setCount] = useStateSync(0)

setCount(count.value + 1)
setCount((prev) => prev.value + 10)
```

### 2. 对象类型

```tsx
const [user, setUser] = useStateSync({
  name: 'John',
  age: 30
})

setUser({
  ...user.value,
  name: 'Jane'
})

setUser((prev) => ({
  ...prev.value,
  age: prev.value.age + 1
}))
```

### 3. 深层嵌套对象

```tsx
function DeepNestedComponent() {
  const [deepState, setDeepState] = useStateSync({
    level1: {
      level2: {
        level3: {
          value: 'deep-value'
        }
      }
    }
  })

  const handleUpdate = () => {
    setDeepState((prev) => ({
      ...prev.value,
      level1: {
        ...prev.value.level1,
        level2: {
          ...prev.value.level1.level2,
          level3: {
            ...prev.value.level1.level2.level3,
            value: 'new-deep-value'
          }
        }
      }
    }))
  }

  return (
    <div>
      <p>当前值: {deepState.value.level1.level2.level3.value}</p>
      <button onClick={handleUpdate}>更新深层值</button>
    </div>
  )
}
```

### 4. 数组操作

```tsx
interface Item {
  id: number
  name: string
}

function ArrayComponent() {
  const [items, setItems] = useStateSync<Item[]>([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ])

  const handleAdd = () => {
    // 添加元素
    setItems((prev) => [...prev.value, { id: Date.now(), name: `Item ${prev.value.length + 1}` }])
  }

  const handleUpdate = (id: number) => {
    // 更新特定项
    setItems((prev) => 
      prev.value.map(item => 
        item.id === id ? { ...item, name: 'updated' } : item
      )
    )
  }

  const handleRemove = (id: number) => {
    // 删除元素
    setItems((prev) => prev.value.filter(item => item.id !== id))
  }

  return (
    <div>
      <ul>
        {items.value.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => handleUpdate(item.id)}>更新</button>
            <button onClick={() => handleRemove(item.id)}>删除</button>
          </li>
        ))}
      </ul>
      <button onClick={handleAdd}>添加元素</button>
    </div>
  )
}
```

### 5. 回调函数

```tsx
const [count, setCount] = useStateSync(0)

setCount(count.value + 1, () => {
  // 回调中可以访问到最新的状态值
  console.log('更新后的值:', count.value)
  
  // 可以执行其他操作
  fetchData(count.value)
})
```

### 6. valueOf 访问方式

```tsx
const [count, setCount] = useStateSync(42)

// 通过 valueOf 访问（用于类型转换）
const value = Number(count) // 42

// 通过 toString 访问
const str = String(count) // "42"
```

## 🏗️ 项目结构

这是一个基于 pnpm workspace 的 monorepo 项目：

```
useStateSync/
├── apps/
│   └── web/                    # React 19 + Vite 5 演示应用
│       ├── src/
│       │   ├── App.tsx         # 功能演示和对比
│       │   └── App.test.tsx   # 单元测试
│       └── package.json
├── packages/
│   └── core/                   # 核心 Hook 包
│       ├── src/
│       │   └── index.ts        # useStateSync 实现
│       └── package.json
├── package.json                # 根 package.json
└── pnpm-workspace.yaml
```

## 🛠️ 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 运行演示应用（包含完整的使用示例）
pnpm dev

# 运行特定应用
pnpm --filter ./apps/web dev
```

### 构建

```bash
# 构建核心包
pnpm build

# 构建并监听文件变化
pnpm build:debug
```

### 测试

```bash
# 运行测试
pnpm test

# 运行测试（UI 模式）
pnpm test:ui

# 生成测试覆盖率报告
pnpm test:coverage
```

### 预览

```bash
# 预览构建后的应用
pnpm preview
```

## 🧪 测试

项目包含完整的单元测试，覆盖以下场景：

- ✅ 基本类型状态管理
- ✅ 函数式更新
- ✅ 深层嵌套对象
- ✅ 复杂对象结构
- ✅ 回调函数
- ✅ 数组操作
- ✅ 边界情况（null/undefined）
- ✅ 多次连续更新
- ✅ valueOf 访问方式

测试文件位于 `apps/web/src/App.test.tsx`。

## 🔍 工作原理

`useStateSync` 使用 `Proxy` 和 `useRef` 来实现状态同步访问：

1. 使用 `useRef` 保存最新的状态值
2. 通过 `Proxy` 创建一个状态对象，所有属性访问都返回最新值
3. 状态更新时，立即更新 ref，然后触发 React 状态更新
4. 通过 `useEffect` 在状态更新后执行回调函数

这样确保了无论在何处访问 `state.value`，都能获取到最新的状态值。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
https://github.com/Jiayou828/use-state-sync

## 📄 许可证

ISC

## 技术栈

- **包管理**: pnpm workspace
- **React**: 19.0.0
- **构建工具**: Vite 5.4.0
- **TypeScript**: 5.5.0
- **测试框架**: Vitest