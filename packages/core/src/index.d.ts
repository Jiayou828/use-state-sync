/**
 * 状态对象类型
 * 可以通过属性访问直接获取最新状态值，类似 useState 的使用方式
 * 访问任何属性都会返回最新的状态值
 */
type StateObject<T> = {
  readonly value: T;
  // 支持其他属性的访问，都返回最新状态值
  readonly [key: string]: T;
};

/**
 * 设置状态的回调函数类型
 */
type CallbackFn = (() => void) | null | undefined;

/**
 * 状态更新函数类型
 * 用于函数式更新状态，接收当前状态对象并返回新状态值
 */
type StateUpdater<T> = (prevState: StateObject<T>) => T;

/**
 * 更新状态的函数类型
 * 支持直接传入新状态值或使用函数式更新
 * 
 * @param newState - 新状态值或更新函数
 * @param callback - 状态更新后执行的回调（可选）
 */
type SetStateEffect<T> = (
  newState: T | StateUpdater<T>,
  callback?: CallbackFn
) => void;

/**
 * 初始状态类型（支持函数形式的惰性初始化）
 */
type InitialState<T> = T | (() => T);

/**
 * 同步版本的 useState，支持更新回调函数
 * 
 * @template T 状态值的类型
 * @param initialState - 初始状态值或初始化函数
 * @returns [state, setStateEffect] - 返回状态对象和设置状态的函数
 * 
 * @example
 * ```ts
 * // 基本用法（与 useState 类似的使用习惯）
 * const [state, setState] = useStateSync(0);
 * setState(1, () => console.log('Updated'));
 * console.log(state.value); // 1，直接访问属性获取最新值
 * 
 * // 函数式更新
 * setState(prev => prev.value + 1);
 * 
 * // 惰性初始化
 * const [state, setState] = useStateSync(() => expensiveComputation());
 * ```
 */
declare function useStateSync<T>(
  initialState?: InitialState<T>
): readonly [state: StateObject<T>, setStateEffect: SetStateEffect<T>];

export default useStateSync;