/**
*  无限滚动组件,默认从左向右无限滚动;
* 
*/


/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { FC, ReactElement, useEffect, useState, useRef } from 'react'

interface Props {
  /** 指定高度 */ 
  height: number;
  children: ReactElement[];
  /** 反向滚动, 默认从左向右 */ 
  reverse?: boolean;
}

/** 将数组最后一位移动到第一位 */ 
function transLast2Fir(arr: any[]) {
  const newArr = [...arr]
  const last = newArr.pop()
  newArr.unshift(last)
  return newArr
}

/** 将数组第一位移动到最后一位 */ 
function transFir2Last(arr: any[]) {
  const newArr = [...arr]
  const last = newArr.shift()
  newArr.push(last)
  
  return newArr
}

const ScrollInfinite: FC<Props> = props => {
  const [translateX, setTranslateX] = useState(0);
  const refs = useRef<{[k: string]: any}>({});
  const nextEleWidthRef = useRef(0);
  const [elements, setElements] = useState(() => addRef(props.children));


  /** 记录下一次需要移出的宽度 */ 
  function recordNextWidth(renders: any[]) {
    const nextEle = props.reverse ? renders[0] : renders[renders.length - 1]
    nextEleWidthRef.current = nextEle?.ref?.current?.clientWidth
  }

  /**  为每一项增加ref,方便获取宽度 */
  function addRef(arr: {[k: string]: any}[]) { 
    return arr.map(item => {
      const refKey = item.key 
      // @ts-ignore
      refs[refKey] = {current: null}
      // @ts-ignore
      return ({...item, ref: refs[refKey]})
    });
  }


  useEffect(() => {
    const timer = setInterval(() => {
      setTranslateX(x => {
        if(!nextEleWidthRef.current) { // 无下一个元素宽度时,尝试记录
          recordNextWidth(elements);
        }
        const nextPosition = x + 0.5;
        const outOfrange = nextPosition > (nextEleWidthRef.current || 100000)
        if(outOfrange) {// 超出后修改元素位置
          setElements(oldElements => {
            const newElements = props.reverse ? transFir2Last(oldElements) :  transLast2Fir(oldElements)
            recordNextWidth(newElements);
            return newElements
          }) ; 
        }
        return outOfrange ? 0 : nextPosition;
        
      });
    }, 20)
    return () => clearInterval(timer)
  }, [])

  return (
    <div css={css`width:100%;height:${props.height}px;overflow:hidden;position:relative`}>
      <div css={css`display:flex;position:absolute;`} style={{ [props.reverse ? 'left' : 'right']:`-${translateX}px` }}>
        {/* @ts-ignore */}
        {elements}
      </div>
    </div>
  )
}

export default ScrollInfinite
